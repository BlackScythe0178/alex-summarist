import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { Plan } from "@/types/book";

export const PRICE_PREMIUM_PLUS_YEARLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY ?? "";
export const PRICE_PREMIUM_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ?? "";

/** Works out which plan an active Stripe subscription document (from the extension) belongs to. */
export function planFromSubscription(sub: DocumentData): Plan {
  const priceId: string | undefined =
    sub.price?.id ?? sub.items?.[0]?.price?.id ?? sub.items?.[0]?.plan?.id;
  if (priceId && priceId === PRICE_PREMIUM_PLUS_YEARLY) return "premium-plus";
  if (priceId && priceId === PRICE_PREMIUM_MONTHLY) return "premium";

  // Fallbacks: billing interval or product name / role metadata
  const interval: string | undefined =
    sub.items?.[0]?.price?.recurring?.interval ?? sub.items?.[0]?.plan?.interval;
  if (interval === "year") return "premium-plus";
  const name: string = (
    sub.items?.[0]?.price?.product?.name ?? sub.role ?? ""
  ).toLowerCase();
  if (name.includes("plus")) return "premium-plus";
  return "premium";
}

/**
 * Listens to the user's active/trialing subscriptions written by the
 * "Run Payments with Stripe" extension and reports the current plan.
 */
export function listenToPlan(uid: string, cb: (plan: Plan) => void) {
  const q = query(
    collection(getDb(), "customers", uid, "subscriptions"),
    where("status", "in", ["trialing", "active"])
  );
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) return cb("basic");
      const plans = snap.docs.map((d) => planFromSubscription(d.data()));
      cb(plans.includes("premium-plus") ? "premium-plus" : plans[0]);
    },
    () => cb("basic")
  );
}

/**
 * Creates a Checkout Session through the Stripe extension and resolves with
 * the hosted Checkout URL once the extension has written it back.
 */
export async function createCheckoutSession(
  uid: string,
  priceId: string,
  withTrial: boolean
): Promise<string> {
  if (!priceId) {
    throw new Error("Stripe price ID is missing. Set it in your environment variables.");
  }
  const origin = window.location.origin;
  const payload: Record<string, unknown> = {
    price: priceId,
    success_url: `${origin}/for-you`,
    cancel_url: `${origin}/choose-plan`,
    allow_promotion_codes: true,
  };
  if (withTrial) payload.trial_period_days = 7;

  const ref = doc(collection(getDb(), "customers", uid, "checkout_sessions"));

  return new Promise((resolve, reject) => {
    // Tracks how far we got, so a timeout can say which step stalled
    let savedToServer = false;
    let settled = false;
    let unsub: () => void = () => {};

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsub();
      fn();
    };

    // One timer for the whole flow, including saving the request
    const timeout = setTimeout(() => {
      finish(() =>
        reject(
          new Error(
            savedToServer
              ? "Stripe didn't respond. Check the Run Payments with Stripe extension is installed with the customers collection and a valid Stripe key."
              : "Firestore didn't confirm the checkout request. Check Cloud Firestore exists in this project and the rules are published, then see the browser console for the exact error."
          )
        )
      );
    }, 30000);

    unsub = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snap) => {
        if (!snap.metadata.hasPendingWrites && snap.exists()) savedToServer = true;
        const data = snap.data();
        if (!data) return;
        if (data.error) {
          finish(() => reject(new Error(data.error.message ?? "Checkout failed.")));
        } else if (data.url) {
          finish(() => resolve(data.url as string));
        }
      },
      (err) => finish(() => reject(new Error(`Checkout failed: ${err.message}`)))
    );

    setDoc(ref, payload)
      .then(() => {
        savedToServer = true;
      })
      .catch((err: Error) => finish(() => reject(new Error(`Checkout failed: ${err.message}`))));
  });
}
