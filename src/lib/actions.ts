
'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, GetLocalizedFarmingTipsInput, GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import type { LocalizedFarmingTip } from '@/types';


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

export async function getLocalizedFarmingTipsAction(
  input: GetLocalizedFarmingTipsInput
): Promise<(GetLocalizedFarmingTipsOutput & { tips: LocalizedFarmingTip[] }) | { error: string }> {
  try {
    const result = await getLocalizedFarmingTips(input);
    return result;
  } catch (error) {
    console.error('Error in getLocalizedFarmingTipsAction:', error);
    // Check if error is an object and has a message property
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) ? (error as {message: string}).message : 'An unknown error occurred';
    return { error: `Failed to generate farming tips: ${errorMessage}. Please try again.` };
  }
}
