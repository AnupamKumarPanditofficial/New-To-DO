'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CollabGroup, User } from '@/lib/types';
import { isThisWeek, startOfWeek } from 'date-fns';

interface FriendsAnalyticsChartProps {
  group: CollabGroup;
  currentUser: User | null;
}

export default function FriendsAnalyticsChart({ group, currentUser }: FriendsAnalyticsChartProps) {
  const chartData = useMemo(() => {
    return group.members.map((member) => {
      const weeklyTasks = member.tasks.filter((task) =>
        isThisWeek(new Date(task.dueDate), { weekStartsOn: 1 })
      );
      const completedWeeklyTasks = weeklyTasks.filter(
        (task) => task.isCompleted
      ).length;
      const weeklyProgress =
        weeklyTasks.length > 0
          ? (completedWeeklyTasks / weeklyTasks.length) * 100
          : 0;

      return {
        name: member.id === currentUser?.id ? 'You' : member.name,
        'Weekly Completion (%)': weeklyProgress,
      };
    });
  }, [group, currentUser]);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip
             contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
             }}
          />
          <Legend />
          <Bar dataKey="Weekly Completion (%)" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
