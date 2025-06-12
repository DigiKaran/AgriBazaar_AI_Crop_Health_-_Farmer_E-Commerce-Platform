
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "./index";
import type { DiagnosisHistoryEntry, ChatMessage } from '@/types';

// Diagnosis History
const DIAGNOSIS_HISTORY_COLLECTION = 'diagnosis_history';

export const saveDiagnosisHistory = async (entry: Omit<DiagnosisHistoryEntry, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, DIAGNOSIS_HISTORY_COLLECTION), {
      ...entry,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnosis history: ", error);
    throw new Error("Failed to save diagnosis history.");
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
