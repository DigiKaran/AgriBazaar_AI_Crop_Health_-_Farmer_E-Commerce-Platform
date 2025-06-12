// src/ai/flows/generate-preventative-measures.ts
'use server';
/**
 * @fileOverview An AI agent that generates preventative measures for crops based on seasonal trends.
 *
 * - generatePreventativeMeasures - A function that handles the generation of preventative measures.
 * - GeneratePreventativeMeasuresInput - The input type for the generatePreventativeMeasures function.
 * - GeneratePreventativeMeasuresOutput - The return type for the generatePreventativeMeasures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreventativeMeasuresInputSchema = z.object({
  cropType: z.string().describe('The type of crop.'),
  season: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
  location: z.string().describe('The geographical location of the farm.'),
});
export type GeneratePreventativeMeasuresInput = z.infer<typeof GeneratePreventativeMeasuresInputSchema>;

const GeneratePreventativeMeasuresOutputSchema = z.object({
  preventativeMeasures: z.string().describe('AI-generated preventative measures based on seasonal trends for the specified crop.'),
});
export type GeneratePreventativeMeasuresOutput = z.infer<typeof GeneratePreventativeMeasuresOutputSchema>;

export async function generatePreventativeMeasures(input: GeneratePreventativeMeasuresInput): Promise<GeneratePreventativeMeasuresOutput> {
  return generatePreventativeMeasuresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePreventativeMeasuresPrompt',
  input: {schema: GeneratePreventativeMeasuresInputSchema},
  output: {schema: GeneratePreventativeMeasuresOutputSchema},
  prompt: `You are an expert agricultural advisor. Based on the crop type, season, and location provided, generate preventative measures to protect the crops from common diseases and optimize their growth.

Crop Type: {{{cropType}}}
Season: {{{season}}}
Location: {{{location}}}

Preventative Measures:`,
});

const generatePreventativeMeasuresFlow = ai.defineFlow(
  {
    name: 'generatePreventativeMeasuresFlow',
    inputSchema: GeneratePreventativeMeasuresInputSchema,
    outputSchema: GeneratePreventativeMeasuresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
