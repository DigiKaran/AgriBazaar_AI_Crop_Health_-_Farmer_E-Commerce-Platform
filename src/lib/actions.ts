'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';

export async function diagnoseCropAction(
  input: DiagnoseCropDiseaseInput
): Promise<DiagnoseCropDiseaseOutput | { error: string }> {
  try {
    const result = await diagnoseCropDisease(input);
    return result;
  } catch (error) {
    console.error('Error in diagnoseCropAction:', error);
    return { error: 'Failed to diagnose crop. Please try again.' };
  }
}

export async function generatePreventativeMeasuresAction(
  input: GeneratePreventativeMeasuresInput
): Promise<GeneratePreventativeMeasuresOutput | { error: string }> {
  try {
    const result = await generatePreventativeMeasures(input);
    return result;
  } catch (error) {
    console.error('Error in generatePreventativeMeasuresAction:', error);
    return { error: 'Failed to generate preventative measures. Please try again.' };
  }
}
