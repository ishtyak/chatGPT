"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  buttonStyle: "dark" | "outline-blue" | "outline-orange" | "outline-purple";
  features: { icon: string; text: string }[];
  borderColor: string;
  bgGradient?: string;
}

const PLANS: Plan[] = [
  {
    id: "plus",
    name: "Plus",
    icon: "✦",
    tagline: "For everyday AI tasks.",
    monthly: { price: 889, original: 889 },
    yearly: { price: 741, original: 889, annual: 8893, save: 1775 },
    credits: "500 credits/month",
    buttonLabel: "Get Plus",
    buttonStyle: "dark",
    borderColor: "border-gray-200",
    features: [
      { icon: "🌐", text: "350+ AI models" },
      { icon: "⌨️", text: "All slash commands" },
      { icon: "⚡", text: "Krater Agent" },
      { icon: "🧩", text: "Apps & Additions" },
      { icon: "🔄", text: "Scheduled tasks" },
      { icon: "🎙️", text: "Voice mode" },
      { icon: "📄", text: "64k context window" },
      { icon: "📊", text: "5 GB file storage" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: "✦",
    tagline: "For power users and creators.",
    monthly: { price: 1976, original: 1976 },
    yearly: { price: 1647, original: 1976, annual: 19762, save: 3950 },
    credits: "1,500 credits/month",
    buttonLabel: "Get Pro",
    buttonStyle: "dark",
    borderColor: "border-blue-300",
    bgGradient: "from-blue-50/60 to-white",
    features: [
      { icon: "🌐", text: "350+ AI models" },
      { icon: "⌨️", text: "All slash commands" },
      { icon: "⚡", text: "Krater Agent" },
      { icon: "🧩", text: "Apps & Additions" },
      { icon: "🔄", text: "Scheduled tasks" },
      { icon: "🎙️", text: "Voice mode" },
      { icon: "📄", text: "128k context window" },
      { icon: "📊", text: "25 GB file storage" },
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    icon: "💎",
    tagline: "For power users who need more.",
    badge: { label: "Popular", color: "text-white", bg: "bg-orange-400" },
    monthly: { price: 4842, original: 4842 },
    yearly: { price: 4035, original: 4842, annual: 48417, save: 9687 },
    credits: "4,000 credits/month",
    buttonLabel: "Get Ultra",
    buttonStyle: "dark",
    borderColor: "border-orange-300",
    bgGradient: "from-orange-50/60 to-white",
    features: [
      { icon: "🌐", text: "350+ AI models" },
      { icon: "⌨️", text: "All slash commands" },
      { icon: "⚡", text: "Krater Agent" },
      { icon: "🧩", text: "Apps & Additions" },
      { icon: "🔄", text: "Scheduled tasks" },
      { icon: "🎙️", text: "Voice mode" },
      { icon: "📄", text: "200k context window" },
      { icon: "📊", text: "100 GB file storage" },
    ],
  },
  {
    id: "max",
    name: "Max",
    icon: "👑",
    tagline: "For teams and heavy usage.",
    badge: { label: "Best Value", color: "text-white", bg: "bg-purple-500" },
    monthly: { price: 11758, original: 11758 },
    yearly: { price: 9799, original: 11758, annual: 117585, save: 23511 },
    credits: "10,000 credits/month",
    buttonLabel: "Get Max",
    buttonStyle: "dark",
    borderColor: "border-purple-300",
    bgGradient: "from-purple-50/60 to-white",
    features: [
      { icon: "🌐", text: "350+ AI models" },
      { icon: "⌨️", text: "All slash commands" },
      { icon: "⚡", text: "Krater Agent" },
      { icon: "🧩", text: "Apps & Additions" },
      { icon: "🔄", text: "Scheduled tasks" },
      { icon: "🎙️", text: "Voice mode" },
      { icon: "📄", text: "500k context window" },
      { icon: "📊", text: "500 GB file storage" },
    ],
  },
];

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
  const { data: session } = useSession();
  const router = useRouter();

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
        {PLANS.map((plan) => {
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
        })}
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
