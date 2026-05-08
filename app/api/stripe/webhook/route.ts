import { NextResponse } from "next/server";
import Stripe from "stripe";

async function getStripeConfigFromDb() {
  try {
    const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) return {};
    const res = await fetch(`${backend.replace(/\/$/, "")}/api/admin/settings`);
    if (!res.ok) return {};
    const data = await res.json();
    return {
      secret: data?.appSettings?.stripeSecretKey,
      webhookSecret: data?.appSettings?.stripeWebhookSecret || data?.appSettings?.STRIPE_WEBHOOK_SECRET,
    };
  } catch (err) {
    console.error("failed to fetch stripe config from db", err);
    return {};
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const cfg = await getStripeConfigFromDb();
  const secret = cfg.secret || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = cfg.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    console.error("Stripe secret/webhook not configured");
    return NextResponse.json({ error: "Stripe configuration missing" }, { status: 500 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      /* ── New subscription created ─────────────────────────────────── */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { planId, billing } = session.metadata ?? {};
        const email = session.customer_email ?? session.customer_details?.email;
        console.log(`[stripe] checkout completed: plan=${planId} billing=${billing} email=${email}`);
        // TODO: persist subscription in DB — update users table to mark plan active
        break;
      }

      /* ── Subscription activated / renewed ────────────────────────── */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const planId = sub.metadata?.planId;
        const status = sub.status;
        console.log(`[stripe] subscription ${event.type}: planId=${planId} status=${status}`);
        // TODO: update user subscription status in DB
        break;
      }

      /* ── Subscription cancelled / lapsed ─────────────────────────── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[stripe] subscription deleted: ${sub.id}`);
        // TODO: downgrade user to free tier in DB
        break;
      }

      /* ── Payment failed ───────────────────────────────────────────── */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[stripe] payment failed: customer=${invoice.customer}`);
        // TODO: notify user via email
        break;
      }

      /* ── Payment succeeded ────────────────────────────────────────── */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe] payment succeeded: amount=${invoice.amount_paid} customer=${invoice.customer}`);
        // TODO: grant/renew credits for the billing period
        break;
      }

      default:
        // Unhandled events are silently ignored
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
