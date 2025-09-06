'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import TaskList from '@/components/tasks/TaskList';
import TaskReminders from '@/components/tasks/TaskReminders';
import type { User, Task, CollabGroup, Purpose } from '@/lib/types';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import TaskAnalytics from '@/components/tasks/TaskAnalytics';
import { Button } from '@/components/ui/button';
import { Users, Pencil } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import TaskSuggestions from '@/components/tasks/TaskSuggestions';
import SetPurposeDialog from '@/components/purpose/SetPurposeDialog';
import { useToast } from '@/hooks/use-toast';
import StreakTracker from '@/components/tasks/StreakTracker';
import { differenceInCalendarDays, startOfToday, parseISO } from 'date-fns';


export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<CollabGroup | null>(null);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [isPurposeDialogOpen, setIsPurposeDialogOpen] = useState(false);
  const [streakInfo, setStreakInfo] = useState<{ dayCount: number, missedDays: number }>({ dayCount: 0, missedDays: 0 });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem('facetask_session');
    const storedUser = localStorage.getItem('facetask_user');

    if (!session || !storedUser) {
      router.replace('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // --- Streak Logic ---
    const today = startOfToday();
    const lastLoginStr = localStorage.getItem(`facetask_last_login_${parsedUser.id}`);
    let lastLoginDate = lastLoginStr ? parseISO(lastLoginStr) : null;
    
    if (lastLoginDate && differenceInCalendarDays(today, lastLoginDate) > 0) {
      // It's a new day since the last login
       localStorage.setItem(`facetask_last_login_${parsedUser.id}`, today.toISOString());
    }
    
    const streakStartStr = localStorage.getItem(`facetask_streak_start_${parsedUser.id}`);

    if (streakStartStr) {
        const streakStartDate = parseISO(streakStartStr);
        // Recalculate based on today's visit
        const newLastLogin = startOfToday();
        localStorage.setItem(`facetask_last_login_${parsedUser.id}`, newLastLogin.toISOString());
        
        const dayCount = differenceInCalendarDays(newLastLogin, streakStartDate) + 1;
        const expectedDays = dayCount;
        const actualLoginsStr = localStorage.getItem(`facetask_logins_${parsedUser.id}`);
        let actualLogins = actualLoginsStr ? new Set(JSON.parse(actualLoginsStr)) : new Set();
        
        if (!actualLogins.has(newLastLogin.toISOString().split('T')[0])) {
            actualLogins.add(newLastLogin.toISOString().split('T')[0]);
            localStorage.setItem(`facetask_logins_${parsedUser.id}`, JSON.stringify(Array.from(actualLogins)));
        }

        const missedDays = expectedDays - actualLogins.size;
        
        setStreakInfo({ dayCount: actualLogins.size, missedDays });

    } else {
        // First login ever for this user
        const newStreakStartDate = startOfToday();
        localStorage.setItem(`facetask_streak_start_${parsedUser.id}`, newStreakStartDate.toISOString());
        localStorage.setItem(`facetask_last_login_${parsedUser.id}`, newStreakStartDate.toISOString());
        localStorage.setItem(`facetask_logins_${parsedUser.id}`, JSON.stringify([newStreakStartDate.toISOString().split('T')[0]]));
        setStreakInfo({ dayCount: 1, missedDays: 0 });
    }


    // Purpose logic
    const storedPurpose = localStorage.getItem(`facetask_purpose_${parsedUser.id}`);
    if (storedPurpose) {
      setPurpose(JSON.parse(storedPurpose));
    } else {
      // First time user, show the purpose dialog
      setIsPurposeDialogOpen(true);
    }
    
    // Group logic
    const storedGroupId = localStorage.getItem(`facetask_group_${parsedUser.id}`);
    
    let unsubscribe: (() => void) | undefined;

    if (storedGroupId) {
      // User is in a group, listen to group changes
      const groupRef = doc(db, 'collabGroups', storedGroupId);
      unsubscribe = onSnapshot(groupRef, (docSnap) => {
        if (docSnap.exists()) {
          const groupData = docSnap.data() as CollabGroup;
          setGroup(groupData);
          const member = groupData.members.find(m => m.id === parsedUser.id);
          setTasks(member?.tasks || []);
        }
        setIsLoading(false);
      });
    } else {
      // User is not in a group, use local storage
      const storedTasks = localStorage.getItem(`facetask_tasks_${parsedUser.id}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      setIsLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);
  
  // This effect syncs tasks to the correct storage (local or Firestore)
  useEffect(() => {
    if (!user || isLoading) return;

    const syncTasks = async () => {
        if (group) {
          // Firestore sync
          const groupRef = doc(db, 'collabGroups', group.id);
          try {
            const docSnap = await getDoc(groupRef);
            if (docSnap.exists()) {
              const groupData = docSnap.data() as CollabGroup;
              const memberExists = groupData.members.some(m => m.id === user.id);
              if (memberExists) {
                const updatedMembers = groupData.members.map(m => 
                    m.id === user.id ? { ...m, tasks } : m
                );
                await updateDoc(groupRef, { members: updatedMembers });
              }
            }
          } catch (error) {
            console.error("Error syncing tasks to Firestore:", error);
          }
        } else {
          // Local storage sync
          localStorage.setItem(`facetask_tasks_${user.id}`, JSON.stringify(tasks));
        }
    };
    
    syncTasks();
  }, [tasks, user, group, isLoading]);
  
  const handlePurposeSet = (newPurpose: Purpose) => {
    if (!user) return;
    setPurpose(newPurpose);
    localStorage.setItem(`facetask_purpose_${user.id}`, JSON.stringify(newPurpose));
    setIsPurposeDialogOpen(false);
    toast({
        title: "Purpose Updated!",
        description: "Your AI suggestions will now be tailored to your new goal."
    });
  }

  const addTask = (title: string, dueDate: Date) => {
    if (!user) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      dueDate: dueDate.toISOString(),
      isCompleted: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
       <SetPurposeDialog 
        isOpen={isPurposeDialogOpen}
        onOpenChange={setIsPurposeDialogOpen}
        onPurposeSet={handlePurposeSet}
        currentPurpose={purpose}
      />
      <Header user={user} />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <StreakTracker dayCount={streakInfo.dayCount} missedDays={streakInfo.missedDays} />
            <Button onClick={() => router.push('/collab')}>
              <Users className="mr-2 h-4 w-4" />
              Collaboration
            </Button>
          </div>
          <div className="text-center">
             <Button variant="outline" onClick={() => setIsPurposeDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Change Your Goal
            </Button>
          </div>
          <AddTaskForm onAddTask={addTask} />
          <TaskSuggestions 
            onAddTask={addTask} 
            purpose={purpose} 
            dayCount={streakInfo.dayCount} 
          />
          <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
          <TaskAnalytics tasks={tasks} />
        </div>
      </main>
      <TaskReminders tasks={tasks} />
    </div>
  );
}
