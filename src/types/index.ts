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
