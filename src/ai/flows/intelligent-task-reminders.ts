// src/ai/flows/intelligent-task-reminders.ts
'use server';

/**
 * @fileOverview An intelligent task reminder system using LLM.
 *
 * - getTaskReminders - A function that gets reminders for upcoming tasks.
 * - GetTaskRemindersInput - The input type for the getTaskReminders function.
 * - GetTaskRemindersOutput - The return type for the getTaskReminders function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetTaskRemindersInputSchema = z.object({
  currentTime: z.string().describe('The current date and time.'),
  tasks: z.array(
    z.object({
      taskName: z.string().describe('The name of the task.'),
      dueDate: z.string().describe('The due date and time of the task.'),
      completed: z.boolean().describe('Whether the task is completed or not.'),
    })
  ).describe('A list of tasks with their due dates.'),
});
export type GetTaskRemindersInput = z.infer<typeof GetTaskRemindersInputSchema>;

const GetTaskRemindersOutputSchema = z.object({
  reminders: z.array(
    z.object({
      taskName: z.string().describe('The name of the task.'),
      dueDate: z.string().describe('The due date and time of the task.'),
      reminderMessage: z.string().describe('The reminder message for the task.'),
    })
  ).describe('A list of reminders for upcoming tasks.'),
});
export type GetTaskRemindersOutput = z.infer<typeof GetTaskRemindersOutputSchema>;

export async function getTaskReminders(input: GetTaskRemindersInput): Promise<GetTaskRemindersOutput> {
  return getTaskRemindersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getTaskRemindersPrompt',
  input: { schema: GetTaskRemindersInputSchema },
  output: { schema: GetTaskRemindersOutputSchema },
  prompt: `You are a personal assistant helping users manage their tasks and deadlines.
  Given the current time and a list of tasks with their due dates, determine which tasks require a reminder.
  A task requires a reminder if it is not completed and the due date is approaching.
  Create a reminder message for each task that requires a reminder.

Current Time: {{{currentTime}}}

Tasks:
{{#each tasks}}
  - Task Name: {{{taskName}}}, Due Date: {{{dueDate}}}, Completed: {{{completed}}}
{{/each}}

Reminders:
{{#if reminders}}
  {{#each reminders}}
    - Task Name: {{{taskName}}}, Due Date: {{{dueDate}}}, Reminder Message: {{{reminderMessage}}}
  {{/each}}
{{else}}
  No reminders needed.
{{/if}}`,
});

const getTaskRemindersFlow = ai.defineFlow(
  {
    name: 'getTaskRemindersFlow',
    inputSchema: GetTaskRemindersInputSchema,
    outputSchema: GetTaskRemindersOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
