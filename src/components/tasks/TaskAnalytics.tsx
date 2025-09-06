'use client';

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Calendar } from 'lucide-react';
import {
  isToday,
  isThisWeek,
  startOfWeek,
  endOfWeek,
  format,
} from 'date-fns';

interface TaskAnalyticsProps {
  tasks: Task[];
}

export default function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date();

    const dailyTasks = tasks.filter((task) =>
      isToday(new Date(task.dueDate))
    );
    const completedDailyTasks = dailyTasks.filter(
      (task) => task.isCompleted
    ).length;
    const dailyProgress =
      dailyTasks.length > 0
        ? (completedDailyTasks / dailyTasks.length) * 100
        : 0;

    const weeklyTasks = tasks.filter((task) =>
      isThisWeek(new Date(task.dueDate), {
        weekStartsOn: 1 /* Monday */,
      })
    );
    const completedWeeklyTasks = weeklyTasks.filter(
      (task) => task.isCompleted
    ).length;
    const weeklyProgress =
      weeklyTasks.length > 0
        ? (completedWeeklyTasks / weeklyTasks.length) * 100
        : 0;

    return {
      daily: {
        total: dailyTasks.length,
        completed: completedDailyTasks,
        progress: dailyProgress,
      },
      weekly: {
        total: weeklyTasks.length,
        completed: completedWeeklyTasks,
        progress: weeklyProgress,
        range: `${format(
          startOfWeek(now, { weekStartsOn: 1 }),
          'MMM d'
        )} - ${format(endOfWeek(now, { weekStartsOn: 1 }), 'MMM d')}`,
      },
    };
  }, [tasks]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Activity className="text-primary" />
          Your Productivity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Today's Progress
            </h3>
            <span className="text-sm font-bold text-primary">
              {analytics.daily.completed} / {analytics.daily.total} tasks
            </span>
          </div>
          <Progress value={analytics.daily.progress} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              This Week's Progress ({analytics.weekly.range})
            </h3>
            <span className="text-sm font-bold text-primary">
              {analytics.weekly.completed} / {analytics.weekly.total} tasks
            </span>
          </div>
          <Progress value={analytics.weekly.progress} className="h-2" />
        </div>
        {analytics.daily.total === 0 && analytics.weekly.total === 0 && (
            <p className="text-sm text-muted-foreground text-center pt-4">No tasks scheduled for today or this week. Add some tasks to see your progress!</p>
        )}
      </CardContent>
    </Card>
  );
}
