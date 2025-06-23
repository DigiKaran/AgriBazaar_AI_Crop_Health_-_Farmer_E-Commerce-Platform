
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    ShieldAlert, LayoutDashboard, Users, MessageSquare, Settings, 
    BarChart3, FileText, CheckSquare, ShoppingBasket, BookOpen, 
    BadgePercent, Wrench, Shield, Database, Megaphone 
} from 'lucide-react';
import UserManagementTable from './components/UserManagementTable';

export default function AdminPage() {
  const { userProfile, loading, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role !== 'admin') {
       router.push('/'); // Redirect if not admin and not loading
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
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header>
        <h1 className="text-4xl font-headline flex items-center gap-3">
            <LayoutDashboard className="h-10 w-10 text-primary"/> Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage users, roles, products, content, and system settings.</p>
      </header>
      
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>User Management</CardTitle>
          <CardDescription>View users and manage their roles and status (active/inactive).</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser && <UserManagementTable adminUserId={currentUser.uid} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><ShoppingBasket className="h-6 w-6 text-primary"/>Marketplace</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" disabled><CheckSquare className="mr-2 h-5 w-5"/>Approve Products</Button>
              <Button variant="outline" disabled><Settings className="mr-2 h-5 w-5"/>Manage Categories</Button>
          </CardContent>
        </Card>
         <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>Content & Queries</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin/expert-queries"><MessageSquare className="mr-2 h-5 w-5"/>Expert Queries</Link>
              </Button>
              <Button variant="outline" disabled><FileText className="mr-2 h-5 w-5"/>Manage Articles</Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" disabled><Users className="mr-2 h-5 w-5"/>User Reports</Button>
              <Button variant="outline" disabled><ShoppingBasket className="mr-2 h-5 w-5"/>Sales Trends</Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Wrench className="h-6 w-6 text-primary"/>System</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" disabled><Database className="mr-2 h-5 w-5"/>Manage Seed Data</Button>
              <Button variant="outline" disabled><Megaphone className="mr-2 h-5 w-5"/>System Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
