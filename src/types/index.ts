
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

export interface DiagnosisResult {
  disease: string;
  confidence: number;
  treatmentRecommendations: string;
}

export interface PreventativeMeasuresResult {
  measures: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null; // Added for avatar
  createdAt: any; // Firestore Timestamp or Date
  // Add other fields as needed
}
