
'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, AlertTriangle, CheckCircle2, Brain, ShieldCheck } from 'lucide-react';
import type { DiagnosisResult, PreventativeMeasuresResult } from '@/types';
import { diagnoseCropAction, generatePreventativeMeasuresAction } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const diagnosisFormSchema = z.object({
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Please upload an image of the crop.'),
  description: z.string().min(10, 'Please provide a description of at least 10 characters.').max(500, 'Description must be 500 characters or less.'),
  cropType: z.string().optional(), // For preventative measures
  season: z.string().optional(), // For preventative measures
  location: z.string().optional(), // For preventative measures
});

type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DiagnosisForm() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [preventativeMeasures, setPreventativeMeasures] = useState<PreventativeMeasuresResult | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [isLoadingPreventative, setIsLoadingPreventative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      description: "",
      cropType: "Unknown Crop", // Default value, can be updated
      season: "Current Season", // Default value, can be updated
      location: "Local Area" // Default value, can be updated
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('image', event.target.files!);
    } else {
      setPreviewImage(null);
    }
  };

  const onSubmitDiagnosis: SubmitHandler<DiagnosisFormValues> = async (data) => {
    setIsLoadingDiagnosis(true);
    setError(null);
    setDiagnosis(null);
    setPreventativeMeasures(null);

    if (!data.image || data.image.length === 0) {
      setError('Image is required.');
      setIsLoadingDiagnosis(false);
      return;
    }

    try {
      const photoDataUri = await fileToDataUri(data.image[0]);
      const result = await diagnoseCropAction({ photoDataUri, description: data.description });

      if ('error' in result) {
        setError(result.error);
      } else if (result.diagnosis) {
        setDiagnosis(result.diagnosis);
        // Update cropType if possible from diagnosis or keep user input
        if (result.diagnosis.disease && !result.diagnosis.disease.toLowerCase().includes("unknown")) {
             form.setValue('cropType', result.diagnosis.disease.split(' ')[0] || data.cropType || "General Crop"); // Example logic
        }
      } else {
        setError('Unexpected response from diagnosis service.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const handleGetPreventativeMeasures = async () => {
    setIsLoadingPreventative(true);
    setError(null); // Clear previous errors
    setPreventativeMeasures(null);

    const cropType = form.getValues('cropType') || "General Crop";
    const season = form.getValues('season') || "Current Season";
    const location = form.getValues('location') || "Local Area";
    
    try {
      const result = await generatePreventativeMeasuresAction({ cropType, season, location });
      if ('error' in result) {
        setError(result.error);
      } else {
        setPreventativeMeasures({ measures: result.preventativeMeasures });
      }
    } catch (err) {
      setError('Failed to fetch preventative measures.');
      console.error(err);
    } finally {
      setIsLoadingPreventative(false);
    }
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><UploadCloud className="text-primary" /> Upload Crop Image</CardTitle>
            <CardDescription>Provide an image and description of the affected crop.</CardDescription>
          </CardHeader>
          {/* The <form> tag is for the native HTML form submission behavior */}
          <form onSubmit={form.handleSubmit(onSubmitDiagnosis)} className="space-y-6">
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file:text-sm file:font-medium file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-3 file:py-1.5 hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewImage && (
                <div className="mt-4 border rounded-lg overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                  <Image src={previewImage} alt="Crop preview" layout="fill" objectFit="contain" data-ai-hint="leaf plant" />
                </div>
              )}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Symptoms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Yellow spots on leaves, wilting, etc." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingDiagnosis} className="w-full">
                {isLoadingDiagnosis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                Diagnose Crop
              </Button>
            </CardFooter>
          </form>
        </Card>

        {(diagnosis || preventativeMeasures || error) && (
          <Card className="shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {diagnosis && (
                <div className="space-y-4 p-4 border rounded-lg bg-background">
                  <h3 className="font-headline text-xl flex items-center gap-2"><CheckCircle2 className="text-green-500"/>Diagnosis</h3>
                  <p><strong>Disease:</strong> {diagnosis.disease}</p>
                  <p><strong>Confidence:</strong> {(diagnosis.confidence * 100).toFixed(0)}%</p>
                  <p><strong>Treatment Recommendations:</strong></p>
                  <p className="whitespace-pre-wrap text-sm">{diagnosis.treatmentRecommendations}</p>
                  
                  {!preventativeMeasures && (
                    <div className="mt-6 pt-4 border-t">
                       <h4 className="font-headline text-lg mb-2">Additional Options</h4>
                       <FormField
                          control={form.control}
                          name="cropType"
                          render={({ field }) => (
                            <FormItem className="mb-2">
                              <FormLabel>Crop Type (for prevention tips)</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={form.control}
                          name="season"
                          render={({ field }) => (
                            <FormItem className="mb-2">
                              <FormLabel>Current Season</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel>Location</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                      <Button onClick={handleGetPreventativeMeasures} disabled={isLoadingPreventative} variant="outline" className="w-full">
                        {isLoadingPreventative ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Get Preventative Measures
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {preventativeMeasures && (
                <div className="space-y-4 p-4 border rounded-lg bg-background mt-4">
                  <h3 className="font-headline text-xl flex items-center gap-2"><ShieldCheck className="text-blue-500"/>Preventative Measures</h3>
                  <p className="whitespace-pre-wrap text-sm">{preventativeMeasures.measures}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Form>
  );
}
