import {
  errorResponse,
  findOrCreateCustomer,
  getStripe,
  HttpError,
  PRICE_PREMIUM_MONTHLY,
  PRICE_PREMIUM_PLUS_YEARLY,
  verifyUser,
} from "@/lib/server/stripe";

/**
 * POST /api/checkout  { priceId }
 * Creates a Stripe Checkout Session for the logged-in user and returns its URL.
 * The yearly Premium Plus plan gets a 7-day free trial.
 */
export async function POST(request: Request) {
  try {
    const user = await verifyUser(request);
    const { priceId } = (await request.json().catch(() => ({}))) as { priceId?: string };

    const allowed = [PRICE_PREMIUM_PLUS_YEARLY, PRICE_PREMIUM_MONTHLY].filter(Boolean);
    if (!allowed.length) throw new HttpError(500, "Stripe price IDs are not set on the server.");
    if (!priceId || !allowed.includes(priceId)) throw new HttpError(400, "Unknown plan.");

    const customer = await findOrCreateCustomer(user);
    const origin = new URL(request.url).origin;
    const isYearly = priceId === PRICE_PREMIUM_PLUS_YEARLY;

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      client_reference_id: user.uid,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { firebaseUID: user.uid },
        ...(isYearly ? { trial_period_days: 7 } : {}),
      },
      success_url: `${origin}/for-you`,
      cancel_url: `${origin}/choose-plan`,
    });

    if (!session.url) throw new HttpError(500, "Stripe didn't return a checkout URL.");
    return Response.json({ url: session.url });
  } catch (e) {
    return errorResponse(e);
  }
}
