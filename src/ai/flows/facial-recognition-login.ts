'use server';

/**
 * @fileOverview Implements facial recognition login using a Genkit flow.
 *
 * - facialRecognitionLogin - A function that handles the facial recognition login process.
 * - FacialRecognitionLoginInput - The input type for the facialRecognitionLogin function.
 * - FacialRecognitionLoginOutput - The return type for the facialRecognitionLogin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FacialRecognitionLoginInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FacialRecognitionLoginInput = z.infer<
  typeof FacialRecognitionLoginInputSchema
>;

const FacialRecognitionLoginOutputSchema = z.object({
  userId: z
    .string()
    .describe('The ID of the user identified by facial recognition.'),
  isLoginSuccessful: z
    .boolean()
    .describe('Whether or not the login was successful.'),
});
export type FacialRecognitionLoginOutput = z.infer<
  typeof FacialRecognitionLoginOutputSchema
>;

export async function facialRecognitionLogin(
  input: FacialRecognitionLoginInput
): Promise<FacialRecognitionLoginOutput> {
  return facialRecognitionLoginFlow(input);
}

const facialRecognitionLoginPrompt = ai.definePrompt({
  name: 'facialRecognitionLoginPrompt',
  input: {schema: FacialRecognitionLoginInputSchema},
  output: {schema: FacialRecognitionLoginOutputSchema},
  prompt: `You are an AI facial recognition system.

You are given a photo of a user's face. You must determine if the face matches a user in the database.

If the face is recognized, return the userId of the matching user and set isLoginSuccessful to true.
If the face is not recognized, return an empty userId and set isLoginSuccessful to false.

Photo: {{media url=photoDataUri}}`,
});

const facialRecognitionLoginFlow = ai.defineFlow(
  {
    name: 'facialRecognitionLoginFlow',
    inputSchema: FacialRecognitionLoginInputSchema,
    outputSchema: FacialRecognitionLoginOutputSchema,
  },
  async input => {
    const {output} = await facialRecognitionLoginPrompt(input);
    return output!;
  }
);
