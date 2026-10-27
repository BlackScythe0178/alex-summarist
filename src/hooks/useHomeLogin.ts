"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";

/** Home page "Login" buttons: go straight to /for-you when signed in, otherwise open the auth modal. */
export function useHomeLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  return () => {
    if (user) router.push("/for-you");
    else dispatch(openAuthModal("login"));
  };
}
