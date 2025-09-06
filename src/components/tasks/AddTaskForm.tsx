'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AddTaskFormProps {
  onAddTask: (title: string, dueDate: Date) => void;
}

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Task title cannot be empty.", variant: "destructive" });
      return;
    }
    if (!dueDate) {
      toast({ title: "Please select a due date.", variant: "destructive" });
      return;
    }
    if (!time) {
      toast({ title: "Please select a time.", variant: "destructive"});
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(dueDate);
    combinedDate.setHours(hours, minutes, 0, 0);

    if (combinedDate < new Date()) {
      toast({ title: "Due date and time cannot be in the past.", variant: "destructive" });
      return;
    }

    onAddTask(title, combinedDate);
    setTitle('');
    setDueDate(undefined);
    setTime('');
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if(!selectedDate) {
      setDueDate(undefined);
      return;
    }
    // Preserve time if it's already set
    if (dueDate) {
        selectedDate.setHours(dueDate.getHours());
        selectedDate.setMinutes(dueDate.getMinutes());
    }
    setDueDate(selectedDate);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <PlusCircle className="text-primary"/>
            Create a New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
          <Input
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow text-base"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full sm:w-[240px] justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
           <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full sm:w-[120px]"
          />
          <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
