


export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  dataAiHint?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface DiagnosisResult {
  disease: string;
  confidence: number;
  treatmentRecommendations: string;
}

export interface PreventativeMeasure {
  title: string;
  content: string;
}

export interface PreventativeMeasuresResult {
  measures: PreventativeMeasure[];
}

export type UserRole = 'farmer' | 'admin' | 'expert';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: any; // Firestore Timestamp or { seconds: number, nanoseconds: number }
  role: UserRole;
  status?: 'active' | 'inactive';
}

export interface WeatherData {
  condition: string;
  temperature: string;
  humidity: string;
  wind: string;
  iconName: string; // Lucide icon name
  locationName: string;
  dataAiHint?: string;
}

export interface LocalizedFarmingTip {
  title: string;
  content: string;
  category: string;
  iconName?: string; // Optional: Lucide icon name based on category
}

export interface LocalizedFarmingTipsOutput {
  tips: LocalizedFarmingTip[];
  generalAdvice?: string;
}

export interface DiagnosisHistoryEntry {
  id?: string; // Firestore document ID
  userId: string;
  photoDataUri?: string; // Or a URL if storing in Cloud Storage
  description: string;
  diagnosis: DiagnosisResult;
  timestamp: any; // Firestore serverTimestamp
  expertReviewRequested?: boolean;
  expertDiagnosis?: string | null;
  expertComments?: string | null;
  expertReviewedBy?: string | null; // UID of the expert/admin who reviewed
  expertReviewedAt?: any; // Firestore serverTimestamp of review
  status?: 'pending_ai' | 'ai_diagnosed' | 'pending_expert' | 'expert_reviewed' | 'closed';
}

export interface ChatMessage {
  id?: string; // Firestore document ID
  userId: string;
  sessionId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: any; // Firestore serverTimestamp
}

export interface ChatMessageHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}


export interface AdminDashboardStats {
  totalUsers: number;
  usersByRole: {
    farmer: number;
    expert: number;
    admin: number;
  };
  totalDiagnoses: number;
  pendingQueries: number;
  totalCategories: number;
}
