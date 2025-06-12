
'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, GetLocalizedFarmingTipsInput, GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import type { LocalizedFarmingTip, DiagnosisResult, ChatMessage } from '@/types';
import { saveDiagnosisHistory as saveDiagnosisToDb, saveChatMessage as saveMessageToDb } from './firebase/firestore';

interface DiagnoseCropActionResult {
  diagnosis?: DiagnosisResult;
  historyId?: string;
  error?: string;
}

export async function diagnoseCropAction(
  input: DiagnoseCropDiseaseInput,
  userId?: string // Optional: Pass userId if available for saving history
): Promise<DiagnoseCropActionResult> {
  try {
    const aiResult = await diagnoseCropDisease(input);
    
    if (userId && aiResult.diagnosis) {
      try {
        const historyEntry = {
          userId,
          photoDataUri: input.photoDataUri,
          description: input.description,
          diagnosis: aiResult.diagnosis,
        };
        const historyId = await saveDiagnosisToDb(historyEntry);
        return { ...aiResult, historyId };
      } catch (dbError) {
        console.error('Error saving diagnosis to DB:', dbError);
        // Return AI result even if DB save fails, but perhaps log or indicate partial success
        return { ...aiResult, error: "Diagnosis successful, but failed to save history." };
      }
    }
    return aiResult;
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
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) ? (error as {message: string}).message : 'An unknown error occurred';
    return { error: `Failed to generate farming tips: ${errorMessage}. Please try again.` };
  }
}

export async function saveChatMessageAction(
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<{ messageId?: string; error?: string }> {
  if (!message.userId) {
    return { error: "User ID is required to save chat message." };
  }
  try {
    const messageId = await saveMessageToDb(message);
    return { messageId };
  } catch (error) {
    console.error('Error in saveChatMessageAction:', error);
    return { error: 'Failed to save chat message. Please try again.' };
  }
}
