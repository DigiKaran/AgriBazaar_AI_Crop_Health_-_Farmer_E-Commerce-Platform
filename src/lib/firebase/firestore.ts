
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./index";
import type { DiagnosisHistoryEntry, ChatMessage, UserProfile, UserRole } from '@/types';

// Diagnosis History
const DIAGNOSIS_HISTORY_COLLECTION = 'diagnosis_history';

export const saveDiagnosisHistory = async (entry: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp' | 'status'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, DIAGNOSIS_HISTORY_COLLECTION), {
      ...entry,
      timestamp: serverTimestamp(),
      expertReviewRequested: false,
      status: 'ai_diagnosed',
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnosis history: ", error);
    throw new Error("Failed to save diagnosis history.");
  }
};

export const updateDiagnosisHistoryEntry = async (id: string, updates: Partial<DiagnosisHistoryEntry>): Promise<void> => {
  const entryRef = doc(db, DIAGNOSIS_HISTORY_COLLECTION, id);
  try {
    await updateDoc(entryRef, updates);
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
    // Preserve original error details
    let errorMessage = "Failed to fetch users.";
    if (error.message) {
      errorMessage += ` Firebase: ${error.message}`;
    }
    if (error.code) {
      errorMessage += ` (Code: ${error.code})`;
    }
    throw new Error(errorMessage);
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw new Error("Failed to update user role.");
  }
};
