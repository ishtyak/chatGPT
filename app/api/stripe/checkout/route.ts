import { NextResponse } from "next/server";
import Stripe from "stripe";

const BACKEND = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

async function getStripeSecretKey(): Promise<string | undefined> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/api-key/stripe`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch { /* fall back to env */ }
  return process.env.STRIPE_SECRET_KEY;
}

/** Fetch a single subscription plan from the backend DB. */
async function getPlanFromDb(planId: string): Promise<{ name: string; price_monthly: number; price_yearly: number; credits_included: number } | null> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/subscription-plans`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const plans: any[] = Array.isArray(data) ? data : (data.data ?? []);
    const plan = plans.find((p: any) => String(p.id) === String(planId) || p.slug === planId);
    if (!plan) return null;
    // Normalise: use dedicated price_monthly/price_yearly if present, fall back to price
    return {
      name: plan.name,
      price_monthly: Number(plan.price_monthly ?? plan.price ?? 0),
      price_yearly: Number(plan.price_yearly ?? Math.round((plan.price_monthly ?? plan.price ?? 0) * 0.83)),
      credits_included: Number(plan.ai_call_quota ?? plan.credits_included ?? 0),
    };
  } catch {
    return null;
  }
}

type LineItem = NonNullable<Stripe.Checkout.SessionCreateParams["line_items"]>[number];

function resolveLineItem(
  plan: { name: string; price_monthly: number; price_yearly: number },
  planId: string,
  billing: "monthly" | "yearly",
): LineItem {
  // Use a pre-created Stripe Price ID if provided via env
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${billing.toUpperCase()}`;
  const priceId = process.env[envKey];
  if (priceId && priceId.startsWith("price_") && priceId.length > 20) {
    return { price: priceId, quantity: 1 };
  }

  // Build inline price_data from the DB values (amounts in paise: multiply ₹ by 100)
  const isYearly = billing === "yearly";
  const unitAmount = isYearly
    ? Math.round(plan.price_yearly * 100)
    : Math.round(plan.price_monthly * 100);

  return {
    quantity: 1,
    price_data: {
      currency: "inr",
      unit_amount: unitAmount,
      product_data: {
        name: plan.name,
        description: isYearly
          ? "Annual subscription — billed once per year"
          : "Monthly subscription",
      },
      recurring: { interval: isYearly ? "year" : "month" },
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, billing, email } = body as {
      planId: string;
      billing?: "monthly" | "yearly";
      email?: string;
    };

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }
    const billingCycle: "monthly" | "yearly" =
      billing === "yearly" ? "yearly" : "monthly";

    // Fetch plan from DB
    const plan = await getPlanFromDb(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    const secret = await getStripeSecretKey();
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [resolveLineItem(plan, planId, billingCycle)],
      ...(email ? { customer_email: email } : {}),
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?cancelled=1`,
      metadata: { planId, billing: billingCycle },
      subscription_data: { metadata: { planId, billing: billingCycle } },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
