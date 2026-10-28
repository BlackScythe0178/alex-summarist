import "server-only";
import Stripe from "stripe";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Plan } from "@/types/book";

/*
 * Server-only helpers for the Stripe API routes.
 *
 * Runs on Vercel (free Hobby plan) instead of the Firebase "Run Payments with
 * Stripe" extension, so the Firebase project can stay on the free Spark plan.
 */

export const PRICE_PREMIUM_PLUS_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY ?? "";
export const PRICE_PREMIUM_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ?? "";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(500, "STRIPE_SECRET_KEY is not set on the server.");
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export interface VerifiedUser {
  uid: string;
  email: string;
}

/**
 * Verifies the Firebase ID token sent by the browser. Verifying ID tokens only
 * needs the project ID (Google's public keys are fetched automatically), so no
 * service account or paid plan is required.
 */
export async function verifyUser(request: Request): Promise<VerifiedUser> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "You need to be logged in.");

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new HttpError(500, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set.");
  if (!getApps().length) initializeApp({ projectId });

  try {
    const decoded = await getAuth().verifyIdToken(token);
    if (!decoded.email) throw new HttpError(400, "Your account has no email address.");
    return { uid: decoded.uid, email: decoded.email };
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(401, "Your session has expired. Please log in again.");
  }
}

/** Finds the Stripe customer for this Firebase user (by email + uid metadata). */
export async function findCustomer(user: VerifiedUser): Promise<Stripe.Customer | null> {
  const { data } = await getStripe().customers.list({ email: user.email, limit: 10 });
  return data.find((c) => c.metadata?.firebaseUID === user.uid) ?? data[0] ?? null;
}

export async function findOrCreateCustomer(user: VerifiedUser): Promise<Stripe.Customer> {
  const existing = await findCustomer(user);
  if (existing) return existing;
  return getStripe().customers.create({
    email: user.email,
    metadata: { firebaseUID: user.uid },
  });
}

function planFromPrice(price: Stripe.Price | undefined): Plan {
  if (!price) return "premium";
  if (PRICE_PREMIUM_PLUS_YEARLY && price.id === PRICE_PREMIUM_PLUS_YEARLY) return "premium-plus";
  if (PRICE_PREMIUM_MONTHLY && price.id === PRICE_PREMIUM_MONTHLY) return "premium";
  return price.recurring?.interval === "year" ? "premium-plus" : "premium";
}

/** Current plan, read straight from Stripe: active or trialing subscriptions count. */
export async function getPlan(user: VerifiedUser): Promise<Plan> {
  const customer = await findCustomer(user);
  if (!customer) return "basic";
  const { data } = await getStripe().subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 20,
  });
  const live = data.filter((s) => s.status === "active" || s.status === "trialing");
  if (!live.length) return "basic";
  const plans = live.map((s) => planFromPrice(s.items.data[0]?.price));
  return plans.includes("premium-plus") ? "premium-plus" : "premium";
}

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
  const message = e instanceof Stripe.errors.StripeError ? e.message : "Something went wrong.";
  console.error(e);
  return Response.json({ error: message }, { status: 500 });
}
