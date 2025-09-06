'use client';

import { useState, useEffect, useRef } from 'react';
import { getTaskReminders } from '@/ai/flows/intelligent-task-reminders';
import type { Task } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlarmClock } from 'lucide-react';

interface TaskRemindersProps {
  tasks: Task[];
}

interface Reminder {
  taskName: string;
  dueDate: string;
  reminderMessage: string;
}

export default function TaskReminders({ tasks }: TaskRemindersProps) {
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [remindersQueue, setRemindersQueue] = useState<Reminder[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Only check for reminders if there are incomplete tasks and it's been at least a minute
      if (tasks.some(t => !t.isCompleted) && (!lastChecked || new Date().getTime() - lastChecked.getTime() > 60000)) {
        setLastChecked(new Date());
        const incompleteTasks = tasks
          .filter(task => !task.isCompleted)
          .map(task => ({
            taskName: task.title,
            dueDate: task.dueDate,
            completed: task.isCompleted,
          }));

        try {
          const response = await getTaskReminders({
            currentTime: new Date().toISOString(),
            tasks: incompleteTasks,
          });

          if (response.reminders && response.reminders.length > 0) {
            setRemindersQueue(q => [...q, ...response.reminders]);
          }
        } catch (error) {
          console.error("Failed to get task reminders:", error);
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [tasks, lastChecked]);

  useEffect(() => {
    if (!activeReminder && remindersQueue.length > 0) {
      const [nextReminder, ...rest] = remindersQueue;
      setActiveReminder(nextReminder);
      setRemindersQueue(rest);
    }
  }, [remindersQueue, activeReminder]);

  useEffect(() => {
    if (activeReminder && audioRef.current) {
      audioRef.current.play().catch(error => {
        // Autoplay was prevented.
        console.warn("Reminder sound autoplay was blocked by the browser.");
      });
    }
  }, [activeReminder]);

  const closeReminder = () => {
    setActiveReminder(null);
  };

  return (
    <>
      <audio ref={audioRef} src="https://firebasestorage.googleapis.com/v0/b/firebase-studio-demos.appspot.com/o/asset-files%2Fnotification.mp3?alt=media&token=4653ea9a-5264-4439-9512-140b99c7b9b3" preload="auto" />
      <AlertDialog open={!!activeReminder} onOpenChange={(open) => !open && closeReminder()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-accent">
              <AlarmClock className="h-6 w-6" />
              Task Reminder!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground text-base pt-4">
              <p className="font-bold pb-2">Task: {activeReminder?.taskName}</p>
              {activeReminder?.reminderMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeReminder} className="bg-accent hover:bg-accent/90">
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
