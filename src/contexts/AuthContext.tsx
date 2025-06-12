
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { getUserProfile } from '@/lib/firebase/auth';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          console.log("AuthContext: User authenticated, attempting to fetch profile for UID:", user.uid);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          console.log("AuthContext: User profile fetched successfully:", profile);
        } catch (error: any) {
          console.error("AuthContext: Failed to fetch user profile. UID:", user.uid, "Raw Error Object:", error);
          if (error.code) {
            console.error("AuthContext: Firebase Error Code:", error.code);
          }
          if (error.message) {
            console.error("AuthContext: Firebase Error Message:", error.message);
          }
          setUserProfile(null); // Ensure profile is null on error
        }
      } else {
        setUserProfile(null);
        console.log("AuthContext: No user authenticated or user logged out.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };
  
  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
