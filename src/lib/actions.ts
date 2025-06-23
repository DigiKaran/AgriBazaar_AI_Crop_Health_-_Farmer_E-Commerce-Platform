
'use server';

import { diagnoseCropDisease, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, GeneratePreventativeMeasuresInput, GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, GetLocalizedFarmingTipsInput, GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import type { LocalizedFarmingTip, DiagnosisResult, ChatMessage, DiagnosisHistoryEntry, UserProfile, UserRole, ProductCategory } from '@/types';
import { 
    saveDiagnosisHistory as saveDiagnosisToDb, 
    saveChatMessage as saveMessageToDb,
    updateDiagnosisHistoryEntry,
    getAllUsers as getAllUsersFromDb,
    updateUserByAdmin as updateUserByAdminInDb,
    getPendingExpertQueries as getPendingExpertQueriesFromDb,
    getProductCategories as getProductCategoriesFromDb,
    addProductCategory as addProductCategoryToDb,
    deleteProductCategory as deleteProductCategoryFromDb,
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

// Admin & Marketplace Actions

export async function fetchAllUsersAction(adminUserId: string): Promise<{ users?: UserProfile[]; error?: string }> {
  if (!adminUserId) {
    console.error("fetchAllUsersAction: adminUserId is missing.");
    return { error: 'Admin user ID is missing. Cannot fetch users.' };
  }
  try {
    const users = await getAllUsersFromDb();
    return { users };
  } catch (error: any)
   {
    console.error('Error in fetchAllUsersAction:', error);
    let errorMessage = "Failed to fetch users.";
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage += ` Details: ${error.message}`;
    }
    return { error: errorMessage.trim() };
  }
}

export async function updateUserByAdminAction(
  targetUserId: string, 
  updates: { role: UserRole; status: 'active' | 'inactive' },
  adminUserId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!adminUserId) {
    console.error("updateUserByAdminAction: adminUserId is missing.");
    return { error: 'Admin user ID is missing. Cannot update profile.' };
  }
  try {
    await updateUserByAdminInDb(targetUserId, updates);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user profile action:', error);
    const specificError = error.message || 'An unknown error occurred.';
    return { error: `Failed to update user profile. ${specificError}`.trim() };
  }
}

export async function fetchPendingExpertQueriesAction(adminOrExpertUserId: string): Promise<{ queries?: DiagnosisHistoryEntry[]; error?: string }> {
  if (!adminOrExpertUserId) {
    console.error("fetchPendingExpertQueriesAction: adminOrExpertUserId is missing.");
    return { error: 'User ID is missing. Cannot fetch queries.' };
  }
  try {
    const queries = await getPendingExpertQueriesFromDb();
    return { queries };
  } catch (error: any) {
    console.error('Error in fetchPendingExpertQueriesAction:', error);
    const specificError = error.message || 'An unknown error occurred.';
    return { error: `Failed to fetch pending expert queries. ${specificError}`.trim() };
  }
}

export async function submitExpertDiagnosisAction(
  reviewerUserId: string,
  queryId: string,
  expertDiagnosis: string,
  expertComments: string
): Promise<{ success?: boolean; error?: string; message?: string }> {
  if (!reviewerUserId) {
    return { error: "Reviewer user ID not provided.", success: false };
  }
  if (!queryId) {
    return { error: "Query ID is required.", success: false };
  }
  if (!expertDiagnosis.trim()) {
    return { error: "Expert diagnosis cannot be empty.", success: false };
  }

  try {
    await updateDiagnosisHistoryEntry(queryId, {
      expertDiagnosis,
      expertComments: expertComments.trim() || null, // Store null if empty
      expertReviewedBy: reviewerUserId,
      status: 'expert_reviewed',
    });
    return { success: true, message: "Expert review submitted successfully." };
  } catch (error: any) {
    console.error("Error submitting expert diagnosis:", error);
    return { error: `Failed to submit expert review. ${error.message || ''}`.trim(), success: false };
  }
}

export async function getProductCategoriesAction(adminUserId?: string): Promise<{ categories?: ProductCategory[]; error?: string }> {
    // Admin check is optional here, as we might want to fetch categories for public display
    // For admin-only actions, the adminUserId check is mandatory.
    try {
        const categories = await getProductCategoriesFromDb();
        return { categories };
    } catch (error: any) {
        return { error: `Failed to fetch product categories. ${error.message || ''}`.trim() };
    }
}

export async function addProductCategoryAction(adminUserId: string, name: string): Promise<{ category?: ProductCategory; error?: string }> {
    if (!adminUserId) {
        return { error: "Admin authentication required." };
    }
    if (!name || name.trim().length < 2) {
        return { error: "Category name must be at least 2 characters long." };
    }
    try {
        const newId = await addProductCategoryToDb(name);
        return { category: { id: newId, name } };
    } catch (error: any) {
        return { error: `Failed to add product category. ${error.message || ''}`.trim() };
    }
}

export async function deleteProductCategoryAction(adminUserId: string, id: string): Promise<{ success?: boolean; error?: string }> {
    if (!adminUserId) {
        return { error: "Admin authentication required." };
    }
    try {
        await deleteProductCategoryFromDb(id);
        return { success: true };
    } catch (error: any) {
        return { error: `Failed to delete product category. ${error.message || ''}`.trim() };
    }
}
