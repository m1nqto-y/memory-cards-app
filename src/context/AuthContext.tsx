"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                // User is available in result.user
                // onAuthStateChanged will handle setting the user state.
            }
        } catch (error) {
            console.error("Error getting redirect result: ", error);
        } finally {
            // After processing the redirect, set up the auth state listener.
            // This ensures we don't have race conditions between getRedirectResult and onAuthStateChanged.
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            });
            return unsubscribe;
        }
    };

    const unsubscribePromise = processRedirectResult();

    // Make sure to unsubscribe when the component unmounts.
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // We don't need to set loading to true here because the page will reload.
    // The initial loading state will cover it.
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      setLoading(false); // Set loading to false if sign-in fails.
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut: logOut };

  // Render children only when not loading to prevent flashing of logged-out content
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
