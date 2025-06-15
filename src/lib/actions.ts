
'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, GetLocalizedFarmingTipsInput, GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import type { LocalizedFarmingTip, DiagnosisResult, ChatMessage, DiagnosisHistoryEntry, UserProfile, UserRole } from '@/types';
import { 
    saveDiagnosisHistory as saveDiagnosisToDb, 
    saveChatMessage as saveMessageToDb,
    updateDiagnosisHistoryEntry,
    getAllUsers as getAllUsersFromDb,
    updateUserRole as updateUserRoleInDb,
    getPendingExpertQueries as getPendingExpertQueriesFromDb,
} from './firebase/firestore';

interface DiagnoseCropActionResult {
  diagnosis?: DiagnosisResult;
  historyId?: string;
  error?: string;
}

export async function diagnoseCropAction(
  input: DiagnoseCropDiseaseInput,
  userId?: string
): Promise<DiagnoseCropActionResult> {
  try {
    const aiResult = await diagnoseCropDisease(input);
    
    if (userId && aiResult.diagnosis) {
      try {
        const historyEntryBase: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp' | 'status' | 'expertReviewRequested' | 'expertDiagnosis' | 'expertComments' | 'expertReviewedBy' | 'expertReviewedAt'> = {
          userId,
          photoDataUri: input.photoDataUri,
          description: input.description,
          diagnosis: aiResult.diagnosis,
        };
        const historyId = await saveDiagnosisToDb(historyEntryBase);
        return { diagnosis: aiResult.diagnosis, historyId };
      } catch (dbError: any) {
        console.error('Error saving diagnosis to DB:', dbError);
        return { diagnosis: aiResult.diagnosis, error: `Diagnosis successful, but failed to save history. ${dbError.message || ''}`.trim() };
      }
    }
     if (aiResult.diagnosis) {
        return { diagnosis: aiResult.diagnosis };
    }
    return { error: aiResult.diagnosis?.toString() ?? 'Unknown error from AI diagnosis' };
  } catch (error: any) {
    console.error('Error in diagnoseCropAction:', error);
    return { error: `Failed to diagnose crop. ${error.message || ''}`.trim() };
  }
}

export async function generatePreventativeMeasuresAction(
  input: GeneratePreventativeMeasuresInput
): Promise<GeneratePreventativeMeasuresOutput | { error: string }> {
  try {
    const result = await generatePreventativeMeasures(input);
    return result;
  } catch (error: any) {
    console.error('Error in generatePreventativeMeasuresAction:', error);
    return { error: `Failed to generate preventative measures. ${error.message || ''}`.trim() };
  }
}

export async function getLocalizedFarmingTipsAction(
  input: GetLocalizedFarmingTipsInput
): Promise<(GetLocalizedFarmingTipsOutput & { tips: LocalizedFarmingTip[] }) | { error: string }> {
  try {
    const result = await getLocalizedFarmingTips(input);
    return result;
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error in saveChatMessageAction:', error);
    return { error: `Failed to save chat message. ${error.message || ''}`.trim() };
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
    return { success: true, message: "Expert review requested successfully." };
  } catch (error: any) {
    console.error("Error requesting expert review:", error);
    return { error: `Failed to request expert review. ${error.message || ''}`.trim(), success: false };
  }
}

// Admin Actions
export async function fetchAllUsersAction(adminUserId: string): Promise<{ users?: UserProfile[]; error?: string }> {
  if (!adminUserId) {
    console.error("fetchAllUsersAction: adminUserId is missing.");
    return { error: 'Admin user ID is missing. Cannot fetch users.' };
  }
  try {
    const users = await getAllUsersFromDb();
    return { users };
  } catch (error: any) {
    console.error('Error in fetchAllUsersAction:', error);
    const specificError = error.message || 'An unknown error occurred.';
    return { error: `Failed to fetch users. ${specificError}`.trim() };
  }
}

export async function updateUserRoleAction(
  targetUserId: string, 
  newRole: UserRole, 
  adminUserId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!adminUserId) {
    console.error("updateUserRoleAction: adminUserId is missing.");
    return { error: 'Admin user ID is missing. Cannot update role.' };
  }
  try {
    await updateUserRoleInDb(targetUserId, newRole);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role action:', error);
    const specificError = error.message || 'An unknown error occurred.';
    return { error: `Failed to update user role. ${specificError}`.trim() };
  }
}

export async function fetchPendingExpertQueriesAction(adminUserId: string): Promise<{ queries?: DiagnosisHistoryEntry[]; error?: string }> {
  if (!adminUserId) {
    console.error("fetchPendingExpertQueriesAction: adminUserId is missing.");
    return { error: 'Admin user ID is missing. Cannot fetch queries.' };
  }
  // Add server-side admin role check here in a real scenario using Firebase Admin SDK
  try {
    const queries = await getPendingExpertQueriesFromDb();
    return { queries };
  } catch (error: any) {
    console.error('Error in fetchPendingExpertQueriesAction:', error);
    const specificError = error.message || 'An unknown error occurred.';
    return { error: `Failed to fetch pending expert queries. ${specificError}`.trim() };
  }
}
