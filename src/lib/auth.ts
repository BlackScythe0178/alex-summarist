import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { getFirebaseAuth } from "./firebase";

export const GUEST_EMAIL = process.env.NEXT_PUBLIC_GUEST_EMAIL || "guest@gmail.com";
export const GUEST_PASSWORD = process.env.NEXT_PUBLIC_GUEST_PASSWORD || "guest123";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthFormError extends Error {}

function validateEmail(email: string) {
  if (!EMAIL_RE.test(email.trim())) throw new AuthFormError("Invalid email");
}

export async function login(email: string, password: string) {
  validateEmail(email);
  if (!password) throw new AuthFormError("Please enter your password");
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function register(email: string, password: string) {
  validateEmail(email);
  if (password.length < 6) {
    throw new AuthFormError("Password should be at least 6 characters");
  }
  return createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export function guestLogin() {
  return signInWithEmailAndPassword(getFirebaseAuth(), GUEST_EMAIL, GUEST_PASSWORD);
}

export function googleLogin() {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export async function resetPassword(email: string) {
  validateEmail(email);
  return sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export function logout() {
  return signOut(getFirebaseAuth());
}

/** Turns Firebase / validation errors into the short messages shown in the modal. */
export function authErrorMessage(err: unknown): string {
  if (err instanceof AuthFormError) return err.message;
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "Invalid email";
      case "auth/user-not-found":
        return "User not found";
      // Returned instead of user-not-found while email enumeration protection is on
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        return "User not found or incorrect password";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/missing-password":
        return "Please enter your password";
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "";
      case "auth/network-request-failed":
        return "Network error. Check your connection";
      // Setup problems in the Firebase project — name them so they're easy to fix
      case "auth/operation-not-allowed":
        return "This sign-in method isn't enabled in Firebase (Authentication > Sign-in method)";
      case "auth/configuration-not-found":
        return "Firebase Authentication isn't set up yet (click Get started in Authentication)";
      case "auth/unauthorized-domain":
        return "This domain isn't authorized in Firebase (Authentication > Settings > Authorized domains)";
      case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      case "auth/invalid-api-key":
        return "Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY";
      case "auth/popup-blocked":
        return "Popup blocked. Allow popups for this site and try again";
      default:
        return `Something went wrong (${err.code}). Please try again`;
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again";
}
