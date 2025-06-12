
'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, GetLocalizedFarmingTipsInput, GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import type { LocalizedFarmingTip, DiagnosisResult, ChatMessage, DiagnosisHistoryEntry } from '@/types';
import { 
    saveDiagnosisHistory as saveDiagnosisToDb, 
    saveChatMessage as saveMessageToDb,
    updateDiagnosisHistoryEntry
} from './firebase/firestore';

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
        const historyEntry: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp' | 'status'> = {
          userId,
          photoDataUri: input.photoDataUri,
          description: input.description,
          diagnosis: aiResult.diagnosis,
          expertReviewRequested: false,
        };
        const historyId = await saveDiagnosisToDb(historyEntry);
        return { diagnosis: aiResult.diagnosis, historyId };
      } catch (dbError) {
        console.error('Error saving diagnosis to DB:', dbError);
        return { diagnosis: aiResult.diagnosis, error: "Diagnosis successful, but failed to save history." };
      }
    }
     if (aiResult.diagnosis) {
        return { diagnosis: aiResult.diagnosis };
    }
    return { error: aiResult.diagnosis?.toString() ?? 'Unknown error from AI diagnosis' };
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

export async function requestExpertReviewAction(
  diagnosisId: string,
  userId: string
): Promise<{ success?: boolean; error?: string; message?: string }> {
  if (!userId) {
    return { error: "User not authenticated.", success: false };
  }
  if (!diagnosisId) {
    return { error: "Diagnosis ID is required.", success: false };
  }

  try {
    await updateDiagnosisHistoryEntry(diagnosisId, { 
      expertReviewRequested: true,
      status: 'pending_expert'
    });
    // In a full system, you might create a separate 'expert_queries' document here
    // and notify experts.
    return { success: true, message: "Expert review requested successfully." };
  } catch (error) {
    console.error("Error requesting expert review:", error);
    return { error: "Failed to request expert review. Please try again.", success: false };
  }
}
