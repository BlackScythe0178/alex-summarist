"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { makeStore, type AppStore } from "@/redux/store";
import { setPlan, setUser } from "@/redux/userSlice";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { listenToPlan } from "@/lib/subscription";
import AuthModal from "./AuthModal";

function AuthListener({ store }: { store: AppStore }) {
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn("Firebase env vars missing — running in logged-out mode.");
      store.dispatch(setUser(null));
      return;
    }
    let unsubPlan: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      unsubPlan?.();
      unsubPlan = null;
      if (fbUser) {
        store.dispatch(setUser({ uid: fbUser.uid, email: fbUser.email }));
        unsubPlan = listenToPlan(fbUser.uid, (plan) => store.dispatch(setPlan(plan)));
      } else {
        store.dispatch(setUser(null));
      }
    });
    return () => {
      unsubAuth();
      unsubPlan?.();
    };
  }, [store]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <AuthListener store={storeRef.current} />
      {children}
      <AuthModal />
    </Provider>
  );
}
