
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { DiagnosisHistoryEntry } from '@/types';
import { fetchPendingExpertQueriesAction } from '@/lib/actions'; // We'll create this action
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Inbox, CheckCircle, Edit3, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea'; // For expert comments

interface ExpertQueryManagementProps {
  adminUserId: string;
}

// Placeholder for submitting expert diagnosis - to be built out
// interface ExpertReviewFormData {
//   expertDiagnosis: string;
//   expertComments: string;
// }

export default function ExpertQueryManagement({ adminUserId }: ExpertQueryManagementProps) {
  const [queries, setQueries] = useState<DiagnosisHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // const [selectedQuery, setSelectedQuery] = useState<DiagnosisHistoryEntry | null>(null);
  // const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  // const [reviewFormData, setReviewFormData] = useState<ExpertReviewFormData>({ expertDiagnosis: '', expertComments: '' });

  const fetchQueries = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchPendingExpertQueriesAction(adminUserId);
    if (result.queries) {
      setQueries(result.queries);
    } else {
      setError(result.error || 'Failed to fetch pending expert queries.');
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not load queries.' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, [adminUserId]);

  // const handleOpenReviewDialog = (query: DiagnosisHistoryEntry) => {
  //   setSelectedQuery(query);
  //   setReviewFormData({ expertDiagnosis: query.diagnosis.disease, expertComments: '' }); // Pre-fill with AI diagnosis
  //   setIsReviewDialogOpen(true);
  // };

  // const handleReviewSubmit = async () => {
  //   if (!selectedQuery || !selectedQuery.id) return;
  //   // TODO: Call an action to submit the expert review
  //   // const result = await submitExpertDiagnosisAction(adminUserId, selectedQuery.id, reviewFormData.expertDiagnosis, reviewFormData.expertComments);
  //   // if (result.success) {
  //   //   toast({ title: "Review Submitted", description: "Expert diagnosis saved."});
  //   //   setIsReviewDialogOpen(false);
  //   //   fetchQueries(); // Refresh list
  //   // } else {
  //   //   toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
  //   // }
  //   toast({ title: "Placeholder", description: "Review submission functionality to be implemented."});
  //   setIsReviewDialogOpen(false);
  // };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading pending queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load queries</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-10">
        <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-xl font-semibold text-muted-foreground">No pending expert queries.</p>
        <p className="text-sm text-muted-foreground mt-1">All user requests for expert review have been addressed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableCaption>List of crop diagnoses awaiting expert review.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Requested</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>AI Diagnosis</TableHead>
            <TableHead className="text-center w-[100px]">Image</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.id}>
              <TableCell>
                {query.timestamp?.seconds ? formatDistanceToNow(new Date(query.timestamp.seconds * 1000), { addSuffix: true }) : 'Unknown date'}
              </TableCell>
              <TableCell className="truncate max-w-[150px] text-xs">{query.userId}</TableCell>
              <TableCell>
                <div className="font-medium">{query.diagnosis.disease}</div>
                <Badge variant="outline" className="mt-1">Conf: {(query.diagnosis.confidence * 100).toFixed(0)}%</Badge>
              </TableCell>
              <TableCell className="text-center">
                {query.photoDataUri && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Eye className="h-5 w-5"/></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                      </DialogHeader>
                      <div className="relative aspect-video w-full mt-2 rounded-md overflow-hidden">
                        <Image src={query.photoDataUri} alt="Crop diagnosis image" layout="fill" objectFit="contain" />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
              <TableCell className="text-right">
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => alert(`Reviewing query ${query.id} - Full review form coming soon.`)} // Placeholder
                    // onClick={() => handleOpenReviewDialog(query)}
                  >
                  <Edit3 className="mr-2 h-4 w-4" /> Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Placeholder for Review Dialog - to be implemented fully later
      {selectedQuery && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Expert Review: {selectedQuery.diagnosis.disease}</DialogTitle>
              <DialogDescription>Provide your expert assessment for this diagnosis query.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <h4 className="font-medium mb-1">Original Description:</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded-md bg-secondary/30">{selectedQuery.description}</p>
              </div>
              <div>
                <label htmlFor="expertDiagnosis" className="block text-sm font-medium mb-1">Your Diagnosis</label>
                <Input 
                  id="expertDiagnosis" 
                  value={reviewFormData.expertDiagnosis} 
                  onChange={(e) => setReviewFormData(prev => ({...prev, expertDiagnosis: e.target.value}))}
                />
              </div>
              <div>
                <label htmlFor="expertComments" className="block text-sm font-medium mb-1">Comments/Recommendations</label>
                <Textarea 
                  id="expertComments" 
                  rows={5} 
                  value={reviewFormData.expertComments} 
                  onChange={(e) => setReviewFormData(prev => ({...prev, expertComments: e.target.value}))}
                  placeholder="Provide detailed comments, alternative treatments, or confirm AI findings..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleReviewSubmit}><CheckCircle className="mr-2 h-4 w-4" /> Submit Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      */}
    </div>
  );
}
