"use client";

import Image from "next/image";
import { useAppDispatch } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";

/** Logged-out state for Settings and Library: login.png illustration above a Login button. */
export default function LoginPrompt({ text }: { text: string }) {
  const dispatch = useAppDispatch();
  return (
    <div className="settings__login--wrapper">
      <Image src="/login.png" alt="login" width={1033} height={712} />
      <div className="settings__login--text">{text}</div>
      <button className="btn settings__login--btn" onClick={() => dispatch(openAuthModal("login"))}>
        Login
      </button>
    </div>
  );
}
