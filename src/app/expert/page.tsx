
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert, MessageSquareHeart, UserCheck } from 'lucide-react';

export default function ExpertPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role !== 'expert') {
      // router.push('/'); // Redirect if not expert
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading expert dashboard...</div>;
  }

  if (userProfile?.role !== 'expert') {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center shadow-xl rounded-xl">
          <CardHeader>
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg">
              You do not have permission to view this page. This area is restricted to agricultural experts.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-headline flex items-center gap-3">
           <UserCheck className="h-10 w-10 text-primary"/> Expert Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Review farmer queries and provide expert advice.</p>
      </header>
      
       <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Welcome, Expert!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your AgriCheck expert dashboard. Farmers may request your expertise on diagnoses they are not satisfied with.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            (A list of pending queries from farmers would appear here. You would be able to view the original AI diagnosis, images, and provide your own assessment.)
          </p>
          <div className="mt-6">
            <Button variant="outline" disabled className="w-full">
                <MessageSquareHeart className="mr-2 h-5 w-5"/>
                View Pending Farmer Queries (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
