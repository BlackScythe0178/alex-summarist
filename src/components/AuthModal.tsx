"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AiOutlineClose } from "react-icons/ai";
import { BsPersonFill } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { closeAuthModal, setAuthView } from "@/redux/modalSlice";
import {
  authErrorMessage,
  googleLogin,
  guestLogin,
  login,
  register,
  resetPassword,
} from "@/lib/auth";

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, view } = useAppSelector((s) => s.modal);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState<null | "guest" | "google" | "form">(null);

  // Reset the form whenever the modal opens or switches view
  useEffect(() => {
    setError("");
    setNotice("");
    setPassword("");
  }, [isOpen, view]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dispatch(closeAuthModal());
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const onSuccess = () => {
    dispatch(closeAuthModal());
    setEmail("");
    setPassword("");
    // From the home page go to For You; elsewhere stay put so the user can continue
    if (pathname === "/") router.push("/for-you");
  };

  const run = async (kind: "guest" | "google" | "form", fn: () => Promise<unknown>) => {
    setError("");
    setNotice("");
    setLoading(kind);
    try {
      await fn();
      if (view === "forgot" && kind === "form") {
        setNotice("Check your inbox for a reset link.");
      } else {
        onSuccess();
      }
    } catch (err) {
      const msg = authErrorMessage(err);
      if (msg) setError(msg);
    } finally {
      setLoading(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (view === "login") run("form", () => login(email, password));
    else if (view === "signup") run("form", () => register(email, password));
    else run("form", () => resetPassword(email));
  };

  const title =
    view === "login"
      ? "Log in to Summarist"
      : view === "signup"
        ? "Sign up to Summarist"
        : "Reset your password";

  return (
    <div className="auth__wrapper" onMouseDown={() => dispatch(closeAuthModal())}>
      <div
        className="auth"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="auth__content">
          <div className="auth__title">{title}</div>
          {error && <div className="auth__error">{error}</div>}
          {notice && <div className="auth__notice">{notice}</div>}

          {view === "login" && (
            <>
              <button
                className="btn guest__btn--wrapper"
                disabled={loading !== null}
                onClick={() => run("guest", guestLogin)}
              >
                <figure className="google__icon--mask guest__icon--mask">
                  <BsPersonFill />
                </figure>
                <div>{loading === "guest" ? <span className="spinner" /> : "Login as a Guest"}</div>
              </button>
              <div className="auth__separator">
                <span className="auth__separator--text">or</span>
              </div>
            </>
          )}

          {view !== "forgot" && (
            <>
              <button
                className="btn google__btn--wrapper"
                disabled={loading !== null}
                onClick={() => run("google", googleLogin)}
              >
                <figure className="google__icon--mask">
                  <Image src="/google.png" alt="google" width={24} height={24} />
                </figure>
                <div>
                  {loading === "google" ? (
                    <span className="spinner" />
                  ) : view === "login" ? (
                    "Login with Google"
                  ) : (
                    "Sign up with Google"
                  )}
                </div>
              </button>
              <div className="auth__separator">
                <span className="auth__separator--text">or</span>
              </div>
            </>
          )}

          <form className="auth__main--form" onSubmit={handleSubmit} noValidate>
            <input
              className="auth__main--input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {view !== "forgot" && (
              <input
                className="auth__main--input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={view === "signup" ? "new-password" : "current-password"}
              />
            )}
            <button className="btn" type="submit" disabled={loading !== null}>
              {loading === "form" ? (
                <span className="spinner" />
              ) : view === "login" ? (
                "Login"
              ) : view === "signup" ? (
                "Sign up"
              ) : (
                "Send reset password link"
              )}
            </button>
          </form>
        </div>

        {view === "login" && (
          <button className="auth__forgot--password" onClick={() => dispatch(setAuthView("forgot"))}>
            Forgot your password?
          </button>
        )}
        <button
          className="auth__switch--btn"
          onClick={() => dispatch(setAuthView(view === "login" ? "signup" : "login"))}
        >
          {view === "login"
            ? "Don't have an account?"
            : view === "signup"
              ? "Already have an account?"
              : "Go to login"}
        </button>
        <button
          className="auth__close--btn"
          aria-label="Close"
          onClick={() => dispatch(closeAuthModal())}
        >
          <AiOutlineClose />
        </button>
      </div>
    </div>
  );
}
