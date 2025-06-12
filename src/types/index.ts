
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
  photoURL?: string | null;
  createdAt: any; 
  // Add other fields as needed
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
}

export interface ChatMessage {
  id?: string; // Firestore document ID
  userId: string;
  sessionId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: any; // Firestore serverTimestamp
}
