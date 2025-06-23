import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./index";
import type { DiagnosisHistoryEntry, ChatMessage, UserProfile, UserRole, ProductCategory, Order, OrderBase, DiagnosisResult } from '@/types';

// Diagnosis History
const DIAGNOSIS_HISTORY_COLLECTION = 'diagnosis_history';

export const saveDiagnosisQueryToDb = async (entry: {
  userId: string;
  photoDataUri: string;
  description: string;
  diagnosis?: DiagnosisResult | null;
}): Promise<string> => {
  try {
    const isDirectQuery = !entry.diagnosis;
    
    const docData: Omit<DiagnosisHistoryEntry, 'id'> = {
      userId: entry.userId,
      photoDataUri: entry.photoDataUri,
      description: entry.description,
      diagnosis: entry.diagnosis || null,
      timestamp: serverTimestamp(),
      expertReviewRequested: isDirectQuery,
      status: isDirectQuery ? 'pending_expert' : 'ai_diagnosed',
    };

    const docRef = await addDoc(collection(db, DIAGNOSIS_HISTORY_COLLECTION), docData as any); // Use 'as any' to bypass strict literal type checks for serverTimestamp
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnosis query: ", error);
    throw new Error("Failed to save diagnosis query.");
  }
};

export const updateDiagnosisHistoryEntry = async (id: string, updates: Partial<DiagnosisHistoryEntry>): Promise<void> => {
  const entryRef = doc(db, DIAGNOSIS_HISTORY_COLLECTION, id);
  try {
    // If status is being updated to 'expert_reviewed', also set expertReviewedAt
    if (updates.status === 'expert_reviewed' && !updates.expertReviewedAt) {
        updates.expertReviewedAt = serverTimestamp();
    }
    await updateDoc(entryRef, updates as any); // Use 'as any' for serverTimestamp
  } catch (error) {
    console.error("Error updating diagnosis history entry: ", error);
    throw new Error("Failed to update diagnosis history.");
  }
};

export const getDiagnosisHistoryEntry = async (id: string): Promise<DiagnosisHistoryEntry | null> => {
    const entryRef = doc(db, DIAGNOSIS_HISTORY_COLLECTION, id);
    const docSnap = await getDoc(entryRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DiagnosisHistoryEntry;
    }
    return null;
};

export const getPendingExpertQueries = async (): Promise<DiagnosisHistoryEntry[]> => {
  try {
    const q = query(
      collection(db, DIAGNOSIS_HISTORY_COLLECTION),
      where("expertReviewRequested", "==", true),
      where("status", "==", "pending_expert"),
      orderBy("timestamp", "asc") // Show oldest requests first
    );
    const querySnapshot = await getDocs(q);
    const queries: DiagnosisHistoryEntry[] = [];
    querySnapshot.forEach((doc) => {
      queries.push({ id: doc.id, ...doc.data() } as DiagnosisHistoryEntry);
    });
    return queries;
  } catch (error: any) {
    console.error("Error fetching pending expert queries from DB: ", error);
    let errorMessage = "Failed to fetch pending expert queries.";
    if (error.message) errorMessage += ` Firebase: ${error.message}`;
    if (error.code) errorMessage += ` (Code: ${error.code})`;
    throw new Error(errorMessage);
  }
};

export const getAllDiagnosisEntries = async (): Promise<DiagnosisHistoryEntry[]> => {
  try {
    const q = query(collection(db, DIAGNOSIS_HISTORY_COLLECTION), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const entries: DiagnosisHistoryEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as DiagnosisHistoryEntry);
    });
    return entries;
  } catch (error: any) {
    console.error("Error fetching all diagnosis entries from DB: ", error);
    throw new Error(`Failed to fetch all diagnosis entries. ${error.message || ''}`.trim());
  }
};


// Chat Messages
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

export const saveChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
      ...message,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving chat message: ", error);
    throw new Error("Failed to save chat message.");
  }
};

export const getChatMessages = async (userId: string, sessionId: string): Promise<ChatMessage[]> => {
  try {
    const messagesQuery = query(
      collection(db, CHAT_MESSAGES_COLLECTION),
      where("userId", "==", userId),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(messagesQuery);
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    return messages;
  } catch (error) {
    console.error("Error fetching chat messages: ", error);
    throw new Error("Failed to fetch chat messages.");
  }
};

// User Management
const USERS_COLLECTION = 'users';

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(usersQuery);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
    return users;
  } catch (error: any) {
    console.error("Error fetching all users from DB: ", error);
    let errorMessage = "Failed to fetch users.";
    if (error.message) {
      errorMessage += ` Details: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};

export const updateUserByAdmin = async (userId: string, updates: Partial<Pick<UserProfile, 'role' | 'status'>>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    // Filter out undefined values so we don't accidentally wipe fields
    const validUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    if (Object.keys(validUpdates).length === 0) {
        return; // Nothing to update
    }
    await updateDoc(userRef, validUpdates);
  } catch (error: any) {
    console.error("Error updating user by admin: ", error);
    let errorMessage = "Failed to update user profile.";
    if (error.message) errorMessage += ` Firebase: ${error.message}`;
    if (error.code) errorMessage += ` (Code: ${error.code})`;
    throw new Error(errorMessage);
  }
};

// Product Categories
const CATEGORIES_COLLECTION = 'product_categories';

export const getProductCategories = async (): Promise<ProductCategory[]> => {
    try {
        const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const categories: ProductCategory[] = [];
        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() } as ProductCategory);
        });
        return categories;
    } catch (error: any) {
        console.error("Error fetching product categories: ", error);
        throw new Error(`Failed to fetch product categories. ${error.message || ''}`.trim());
    }
}

export const addProductCategory = async (name: string): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { name });
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding product category: ", error);
        throw new Error(`Failed to add product category. ${error.message || ''}`.trim());
    }
}

export const deleteProductCategory = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
    } catch (error: any) {
        console.error("Error deleting product category: ", error);
        throw new Error(`Failed to delete product category. ${error.message || ''}`.trim());
    }
}

// Orders
const ORDERS_COLLECTION = 'orders';

export const saveOrder = async (orderData: OrderBase): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Error saving order: ", error);
    throw new Error(`Failed to save order. ${error.message || ''}`.trim());
  }
};
