import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { getUserDoc, updateUser } from '../lib/firestore';
import { signInWithEmail, signOutUser } from '../../lib/firebase';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle case where Firebase config is missing (dev without .env)
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      // No Firebase — run in unauthenticated mode
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
          let userData = await getUserDoc(firebaseUser.uid);
          
          if (!userData && firebaseUser.email) {
            const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const oldDoc = snapshot.docs[0];
              await setDoc(doc(db, 'users', firebaseUser.uid), oldDoc.data());
              await deleteDoc(doc(db, 'users', oldDoc.id));
              userData = await getUserDoc(firebaseUser.uid);
            }
          }

          if (userData) {
            setUser(userData);
            await updateUser(firebaseUser.uid, { isOnline: true });

            const handleUnload = () => {
              updateUser(firebaseUser.uid, { isOnline: false }).catch(() => {});
            };
            window.addEventListener('beforeunload', handleUnload);
            setLoading(false);
            return () => window.removeEventListener('beforeunload', handleUnload);
          } else {
            // User has Firebase Auth but no Firestore profile
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user doc:', err);
          setUser(null);
        }
        setLoading(false);
      });

    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmail(email, password);
    const userData = await getUserDoc(cred.user.uid);
    if (userData) {
      setUser(userData);
      await updateUser(cred.user.uid, { isOnline: true });
    }
  };

  const signOut = async () => {
    if (user) {
      await updateUser(user.uid, { isOnline: false }).catch(() => {});
    }
    await signOutUser();
    setUser(null);
  };

  // Always render children — loading state is exposed via context
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
