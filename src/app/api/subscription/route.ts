import { errorResponse, getPlan, verifyUser } from "@/lib/server/stripe";

/**
 * GET /api/subscription
 * Returns the logged-in user's plan ("basic" | "premium" | "premium-plus"),
 * read directly from their Stripe subscriptions.
 */
export async function GET(request: Request) {
  try {
    const user = await verifyUser(request);
    const plan = await getPlan(user);
    return Response.json({ plan }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return errorResponse(e);
  }
}
