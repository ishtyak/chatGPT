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


/* ── Plan catalogue (source of truth for prices) ──────────────────────────
   Amounts are in the smallest currency unit (paise for INR, so ₹889 = 88900).
   If you have pre-created Price IDs in Stripe Dashboard, set them in .env.local
   as STRIPE_PRICE_<PLAN>_<BILLING> and they will be used instead.
────────────────────────────────────────────────────────────────────────── */
interface PlanConfig {
  name: string;
  monthly: { amount: number };   // in paise (1 INR = 100 paise)
  yearly:  { amount: number };   // billed as total annual amount
}

// const PLAN_CONFIG: Record<string, PlanConfig> = {
//   plus:  { name: "Softkey AI Plus",  monthly: { amount: 88900  }, yearly: { amount: 889300  } },
//   pro:   { name: "Softkey AI Pro",   monthly: { amount: 197600 }, yearly: { amount: 1976200 } },
//   ultra: { name: "Softkey AI Ultra", monthly: { amount: 484200 }, yearly: { amount: 4841700 } },
//   max:   { name: "Softkey AI Max",   monthly: { amount: 1175800 }, yearly: { amount: 11758500 } },
// };

/* ── Resolve price: use pre-created ID if provided, else inline price_data ─ */
type LineItem = NonNullable<Stripe.Checkout.SessionCreateParams["line_items"]>[number];

function resolveLineItem(
  planId: string,
  billing: "monthly" | "yearly"
): LineItem {
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${billing.toUpperCase()}`;
  const priceId = process.env[envKey];

  // Use pre-created Price ID only if it looks like a real Stripe ID
  if (priceId && priceId.startsWith("price_") && priceId.length > 20) {
    return { price: priceId, quantity: 1 };
  }

  // Otherwise build inline price_data so no Dashboard setup is required
  const plan = PLAN_CONFIG?.[planId];
  const isYearly = billing === "yearly";

  if (plan) {
    return {
      quantity: 1,
      price_data: {
        currency: "inr",
        unit_amount: isYearly ? plan.yearly.amount : plan.monthly.amount,
        product_data: {
          name: plan.name,
          description: isYearly ? "Annual subscription — billed once per year" : "Monthly subscription",
        },
        recurring: {
          interval: isYearly ? "year" : "month",
        },
      },
    };
  }

  // If PLAN_CONFIG isn't defined for this planId, we will build a placeholder
  // item; caller should supply a proper line item instead by fetching the
  // plan from the backend. This function returns a minimal fallback.
  return { quantity: 1, price: process.env.STRIPE_DEFAULT_PRICE_ID } as LineItem;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, billing, email } = body as {
      planId: string;
      billing: "monthly" | "yearly";
      email?: string;
    };

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }
    if (!billing || !["monthly", "yearly"].includes(billing)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Resolve Stripe secret key (prefer DB value)
    const dbKey = await getSecretKeyFromDb();
    const secret = dbKey || process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }

    const stripe = new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
    // Try to resolve plan details from backend subscription plans
    let lineItem: LineItem | null = null;
    try {
      const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backend) {
        const res = await fetch(`${backend.replace(/\/$/, "")}/api/admin/plans`);
        if (res.ok) {
          const data = await res.json();
          // backend returns either array or { data: [] }
          const rows = Array.isArray(data) ? data : data?.data ?? [];
          const found = rows.find((p: any) => String(p.id) === String(planId) || (p.name && p.name.toLowerCase().replaceAll(" ", "-") === String(planId)));
          if (found) {
            const priceRupees = Number(found.price || 0);
            const unitAmount = Math.round(priceRupees * 100); // convert to paise
            lineItem = {
              quantity: 1,
              price_data: {
                currency: "inr",
                unit_amount: unitAmount,
                product_data: {
                  name: found.name,
                  description: billing === "yearly" ? "Annual subscription — billed once per year" : "Monthly subscription",
                },
                recurring: { interval: billing === "yearly" ? "year" : "month" },
              },
            } as LineItem;
          }
        }
      }
    } catch (err) {
      console.warn("failed to fetch plan from backend", err);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem ?? resolveLineItem(planId, billing)],
      ...(email ? { customer_email: email } : {}),
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/`,
      metadata: { planId, billing },
      subscription_data: { metadata: { planId, billing } },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
