'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import TaskList from '@/components/tasks/TaskList';
import TaskReminders from '@/components/tasks/TaskReminders';
import type { User, Task, CollabGroup } from '@/lib/types';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import TaskAnalytics from '@/components/tasks/TaskAnalytics';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import TaskSuggestions from '@/components/tasks/TaskSuggestions';


export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupId, setGroupId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('facetask_session');
    const storedUser = localStorage.getItem('facetask_user');

    if (!session || !storedUser) {
      router.replace('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const storedGroupId = localStorage.getItem(`facetask_group_${parsedUser.id}`);
    setGroupId(storedGroupId);

    let unsubscribe: (() => void) | undefined;

    if (storedGroupId) {
      // User is in a group, listen to group changes
      const groupRef = doc(db, 'collabGroups', storedGroupId);
      unsubscribe = onSnapshot(groupRef, (docSnap) => {
        if (docSnap.exists()) {
          const groupData = docSnap.data() as CollabGroup;
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
        if (groupId) {
          // Firestore sync
          const groupRef = doc(db, 'collabGroups', groupId);
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
  }, [tasks, user, groupId, isLoading]);

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
      <Header user={user} />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="space-y-8">
          <div className="flex justify-end">
            <Button onClick={() => router.push('/collab')}>
              <Users className="mr-2 h-4 w-4" />
              Collaboration
            </Button>
          </div>
          <AddTaskForm onAddTask={addTask} />
          <TaskSuggestions onAddTask={addTask} />
          <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
          <TaskAnalytics tasks={tasks} />
        </div>
      </main>
      <TaskReminders tasks={tasks} />
    </div>
  );
}
