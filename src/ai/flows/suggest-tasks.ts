'use server';
/**
 * @fileOverview Suggests tasks based on user's mood or goal.
 *
 * - suggestTasks - A function that suggests tasks.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestTasksInputSchema = z.object({
  prompt: z.string().describe('The user\'s mood or general goal, e.g., "feeling sad", "get productive"'),
  examName: z.string().optional().describe('The name of the exam the user is studying for.'),
  examDuration: z.number().optional().describe('The total duration of the study plan in days.'),
  currentDay: z.number().optional().describe('The current day number in the study plan.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-5 short, actionable task suggestions.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
    return suggestTasksFlow(input);
}


const prompt = ai.definePrompt({
    name: 'suggestTasksPrompt',
    input: { schema: SuggestTasksInputSchema },
    output: { schema: SuggestTasksOutputSchema },
    prompt: `
    {{#if examName}}
      You are an expert mentor and tutor. Your role is to create a daily study plan for a user preparing for an exam.
      The user is on Day {{currentDay}} of a {{examDuration}}-day study plan for the "{{examName}}" exam.
      
      Analyze the user's progress (Day {{currentDay}} out of {{examDuration}}) and provide 3-5 specific, actionable tasks for today.
      The plan should be progressive. Early days should focus on fundamentals, while later days should cover advanced topics, practice tests, and revision.
      
      - If it's an early day (e.g., first 25% of the duration), focus on foundational concepts, setting up a study environment, and understanding the exam structure.
      - In the middle (25-75%), focus on core topics, deeper dives, and practice problems for specific sections.
      - In the later stages (last 25%), focus on full-length mock exams, reviewing weak areas, and time management strategies.
      
      Today's tasks for Day {{currentDay}} should be a logical step in this progression. Keep the tasks clear and concise.
    {{else}}
      You are a helpful and positive assistant. The user is looking for task suggestions based on their current state: {{{prompt}}}.

      Please provide a list of 3-5 short, simple, and actionable tasks that could help them.
      
      Examples:
      - If the prompt is "feeling sad", you could suggest: "Listen to your favorite upbeat song", "Go for a short walk outside", "Write down three things you're grateful for".
      - If the prompt is "get productive", you could suggest: "Tidy up your workspace for 10 minutes", "Write down your top 3 priorities for today", "Do a 5-minute stretching routine".
      - If the prompt is "feeling bored", you could suggest: "Try a 15-minute doodle session", "Learn a new magic trick on YouTube", "Organize a bookshelf or drawer".

      Keep the tasks concise and encouraging.
    {{/if}}
    `
});


const suggestTasksFlow = ai.defineFlow(
    {
      name: 'suggestTasksFlow',
      inputSchema: SuggestTasksInputSchema,
      outputSchema: SuggestTasksOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );
