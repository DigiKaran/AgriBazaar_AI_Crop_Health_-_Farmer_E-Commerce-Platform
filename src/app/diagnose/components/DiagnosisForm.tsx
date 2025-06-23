
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
import { Loader2, UploadCloud, AlertTriangle, CheckCircle2, Brain, ShieldCheck, UserCheck, MessageSquareWarning } from 'lucide-react';
import type { DiagnosisResult, PreventativeMeasuresResult } from '@/types';
import { diagnoseCropAction, generatePreventativeMeasuresAction, requestExpertReviewAction } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { uploadImageForDiagnosis } from '@/lib/firebase/storage';

const diagnosisFormSchema = z.object({
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Please upload an image of the crop.'),
  description: z.string().min(10, 'Please provide a description of at least 10 characters.').max(500, 'Description must be 500 characters or less.'),
  cropType: z.string().optional(), // For preventative measures
  season: z.string().optional(), // For preventative measures
  location: z.string().optional(), // For preventative measures
});

type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

interface DiagnosisState extends DiagnosisResult {
  historyId?: string;
  expertReviewRequested?: boolean;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DiagnosisForm() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisState | null>(null);
  const [preventativeMeasures, setPreventativeMeasures] = useState<PreventativeMeasuresResult | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [isLoadingPreventative, setIsLoadingPreventative] = useState(false);
  const [isRequestingExpert, setIsRequestingExpert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      description: "",
      cropType: "Unknown Crop", 
      season: "Current Season", 
      location: "Local Area" 
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

    if (!currentUser) {
      setError('You must be logged in to diagnose a crop.');
      setIsLoadingDiagnosis(false);
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to use the diagnosis feature.",
      });
      return;
    }

    try {
      const file = data.image[0];
      const [photoDataUri, photoURL] = await Promise.all([
        fileToDataUri(file),
        uploadImageForDiagnosis(file, currentUser.uid)
      ]);
      
      const result = await diagnoseCropAction({ photoDataUri, photoURL, description: data.description }, currentUser.uid);

      if (result.error) {
        setError(result.error);
        if (result.diagnosis) { 
            setDiagnosis({...result.diagnosis, historyId: result.historyId});
             toast({
                variant: "destructive",
                title: "Diagnosis Complete (Save Failed)",
                description: "Crop diagnosed, but failed to save to your history.",
            });
        }
      } else if (result.diagnosis) {
        setDiagnosis({...result.diagnosis, historyId: result.historyId, expertReviewRequested: false });
        toast({
            title: "Diagnosis Successful",
            description: `Identified: ${result.diagnosis.disease}. History saved.`,
            action: result.historyId ? <CheckCircle2 className="text-green-500" /> : undefined,
        });
        if (result.diagnosis.disease && !result.diagnosis.disease.toLowerCase().includes("unknown")) {
             form.setValue('cropType', result.diagnosis.disease.split(' ')[0] || data.cropType || "General Crop");
        }
      } else {
        setError('Unexpected response from diagnosis service.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const handleGetPreventativeMeasures = async () => {
    setIsLoadingPreventative(true);
    setError(null); 
    setPreventativeMeasures(null);

    const cropType = form.getValues('cropType') || "General Crop";
    const season = form.getValues('season') || "Current Season";
    const location = form.getValues('location') || "Local Area";
    
    try {
      const result = await generatePreventativeMeasuresAction({ cropType, season, location });
      if ('error' in result) {
        setError(result.error);
         toast({ variant: "destructive", title: "Failed", description: result.error });
      } else {
        setPreventativeMeasures({ measures: result.measures });
        toast({ title: "Preventative Measures Generated", description: "Tips are ready for you." });
      }
    } catch (err) {
      setError('Failed to fetch preventative measures.');
      console.error(err);
       toast({ variant: "destructive", title: "Error", description: "Could not fetch preventative measures." });
    } finally {
      setIsLoadingPreventative(false);
    }
  };

  const handleRequestExpertReview = async () => {
    if (!diagnosis?.historyId || !currentUser?.uid) {
        toast({ variant: "destructive", title: "Error", description: "Cannot request review without a saved diagnosis or user session." });
        return;
    }
    setIsRequestingExpert(true);
    try {
        const result = await requestExpertReviewAction(diagnosis.historyId, currentUser.uid);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            setDiagnosis(prev => prev ? {...prev, expertReviewRequested: true} : null);
        } else {
            toast({ variant: "destructive", title: "Failed", description: result.error });
        }
    } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Could not request expert review." });
    } finally {
        setIsRequestingExpert(false);
    }
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><UploadCloud className="text-primary" /> Upload Crop Image</CardTitle>
            <CardDescription>Provide an image and description of the affected crop. Login required.</CardDescription>
          </CardHeader>
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
                        disabled={!currentUser || isLoadingDiagnosis}
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
                      <Textarea placeholder="e.g., Yellow spots on leaves, wilting, etc." {...field} rows={4} disabled={!currentUser || isLoadingDiagnosis} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!currentUser || isLoadingDiagnosis} className="w-full">
                {isLoadingDiagnosis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                Diagnose Crop
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {diagnosis && (
              <Card className="shadow-xl rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><CheckCircle2 className="text-green-500"/>AI Diagnosis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p><strong>Disease:</strong> {diagnosis.disease}</p>
                  <p><strong>Confidence:</strong> {(diagnosis.confidence * 100).toFixed(0)}%</p>
                  <div>
                    <strong>Treatment Recommendations:</strong>
                    <div className="chat-prose mt-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {diagnosis.treatmentRecommendations}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {diagnosis.historyId && currentUser && (
                    <div className="mt-4 pt-4 border-t">
                      {diagnosis.expertReviewRequested ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600 p-2 bg-blue-50 rounded-md">
                           <UserCheck className="h-5 w-5"/> 
                           <span>Expert review has been requested. You will be notified.</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleRequestExpertReview} 
                          disabled={isRequestingExpert} 
                          variant="outline" 
                          className="w-full"
                        >
                          {isRequestingExpert ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareWarning className="mr-2 h-4 w-4" />}
                          Not Satisfied? Request Expert Review
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {diagnosis && (
                <Card className="shadow-xl rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><ShieldCheck className="text-blue-500"/>Preventative Measures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingPreventative && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="ml-2 text-muted-foreground">Generating tips...</p>
                            </div>
                        )}
                        {!preventativeMeasures && !isLoadingPreventative && (
                            <div className="space-y-4">
                                <CardDescription>Get AI-powered prevention tips for this crop.</CardDescription>
                                <FormField
                                    control={form.control}
                                    name="cropType"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Crop Type</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="season"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Current Season</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )}
                                />
                                <Button onClick={handleGetPreventativeMeasures} className="w-full">
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Get Tips
                                </Button>
                            </div>
                        )}
                        {preventativeMeasures && (
                             <div className="space-y-4">
                                {preventativeMeasures.measures.map((measure, index) => (
                                  <div key={index} className="p-3 border-b last:border-b-0">
                                    <h4 className="font-headline text-lg flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        {measure.title}
                                    </h4>
                                    <div className="chat-prose ml-6 mt-1">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{measure.content}</ReactMarkdown>
                                    </div>
                                  </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </Form>
  );
}
