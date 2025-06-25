import DiagnosisForm from './components/DiagnosisForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Disease Diagnosis - AgriBazaar',
  description: 'Upload an image of your crop to get an AI-powered diagnosis and treatment recommendations.',
};

export default function DiagnosePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline tracking-tight">Crop Disease Diagnosis</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload a photo of your crop along with a brief description. Our AI will analyze it to identify potential diseases and suggest treatments.
        </p>
      </header>
      <DiagnosisForm />
    </div>
  );
}
