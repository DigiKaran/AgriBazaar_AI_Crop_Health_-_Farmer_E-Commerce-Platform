
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

export default function AdminPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role !== 'admin') {
      // router.push('/'); // Redirect if not admin
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading admin dashboard...</div>;
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center shadow-xl rounded-xl">
          <CardHeader>
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg">
              You do not have permission to view this page. This area is restricted to administrators.
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
            <LayoutDashboard className="h-10 w-10 text-primary"/> Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage users, experts, and platform settings.</p>
      </header>
      
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the AgriCheck admin panel. From here, you can manage various aspects of the platform.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            (Full functionality for user and expert management, and query handling would be built out here.)
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" disabled>Manage Users (Coming Soon)</Button>
            <Button variant="outline" disabled>Manage Experts (Coming Soon)</Button>
            <Button variant="outline" disabled>View Expert Queries (Coming Soon)</Button>
            <Button variant="outline" disabled>Platform Settings (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
