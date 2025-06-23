'use client';

import { useEffect, useState } from 'react';
import type { AdminDashboardStats } from '@/types';
import { getAdminDashboardStatsAction } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Settings, UserCheck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStatsCardsProps {
  adminUserId: string;
}

export default function AdminStatsCards({ adminUserId }: AdminStatsCardsProps) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getAdminDashboardStatsAction(adminUserId);
      if (result.stats) {
        setStats(result.stats);
      } else {
        setError(result.error || 'An unknown error occurred while fetching stats.');
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [adminUserId]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-3/4 mt-1" /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Diagnosis Queries</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-3/4 mt-1" /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Marketplace</CardTitle><Settings className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardContent></Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load dashboard stats</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
            <span>{stats.usersByRole.farmer} farmers</span>
            <span className="flex items-center"><UserCheck className="h-3 w-3 mr-1"/>{stats.usersByRole.expert} experts</span>
            <span className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1"/>{stats.usersByRole.admin} admins</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Diagnosis Queries</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDiagnoses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingQueries} pending expert review
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marketplace Categories</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCategories}</div>
           <p className="text-xs text-muted-foreground">
            Total product categories defined.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
