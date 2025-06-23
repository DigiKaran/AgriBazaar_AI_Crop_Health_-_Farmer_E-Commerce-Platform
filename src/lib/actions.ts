
'use server';

import { diagnoseCropDisease, type DiagnoseCropDiseaseInput } from '@/ai/flows/diagnose-crop-disease';
import { generatePreventativeMeasures, type GeneratePreventativeMeasuresInput, type GeneratePreventativeMeasuresOutput } from '@/ai/flows/generate-preventative-measures';
import { getLocalizedFarmingTips, type GetLocalizedFarmingTipsInput, type GetLocalizedFarmingTipsOutput } from '@/ai/flows/get-localized-farming-tips';
import { agriBotChat } from '@/ai/flows/agri-bot-chat';
import type { LocalizedFarmingTip, DiagnosisResult, ChatMessage, DiagnosisHistoryEntry, UserProfile, UserRole, ProductCategory, AdminDashboardStats, CartItem, ShippingAddress, AgriBotChatInput, AgriBotChatOutput, Product } from '@/types';
import { getUserProfile } from './firebase/auth';
import { 
    saveDiagnosisEntryToDb,
    saveChatMessage as saveMessageToDb,
    updateDiagnosisHistoryEntry,
    getAllUsers as getAllUsersFromDb,
    updateUserByAdmin as updateUserByAdminInDb,
    getPendingExpertQueries as getPendingExpertQueriesFromDb,
    getProductCategories as getProductCategoriesFromDb,
    addProductCategory as addProductCategoryToDb,
    deleteProductCategory as deleteProductCategoryFromDb,
    getAllDiagnosisEntries as getAllDiagnosisEntriesFromDb,
    saveOrder as saveOrderToDb,
    getProducts as getProductsFromDb,
} from './firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

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
        const entryToSave: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp'> & { timestamp: any } = {
          userId,
          photoDataUri: input.photoDataUri,
          description: input.description,
          diagnosis: aiResult.diagnosis,
          timestamp: serverTimestamp(),
          expertReviewRequested: false,
          status: 'ai_diagnosed',
        };
        const historyId = await saveDiagnosisEntryToDb(entryToSave);
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

export async function submitDirectExpertQueryAction(
  input: { photoDataUri: string, description: string },
  userId: string
): Promise<{ success: boolean; historyId?: string; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User is not authenticated.' };
  }
  try {
    const entryToSave: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp'> & { timestamp: any } = {
      userId,
      photoDataUri: input.photoDataUri,
      description: input.description,
      diagnosis: null,
      timestamp: serverTimestamp(),
      expertReviewRequested: true,
      status: 'pending_expert',
    };
    const historyId = await saveDiagnosisEntryToDb(entryToSave);
    return { success: true, historyId };
  } catch (error: any) {
    console.error('Error in submitDirectExpertQueryAction:', error);
    return { success: false, error: `Failed to submit query. ${error.message || ''}`.trim() };
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
    // Silently fail for guests, don't return an error to the UI
    return {};
  }
  try {
    const messageId = await saveMessageToDb(message);
    return { messageId };
  } catch (error: any) {
    console.error('Error in saveChatMessageAction:', error);
    return { error: `Failed to save chat message. ${error.message || ''}`.trim() };
  }
}

