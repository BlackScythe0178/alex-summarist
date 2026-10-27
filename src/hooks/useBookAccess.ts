"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";
import type { Book } from "@/types/book";

/**
 * Read / Listen gating:
 *  - not logged in              → auth modal
 *  - premium book, not subscribed → /choose-plan
 *  - otherwise                  → /player/[id]
 */
export function useBookAccess() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, plan, subscriptionReady } = useAppSelector((s) => s.user);

  return (book: Book) => {
    if (!user) {
      dispatch(openAuthModal("login"));
    } else if (book.subscriptionRequired && !subscriptionReady) {
      // Subscription status is still loading; ignore the click rather than mis-route a subscriber
      return;
    } else if (book.subscriptionRequired && plan === "basic") {
      router.push("/choose-plan");
    } else {
      router.push(`/player/${book.id}`);
    }
  };
}
