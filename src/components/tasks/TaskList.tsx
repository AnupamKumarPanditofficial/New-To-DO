'use client';

import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckSquare, ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {

  const upcomingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><ListTodo className="text-primary"/>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
            {upcomingTasks.length > 0 ? (
                 <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                 </div>
            ) : (
                <p className="text-muted-foreground text-center p-8">Nothing to do. Time to relax! 🎉</p>
            )}
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><CheckSquare className="text-green-500"/>Completed</CardTitle>
        </CardHeader>
        <CardContent>
            {completedTasks.length > 0 ? (
                 <div className="space-y-3">
                    {completedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                 </div>
            ) : (
                <p className="text-muted-foreground text-center p-8">No tasks completed yet.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