export async function getAgriBotResponseAction(
  input: AgriBotChatInput
): Promise<AgriBotChatOutput | { error: string }> {
  try {
    const result = await agriBotChat(input);
    return result;
  } catch (error: any) {
    console.error('Error in getAgriBotResponseAction:', error);
    return { error: `Failed to get response from AgriBot. ${error.message || ''}`.trim() };
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
// Helper function for admin role verification
const verifyAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  if (!userId) {
    return { success: false, error: 'User ID is missing. Cannot perform admin action.' };
  }
  try {
    const userProfile = await getUserProfile(userId);
    if (userProfile?.role !== 'admin') {
      return { success: false, error: 'Permission denied. You must be an admin to perform this action.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to verify admin status.' };
  }
};

const verifyAdminOrExpert = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
        return { success: false, error: 'User ID is missing. Cannot perform this action.' };
    }
    try {
        const userProfile = await getUserProfile(userId);
        if (userProfile?.role !== 'admin' && userProfile?.role !== 'expert') {
            return { success: false, error: 'Permission denied. You must be an admin or expert.' };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to verify user role.' };
    }
};

export async function fetchAllUsersAction(adminUserId: string): Promise<{ users?: UserProfile[]; error?: string }> {
  const adminCheck = await verifyAdmin(adminUserId);
  if (!adminCheck.success) return { error: adminCheck.error };

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
  const adminCheck = await verifyAdmin(adminUserId);
  if (!adminCheck.success) return { success: false, error: adminCheck.error };

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
  const roleCheck = await verifyAdminOrExpert(adminOrExpertUserId);
  if (!roleCheck.success) return { error: roleCheck.error };
  
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
  const roleCheck = await verifyAdminOrExpert(reviewerUserId);
  if (!roleCheck.success) return { success: false, error: roleCheck.error };
  
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

export async function getProductCategoriesAction(): Promise<{ categories?: ProductCategory[]; error?: string }> {
    try {
        const categories = await getProductCategoriesFromDb();
        return { categories };
    } catch (error: any) {
        return { error: `Failed to fetch product categories. ${error.message || ''}`.trim() };
    }
}

export async function addProductCategoryAction(adminUserId: string, name: string): Promise<{ category?: ProductCategory; error?: string }> {
    const adminCheck = await verifyAdmin(adminUserId);
    if (!adminCheck.success) return { error: adminCheck.error };

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
    const adminCheck = await verifyAdmin(adminUserId);
    if (!adminCheck.success) return { success: false, error: adminCheck.error };
    
    try {
        await deleteProductCategoryFromDb(id);
        return { success: true };
    } catch (error: any) {
        return { error: `Failed to delete product category. ${error.message || ''}`.trim() };
    }
}

export async function getAdminDashboardStatsAction(adminUserId: string): Promise<{ stats?: AdminDashboardStats; error?: string }> {
  const adminCheck = await verifyAdmin(adminUserId);
  if (!adminCheck.success) return { error: adminCheck.error };
  
  try {
    const [users, diagnoses, pendingQueries, categories] = await Promise.all([
      getAllUsersFromDb(),
      getAllDiagnosisEntriesFromDb(),
      getPendingExpertQueriesFromDb(),
      getProductCategoriesFromDb(),
    ]);

    const usersByRole = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { farmer: 0, expert: 0, admin: 0 }
    );

    const stats: AdminDashboardStats = {
      totalUsers: users.length,
      usersByRole,
      totalDiagnoses: diagnoses.length,
      pendingQueries: pendingQueries.length,
      totalCategories: categories.length,
    };

    return { stats };
  } catch (error: any) {
    console.error('Error in getAdminDashboardStatsAction:', error);
    return { error: `Failed to fetch dashboard stats. ${error.message || ''}`.trim() };
  }
}

// E-commerce Actions

export async function getProductsAction(): Promise<{ products?: Product[]; error?: string }> {
    try {
        const products = await getProductsFromDb();
        return { products };
    } catch (error: any) {
        return { error: `Failed to fetch products. ${error.message || ''}`.trim() };
    }
}


interface PlaceOrderInput {
    userId: string;
    items: CartItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!input.userId) {
        return { success: false, error: 'User is not authenticated.' };
    }
    if (!input.items || input.items.length === 0) {
        return { success: false, error: 'Cannot place an order with an empty cart.' };
    }

    try {
        const orderId = await saveOrderToDb({
            ...input,
            status: 'placed',
        });
        
        return { success: true, orderId };
    } catch (error: any) {
        console.error('Error in placeOrderAction:', error);
        return { success: false, error: `Failed to place order. ${error.message || ''}`.trim() };
    }
}
