'use client';

import { formatDistanceToNow } from 'date-fns';
import { Trash2, Calendar } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const dueDate = new Date(task.dueDate);
  const isOverdue = !task.isCompleted && new Date() > dueDate;

  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out transform hover:shadow-md hover:-translate-y-1",
        task.isCompleted ? "bg-muted/50" : "bg-card"
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggle(task.id)}
          className="h-5 w-5"
          aria-label={`Mark task ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-grow grid gap-1">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "font-medium cursor-pointer",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </label>
          <div className={cn(
            "flex items-center gap-2 text-xs",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}>
            <Calendar className="h-3 w-3" />
            <span>
              {isOverdue ? 'Was due' : 'Due'} {formatDistanceToNow(dueDate, { addSuffix: true })}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label={`Delete task ${task.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
