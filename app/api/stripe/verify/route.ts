import { NextResponse } from "next/server";
import Stripe from "stripe";

async function getSecretKeyFromDb(): Promise<string | undefined> {
  try {
    const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) return undefined;
    const res = await fetch(`${backend.replace(/\/$/, "")}/api/admin/settings`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.appSettings?.stripeSecretKey || undefined;
  } catch (err) {
    console.error("failed to fetch settings for stripe key", err);
    return undefined;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const dbKey = await getSecretKeyFromDb();
    const secret = dbKey || process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }
    const stripe = new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

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
