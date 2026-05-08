"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPlans } from "@/services/admin/plans.service";
import type { Plan as BackendPlan } from "@/types/admin";

/* ── Plan definitions ──────────────────────────────────────────────────────── */
type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  badge?: { label: string; color: string; bg: string };
  monthly: { price: number; original: number };
  yearly: { price: number; original: number; annual: number; save: number };
  credits: string;
  buttonLabel: string;
  features: { icon: string; text: string }[];
  borderColor: string;
  bgGradient?: string;
}

/* Colour palette cycling for dynamically loaded plans */
const PALETTE = [
  {
    borderColor: "border-gray-200",
    bgGradient: undefined as string | undefined,
    icon: "✦",
  },
  {
    borderColor: "border-blue-300",
    bgGradient: "from-blue-50/60 to-white",
    icon: "✦",
  },
  {
    borderColor: "border-orange-300",
    bgGradient: "from-orange-50/60 to-white",
    icon: "💎",
    badge: { label: "Popular", color: "text-white", bg: "bg-orange-400" },
  },
  {
    borderColor: "border-purple-300",
    bgGradient: "from-purple-50/60 to-white",
    icon: "👑",
    badge: { label: "Best Value", color: "text-white", bg: "bg-purple-500" },
  },
] as const;

/* Map a backend feature string to an icon */
const FEATURE_ICONS: [RegExp, string][] = [
  [/model/i, "🌐"],
  [/slash/i, "⌨️"],
  [/agent/i, "⚡"],
  [/app/i, "🧩"],
  [/schedul/i, "🔄"],
  [/voice/i, "🎙️"],
  [/context/i, "📄"],
  [/storage|file/i, "📊"],
  [/credit/i, "🪙"],
];
function featureIcon(text: string): string {
  for (const [re, icon] of FEATURE_ICONS) {
    if (re.test(text)) return icon;
  }
  return "✓";
}

function toUiPlan(raw: BackendPlan, index: number): Plan {
  const palette = PALETTE[index % PALETTE.length];
  const monthly = raw.priceMonthly;
  const yearlyPrice = Math.round(monthly * 0.83);
  const yearlyAnnual = yearlyPrice * 12;
  const yearlySave = monthly * 12 - yearlyAnnual;

  return {
    id: raw.id,
    name: raw.name,
    icon: palette.icon,
    tagline: raw.description || `${raw.name} plan`,
    badge: "badge" in palette ? (palette as { badge: Plan["badge"] }).badge : undefined,
    monthly: { price: monthly, original: monthly },
    yearly: {
      price: yearlyPrice,
      original: monthly,
      annual: yearlyAnnual,
      save: yearlySave,
    },
    credits:
      raw.aiCallQuota > 0
        ? `${raw.aiCallQuota.toLocaleString()} credits/month`
        : "",
    buttonLabel: `Get ${raw.name}`,
    features: raw.features.map((f) => ({ icon: featureIcon(f), text: f })),
    borderColor: palette.borderColor,
    bgGradient: palette.bgGradient,
  };
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRICING PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    getPlans()
      .then((rows) => {
        const active = rows.filter((p) => p.isActive);
        setPlans(active.map(toUiPlan));
      })
      .catch(() => {/* silently show empty state */})
      .finally(() => setLoadingPlans(false));
  }, []);

  async function handleSubscribe(plan: Plan) {
    if (!session) {
      router.push("/?auth=login");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billing,
          email: session.user?.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create checkout session");
      }

      const { url } = await res.json();
      router.push(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to app
        </button>
        <div className="text-sm font-semibold text-gray-900">Softkey AI</div>
        <div className="w-24" />
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to start creating</h1>
        <p className="text-gray-500 text-base mb-8">Choose a plan to unlock all AI features.</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              billing === "monthly"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              billing === "yearly"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Yearly
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loadingPlans ? (
          /* Loading skeleton */
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
            >
              <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-3 w-36 bg-gray-100 rounded mb-6" />
              <div className="h-8 w-28 bg-gray-200 rounded mb-6" />
              <div className="h-10 w-full bg-gray-200 rounded-xl mb-5" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-3 w-full bg-gray-100 rounded mb-3" />
              ))}
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-4 text-center py-16 text-gray-400 text-sm">
            No active plans available. Please check back later.
          </div>
        ) : (
        plans.map((plan) => {
          const isYearly = billing === "yearly";
          const price = isYearly ? plan.yearly.price : plan.monthly.price;
          const original = isYearly ? plan.yearly.original : null;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border ${plan.borderColor} bg-gradient-to-b ${
                plan.bgGradient ?? "from-white to-white"
              } p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${plan.badge.bg} ${plan.badge.color}`}
                >
                  {plan.badge.label}
                </span>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{plan.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>

              {/* Price */}
              <div className="mb-1">
                {original && (
                  <span className="text-sm text-gray-400 line-through mr-1">{fmt(original)}</span>
                )}
                <span className="text-3xl font-bold text-gray-900">{fmt(price)}</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>

              {/* Yearly billing summary */}
              {isYearly && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs text-green-600">Billed as {fmt(plan.yearly.annual)}/year</span>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Save {fmt(plan.yearly.save)}
                  </span>
                </div>
              )}
              {!isYearly && <div className="mb-3 h-[22px]" />}

              {/* Credits */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-5">
                <span>🪙</span>
                <span>{plan.credits}</span>
              </div>

              {/* CTA button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    {plan.buttonLabel}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-base leading-none">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
        )}
      </div>

      {/* Footer note */}
      <div className="text-center pb-10 text-xs text-gray-400 px-4">
        Prices are in Indian Rupees (₹) and include applicable taxes. Cancel anytime.{" "}
        <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          Powered by Stripe
        </a>
        .
      </div>
    </div>
  );
}
