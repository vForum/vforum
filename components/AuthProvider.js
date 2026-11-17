"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              name: u.displayName || "Anonymous",
              photo: u.photoURL || "",
              points: 0, posts: 0, comments: 0,
              role: "user",
              createdAt: serverTimestamp(),
            });
          }
        } else setProfile(null);
        setLoading(false);
      }),
    []
  );

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (s) =>
      setProfile(s.exists() ? { id: s.id, ...s.data() } : null)
    );
  }, [user]);

  const signIn = () => signInWithPopup(auth, googleProvider).catch(() => {});
  const signOut = () => fbSignOut(auth);

  return (
    <Ctx.Provider value={{ user, profile, loading, signIn, signOut }}>{children}</Ctx.Provider>
  );
}
