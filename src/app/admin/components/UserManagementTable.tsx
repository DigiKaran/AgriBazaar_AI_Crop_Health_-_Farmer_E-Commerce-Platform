
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { fetchAllUsersAction, updateUserRoleAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Save, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from 'date-fns';


interface UserManagementTableProps {
  adminUserId: string;
}

export default function UserManagementTable({ adminUserId }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoles, setUpdatingRoles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchAllUsersAction(adminUserId);
    if (result.users) {
      setUsers(result.users);
    } else {
      setError(result.error || 'Failed to fetch users.');
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not load user data.' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [adminUserId]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.uid === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const handleSaveChanges = async (userId: string) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    setUpdatingRoles(prev => ({ ...prev, [userId]: true }));
    const result = await updateUserRoleAction(userId, user.role, adminUserId);
    if (result.success) {
      toast({ title: 'Success', description: `Role for ${user.displayName || user.email} updated to ${user.role}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update role.' });
      // Optionally revert role change in local state if API call fails
      fetchUsers(); // Refetch to ensure consistency
    }
    setUpdatingRoles(prev => ({ ...prev, [userId]: false }));
  };

  const roleOptions: UserRole[] = ['farmer', 'expert', 'admin'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load users</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (users.length === 0) {
    return <p className="text-muted-foreground">No users found in the system.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>A list of all registered users in the AgriCheck system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="w-[250px]">Change Role</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <div className="font-medium">{user.displayName || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{user.uid}</div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                 <Badge variant={user.role === 'admin' ? 'default' : user.role === 'expert' ? 'secondary' : 'outline'} className="capitalize">
                    {user.role === 'admin' && <ShieldCheck className="mr-1 h-3 w-3" />}
                    {user.role === 'expert' && <UserCog className="mr-1 h-3 w-3" />}
                    {user.role}
                 </Badge>
              </TableCell>
              <TableCell>
                {user.createdAt?.seconds ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true }) : 'Unknown'}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole) => handleRoleChange(user.uid, newRole as UserRole)}
                  disabled={updatingRoles[user.uid] || user.uid === adminUserId} // Admin cannot change their own role via this table
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => handleSaveChanges(user.uid)}
                  disabled={updatingRoles[user.uid] || user.uid === adminUserId}
                  variant="outline"
                >
                  {updatingRoles[user.uid] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Save</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
