
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
  type User as FirebaseUser
} from "firebase/auth";
import { auth, db } from "./index";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { UserProfile } from '@/types';

export const signUpWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    // New users default to 'farmer' role
    await createUserProfileDocument(userCredential.user, { role: 'farmer' });
  }
  return userCredential;
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

export const createUserProfileDocument = async (user: FirebaseUser, additionalData?: Partial<UserProfile>) => {
  if (!user) return;

  const userRef = doc(db, `users/${user.uid}`);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, uid } = user;
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || email?.split('@')[0] || 'User',
        createdAt,
        role: 'farmer', // Default role for new profiles
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw error;
    }
  }
  return userRef;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, `users/${uid}`);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    // Ensure role is present, default to 'farmer' if somehow missing for older docs
    const data = snapshot.data();
    return { role: 'farmer', ...data } as UserProfile;
  }
  return null;
};
