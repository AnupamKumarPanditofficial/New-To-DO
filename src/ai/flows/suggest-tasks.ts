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
  prompt: z.string().describe('The user\'s mood or goal, e.g., "feeling sad", "exam prep"'),
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
    prompt: `You are a helpful and positive assistant. The user is looking for task suggestions based on their current state: {{{prompt}}}.

    Please provide a list of 3-5 short, simple, and actionable tasks that could help them.
    
    Examples:
    - If the prompt is "feeling sad", you could suggest: "Listen to your favorite upbeat song", "Go for a short walk outside", "Write down three things you're grateful for".
    - If the prompt is "exam prep", you could suggest: "Review chapter 4 notes for 25 minutes", "Create flashcards for key concepts", "Plan your study schedule for the week".
    - If the prompt is "feeling bored", you could suggest: "Try a 15-minute doodle session", "Learn a new magic trick on YouTube", "Organize a bookshelf or drawer".

    Keep the tasks concise and encouraging.
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
