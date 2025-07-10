"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
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
    // onAuthStateChanged は認証状態の変更（ログイン、ログアウト）を監視するリスナー
    // このリスナーは、マウント時に現在のユーザー状態を一度返し、その後変更があるたびに再度返します。
    // このアプローチにより、リダイレクト後もユーザー情報を確実に取得できます。
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // コンポーネントがアンマウントされる際にリスナーをクリーンアップします。
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true); // リダイレクトが開始される前にローディング状態にする
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // signInWithRedirectはページを離れるため、この後のコードは実行されません。
      // 認証結果のハンドリングはonAuthStateChangedリスナーに任せます。
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      setLoading(false); // エラーが発生した場合はローディングを解除
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // ログアウトが成功すると、onAuthStateChangedリスナーが再度発火し、
      // userがnullに設定され、UIが更新されます。
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      // onAuthStateChangedが呼ばれるので、ここでsetLoading(false)は不要です。
    }
  };

  const value = { user, loading, signInWithGoogle, signOut: logOut };

  // 最初の認証状態の確認が終わるまで、子コンポーネントを描画しない
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
