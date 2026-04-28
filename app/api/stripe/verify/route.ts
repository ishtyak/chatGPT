import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    return NextResponse.json({
      status: session.status,
      planId: session.metadata?.planId,
      billing: session.metadata?.billing,
      email: session.customer_email ?? session.customer_details?.email,
    });
  } catch (err) {
    console.error("[stripe/verify]", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
