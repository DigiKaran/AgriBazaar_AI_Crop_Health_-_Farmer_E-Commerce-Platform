
// src/ai/flows/generate-preventative-measures.ts
'use server';
/**
 * @fileOverview An AI agent that generates preventative measures for crops based on seasonal trends in India.
 *
 * - generatePreventativeMeasures - A function that handles the generation of preventative measures.
 * - GeneratePreventativeMeasuresInput - The input type for the generatePreventativeMeasures function.
 * - GeneratePreventativeMeasuresOutput - The return type for the generatePreventativeMeasures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreventativeMeasuresInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Rice, Wheat, Cotton, Sugarcane).'),
  season: z.string().describe('The current season in India (e.g., Kharif, Rabi, Zaid, or Spring, Summer, Monsoon, Autumn, Winter).'),
  location: z.string().describe('The geographical location or state in India (e.g., Punjab, Maharashtra).'),
});
export type GeneratePreventativeMeasuresInput = z.infer<typeof GeneratePreventativeMeasuresInputSchema>;

const GeneratePreventativeMeasuresOutputSchema = z.object({
  preventativeMeasures: z.string().describe('AI-generated preventative measures based on seasonal trends for the specified crop in the Indian context.'),
});
export type GeneratePreventativeMeasuresOutput = z.infer<typeof GeneratePreventativeMeasuresOutputSchema>;

export async function generatePreventativeMeasures(input: GeneratePreventativeMeasuresInput): Promise<GeneratePreventativeMeasuresOutput> {
  return generatePreventativeMeasuresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePreventativeMeasuresPrompt',
  input: {schema: GeneratePreventativeMeasuresInputSchema},
  output: {schema: GeneratePreventativeMeasuresOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in Indian farming practices. Based on the crop type, season, and location in India provided, generate preventative measures to protect the crops from common diseases and optimize their growth. Consider typical Indian agricultural cycles (Kharif, Rabi, Zaid if applicable) and climatic conditions.

Crop Type: {{{cropType}}}
Season: {{{season}}}
Location: {{{location}}} (India)

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
