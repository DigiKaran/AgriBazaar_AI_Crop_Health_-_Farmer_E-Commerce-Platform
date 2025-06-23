
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "./index";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { UserProfile } from '@/types';

export const signUpWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await createUserProfileDocument(userCredential.user);
  }
  return userCredential;
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    if (userCredential.user) {
      // Ensure a user profile document is created or exists
      await createUserProfileDocument(userCredential.user);
    }
    return userCredential;
  } catch (error) {
    // Handle common errors like popup closed by user, network error, etc.
    console.error("Error during Google sign-in:", error);
    throw error; // Re-throw to be caught by the calling component
  }
};

export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

export const createUserProfileDocument = async (user: FirebaseUser, additionalData?: Partial<UserProfile>) => {
  if (!user) return;

  const userRef = doc(db, `users/${user.uid}`);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, uid, photoURL } = user; // Added photoURL
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || email?.split('@')[0] || 'User',
        photoURL: photoURL || null, // Save photoURL from Google
        createdAt,
        role: 'farmer', // Default role for new profiles
        status: 'active', // Default status for new profiles
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw error;
    }
  } else {
    // If user exists, update their photoURL if it's different and provided (e.g. from Google)
    const existingData = snapshot.data() as UserProfile;
    if (user.photoURL && existingData.photoURL !== user.photoURL) {
      try {
        await setDoc(userRef, { photoURL: user.photoURL }, { merge: true });
      } catch (error) {
        console.error("Error updating user photoURL", error);
      }
    }
  }
  return userRef;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, `users/${uid}`);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    // Provide default values for role and status if they don't exist on the document
    const profile: UserProfile = {
      role: 'farmer',
      status: 'active',
      ...data
    } as UserProfile;
    return profile;
  }
  return null;
};
