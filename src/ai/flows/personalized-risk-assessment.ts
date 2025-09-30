'use server';

/**
 * @fileOverview An AI agent that assesses personalized risks based on user location and provides tailored preparedness steps.
 *
 * - personalizedRiskAssessment - A function that handles the risk assessment process.
 * - PersonalizedRiskAssessmentInput - The input type for the personalizedRiskAssessment function.
 * - PersonalizedRiskAssessmentOutput - The return type for the personalizedRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRiskAssessmentInputSchema = z.object({
  location: z
    .string()
    .describe('The location of the user, such as city, state, and country.'),
  localNews: z.string().optional().describe('Optional: Local news and conditions.'),
});
export type PersonalizedRiskAssessmentInput = z.infer<
  typeof PersonalizedRiskAssessmentInputSchema
>;

const PersonalizedRiskAssessmentOutputSchema = z.object({
  risks: z.array(z.string()).describe('A list of potential risks for the user.'),
  preparednessSteps:
    z.array(z.string()).describe('A list of tailored preparedness steps for the user.'),
});
export type PersonalizedRiskAssessmentOutput = z.infer<
  typeof PersonalizedRiskAssessmentOutputSchema
>;

export async function personalizedRiskAssessment(
  input: PersonalizedRiskAssessmentInput
): Promise<PersonalizedRiskAssessmentOutput> {
  return personalizedRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRiskAssessmentPrompt',
  input: {schema: PersonalizedRiskAssessmentInputSchema},
  output: {schema: PersonalizedRiskAssessmentOutputSchema},
  prompt: `You are a risk assessment expert. Based on the user's location and local news, you will provide a list of potential risks and tailored preparedness steps.

Location: {{{location}}}
Local News: {{{localNews}}}

Risks:
- 
Preparedness Steps:
- `,
});

const personalizedRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'personalizedRiskAssessmentFlow',
    inputSchema: PersonalizedRiskAssessmentInputSchema,
    outputSchema: PersonalizedRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
