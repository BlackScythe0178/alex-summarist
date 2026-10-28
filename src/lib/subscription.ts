import { getFirebaseAuth } from "./firebase";
import type { Plan } from "@/types/book";

/*
 * Subscriptions are handled by this app's own API routes on Vercel
 * (src/app/api/checkout and src/app/api/subscription), which talk to Stripe
 * directly. No Firebase extension or paid Firebase plan is needed.
 */

export const PRICE_PREMIUM_PLUS_YEARLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY ?? "";
export const PRICE_PREMIUM_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ?? "";

async function authedFetch(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("You need to be logged in.");
  const token = await user.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((body.error as string) ?? `Request failed (${res.status})`);
  return body;
}

export async function fetchPlan(): Promise<Plan> {
  const { plan } = await authedFetch("/api/subscription");
  return plan === "premium" || plan === "premium-plus" ? plan : "basic";
}

/**
 * Reports the user's plan now, and again whenever the tab regains focus
 * (e.g. coming back from Stripe Checkout). Returns an unsubscribe function.
 */
export function listenToPlan(uid: string, cb: (plan: Plan) => void) {
  let active = true;
  const load = () => {
    if (getFirebaseAuth().currentUser?.uid !== uid) return;
    fetchPlan()
      .then((plan) => active && cb(plan))
      .catch((e) => {
        console.error("Couldn't load subscription:", e);
        if (active) cb("basic");
      });
  };
  load();
  const onVisible = () => document.visibilityState === "visible" && load();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    active = false;
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/** Asks the server for a Stripe Checkout URL for the chosen price. */
export async function createCheckoutSession(priceId: string): Promise<string> {
  if (!priceId) {
    throw new Error("Stripe price ID is missing. Set it in your environment variables.");
  }
  const { url } = await authedFetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ priceId }),
  });
  if (typeof url !== "string") throw new Error("Checkout failed. Please try again.");
  return url;
}
