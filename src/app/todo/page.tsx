'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import TaskList from '@/components/tasks/TaskList';
import TaskReminders from '@/components/tasks/TaskReminders';
import type { User, Task } from '@/lib/types';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import TaskAnalytics from '@/components/tasks/TaskAnalytics';

export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('facetask_session');
    const storedUser = localStorage.getItem('facetask_user');

    if (!session || !storedUser) {
      router.replace('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const storedTasks = localStorage.getItem(`facetask_tasks_${parsedUser.id}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      // Clear corrupted data and redirect
      localStorage.clear();
      router.replace('/');
      return;
    }

    setIsLoading(false);
  }, [router]);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem(`facetask_tasks_${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  const addTask = (title: string, dueDate: Date) => {
    if (!user) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      dueDate: dueDate.toISOString(),
      isCompleted: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
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
          <AddTaskForm onAddTask={addTask} />
          <TaskAnalytics tasks={tasks} />
          <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
        </div>
      </main>
      <TaskReminders tasks={tasks} />
    </div>
  );
}
