"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPlans } from "@/services/admin/plans.service";
import type { Plan as BackendPlan } from "@/types/admin";
import { enqueueSnackbar } from "notistack";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type BillingCycle = "monthly" | "yearly";

interface UiPlan {
  id: string;
  slug?: string;
  name: string;
  icon: string;
  tagline: string;
  badge?: { label: string; color: string; bg: string };
  monthly: number;
  yearly: number;
  yearlyAnnual: number;
  yearlySave: number;
  credits: string;
  creditsRaw: number;
  features: { icon: string; text: string }[];
  borderColor: string;
  accentColor: string;
  bgGradient?: string;
}

/* ── Palette ─────────────────────────────────────────────────────────────────── */
const PALETTE = [
  {
    borderColor: "border-gray-200",
    accentColor: "text-gray-700",
    bgGradient: undefined as string | undefined,
    icon: "✦",
  },
  {
    borderColor: "border-blue-200",
    accentColor: "text-blue-600",
    bgGradient: "from-blue-50/50 to-white",
    icon: "✦",
  },
  {
    borderColor: "border-orange-300",
    accentColor: "text-orange-600",
    bgGradient: "from-orange-50/60 to-white",
    icon: "💎",
    badge: { label: "Popular", color: "text-white", bg: "bg-orange-400" },
  },
  {
    borderColor: "border-purple-300",
    accentColor: "text-purple-600",
    bgGradient: "from-purple-50/60 to-white",
    icon: "👑",
    badge: { label: "Best Value", color: "text-white", bg: "bg-purple-500" },
  },
] as const;

/* ── Feature icon map ─────────────────────────────────────────────────────── */
const FEATURE_ICONS: [RegExp, string][] = [
  [/model/i,          "🌐"],
  [/slash/i,          "⌨️"],
  [/krater|agent/i,   "⚡"],
  [/app/i,            "🧩"],
  [/voice/i,          "🎙️"],
  [/context/i,        "📄"],
  [/storage|keep/i,   "📊"],
  [/fastest|faster|fast/i, "🚀"],
  [/dedicated|priority|email.*support|support/i, "💬"],
  [/schedul/i,        "🔄"],
  [/credit.*top|top.*up/i, "🪙"],
  [/credit/i,         "🪙"],
  [/api/i,            "🔌"],
  [/router/i,         "🔀"],
  [/analytic/i,       "📈"],
  [/team/i,           "👥"],
];
function featureIcon(t: string) {
  for (const [re, icon] of FEATURE_ICONS) if (re.test(t)) return icon;
  return "✓";
}
function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function toUiPlan(raw: BackendPlan, index: number): UiPlan {
  const p = PALETTE[index % PALETTE.length];
  const monthly = raw.priceMonthly;
  // Use DB-stored yearly price; fall back to 17% discount
  const yearly = raw.priceYearly > 0 ? raw.priceYearly : Math.round(monthly * 0.83);
  return {
    id: raw.id,
    slug: raw.slug ?? String(raw.id),
    name: raw.name,
    icon: p.icon,
    tagline: raw.description || `${raw.name} plan`,
    badge: "badge" in p ? (p as { badge: UiPlan["badge"] }).badge : undefined,
    monthly,
    yearly,
    yearlyAnnual: yearly * 12,
    yearlySave: monthly * 12 - yearly * 12,
    credits: raw.aiCallQuota > 0 ? `${raw.aiCallQuota.toLocaleString()} credits/month` : "",
    creditsRaw: raw.aiCallQuota,
    features: raw.features.map((f) => ({ icon: featureIcon(f), text: f })),
    borderColor: p.borderColor,
    accentColor: p.accentColor,
    bgGradient: p.bgGradient,
  };
}

/* ── Props ──────────────────────────────────────────────────────────────────── */
interface UpgradeModalProps {
  onClose?: () => void;
}

/* ══════════════════════════════════════════════════════════════════════════════
   UPGRADE MODAL
══════════════════════════════════════════════════════════════════════════════ */
export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<UiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then((rows) => setPlans(rows.filter((p) => p.isActive).map(toUiPlan)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(plan: UiPlan) {
    if (!session) { router.push("/?auth=login"); return; }
    setLoadingPlan(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.slug ?? plan.id, billing, email: session.user?.email }),
      });
      const data = await res.json();
      if (data.message === "Feature not availiable in demo mode") {
        enqueueSnackbar("Feature not available in demo mode", { variant: "info" });
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      const { url } = data;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="relative w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7 1L2 7h4.5L5 11l5-6H6L7 1z" fill="currentColor" />
            </svg>
            Free limit reached
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Subscribe to keep creating</h2>
          <p className="text-gray-500 text-sm mb-6">Choose a plan to unlock all AI features.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billing === cycle
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
                {cycle === "yearly" && (
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
                  <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
                  <div className="h-3 w-32 bg-gray-100 rounded mb-5" />
                  <div className="h-8 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-36 bg-gray-100 rounded mb-5" />
                  <div className="h-9 w-full bg-gray-200 rounded-xl mb-4" />
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-3 w-full bg-gray-100 rounded mb-2.5" />
                  ))}
                </div>
              ))
            : plans.length === 0
            ? (
                <div className="col-span-4 text-center py-14 text-gray-400 text-sm">
                  No active plans available. Please check back later.
                </div>
              )
            : plans.map((plan) => {
                const price = billing === "yearly" ? plan.yearly : plan.monthly;
                const original = billing === "yearly" ? plan.monthly : null;
                const isLoad = loadingPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border ${plan.borderColor} bg-gradient-to-b ${
                      plan.bgGradient ?? "from-white to-white"
                    } p-5 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <span
                        className={`absolute -top-3 right-4 text-xs font-semibold px-3 py-0.5 rounded-full shadow-sm ${plan.badge.bg} ${plan.badge.color}`}
                      >
                        {plan.badge.label}
                      </span>
                    )}

                    {/* Plan name + icon */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg leading-none">{plan.icon}</span>
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-1 flex items-baseline gap-1 flex-wrap">
                      {original && (
                        <span className="text-sm text-gray-400 line-through">{fmt(original)}</span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">{fmt(price)}</span>
                      <span className="text-xs text-gray-500 self-end mb-0.5">/mo</span>
                    </div>

                    {/* Yearly billing note */}
                    {billing === "yearly" ? (
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Billed as {fmt(plan.yearlyAnnual)}/year
                        </span>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          Save {fmt(plan.yearlySave)}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-3 h-5" />
                    )}

                    {/* Credits */}
                    {plan.creditsRaw > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                        <span>🪙</span>
                        <span className="font-medium">{plan.credits}</span>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isLoad}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                    >
                      {isLoad ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          Get {plan.name}
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* Feature list */}
                    <ul className="space-y-2.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                          <span className="text-sm leading-tight mt-px shrink-0">{f.icon}</span>
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 text-center py-4 text-xs text-gray-400 px-4">
          Prices are in Indian Rupees (₹). Cancel anytime.{" "}
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Powered by Stripe
          </a>
          .
        </div>
      </div>
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────────────────────────── */
type BillingCycle = "monthly" | "yearly";

interface UiPlan {
  id: string;
  slug?: string;
  name: string;
  icon: string;
  tagline: string;
  badge?: { label: string; color: string; bg: string };
  monthly: number;
  yearly: number;
  yearlyAnnual: number;
  yearlySave: number;
  credits: string;
  features: { icon: string; text: string }[];
  borderColor: string;
  bgGradient?: string;
}

/* ── Helpers (same as pricing page) ─────────────────────────────────────────── */
const PALETTE = [
  { borderColor: "border-gray-200", bgGradient: undefined as string | undefined, icon: "✦" },
  { borderColor: "border-blue-300", bgGradient: "from-blue-50/60 to-white", icon: "✦" },
  {
    borderColor: "border-orange-300", bgGradient: "from-orange-50/60 to-white", icon: "💎",
    badge: { label: "Popular", color: "text-white", bg: "bg-orange-400" }
  },
  {
    borderColor: "border-purple-300", bgGradient: "from-purple-50/60 to-white", icon: "👑",
    badge: { label: "Best Value", color: "text-white", bg: "bg-purple-500" }
  },
] as const;

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
function featureIcon(t: string) {
  for (const [re, icon] of FEATURE_ICONS) if (re.test(t)) return icon;
  return "✓";
}
function fmt(n: number) { return "$" + n.toLocaleString("en-IN"); }

function toUiPlan(raw: BackendPlan, index: number): UiPlan {
  const p = PALETTE[index % PALETTE.length];
  const monthly = raw.priceMonthly;
  const yearly = Math.round(monthly * 0.83);
  return {
    id: raw.id,
    slug: (raw as any).slug ?? String(raw.id),
    name: raw.name,
    icon: p.icon,
    tagline: raw.description || `${raw.name} plan`,
    badge: "badge" in p ? (p as { badge: UiPlan["badge"] }).badge : undefined,
    monthly,
    yearly,
    yearlyAnnual: yearly * 12,
    yearlySave: monthly * 12 - yearly * 12,
    credits: raw.aiCallQuota > 0 ? `${raw.aiCallQuota.toLocaleString()} credits/month` : "",
    features: raw.features.map((f) => ({ icon: featureIcon(f), text: f })),
    borderColor: p.borderColor,
    bgGradient: p.bgGradient,
  };
}

/* ── Props ──────────────────────────────────────────────────────────────────── */
interface UpgradeModalProps {
  onClose?: () => void;
}

/* ══════════════════════════════════════════════════════════════════════════════
   UPGRADE MODAL
══════════════════════════════════════════════════════════════════════════════ */
export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<UiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then((rows) => setPlans(rows.filter((p) => p.isActive).map(toUiPlan)))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(plan: UiPlan) {
    if (!session) { router.push("/?auth=login"); return; }
    setLoadingPlan(plan.id);
    debugger
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.slug ?? plan.id, billing, email: session.user?.email }),
      });
      // ensure server receives the plan slug that matches PLAN_CONFIG keys
      // (fallback to id if slug unavailable)
      // const body = JSON.stringify({ planId: plan.slug ?? plan.id, billing, email: session.user?.email });
      // if (!res.ok) throw new Error((await res.json()).error || "Failed");
      // const { url } = await res.json();
      // router.push(url);
      const data = await res.json();
      if (data.message == "Feature not availiable in demo mode") {
        enqueueSnackbar("Feature not availiable in demo mode",{variant:'info'})
        return
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      const { url } = data;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Something went wrong. Please try again.",{variant:'error'});
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    /* Full-screen backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Hero */}
        <div className="px-6 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7 1L2 7h4.5L5 11l5-6H6L7 1z" fill="currentColor" />
            </svg>
            Free limit reached
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Subscribe to keep creating</h2>
          <p className="text-gray-500 text-sm mb-6">Choose a plan to unlock unlimited AI features.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Yearly
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">-17%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
                <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-32 bg-gray-100 rounded mb-5" />
                <div className="h-8 w-24 bg-gray-200 rounded mb-5" />
                <div className="h-9 w-full bg-gray-200 rounded-xl mb-4" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-3 w-full bg-gray-100 rounded mb-2.5" />
                ))}
              </div>
            ))
            : plans.length === 0
              ? (
                <div className="col-span-4 text-center py-12 text-gray-400 text-sm">
                  No active plans available. Please check back later.
                </div>
              )
              : plans.map((plan) => {
                const price = billing === "yearly" ? plan.yearly : plan.monthly;
                const original = billing === "yearly" ? plan.monthly : null;
                const isLoad = loadingPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border ${plan.borderColor} bg-gradient-to-b ${plan.bgGradient ?? "from-white to-white"
                      } p-5 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {plan.badge && (
                      <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${plan.badge.bg} ${plan.badge.color}`}>
                        {plan.badge.label}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{plan.icon}</span>
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{plan.tagline}</p>
                    <div className="mb-1">
                      {original && (
                        <span className="text-xs text-gray-400 line-through mr-1">{fmt(original)}</span>
                      )}
                      <span className="text-2xl font-bold text-gray-900">{fmt(price)}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                    {billing === "yearly" && (
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-xs text-green-600">Billed as {fmt(plan.yearlyAnnual)}/yr</span>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          Save {fmt(plan.yearlySave)}
                        </span>
                      </div>
                    )}
                    {billing !== "yearly" && <div className="mb-2 h-[18px]" />}
                    {plan.credits && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                        <span>🪙</span><span>{plan.credits}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isLoad}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                      {isLoad ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          Get {plan.name}
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </button>
                    <ul className="space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="text-sm leading-none">{f.icon}</span>
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
        </div>

        {/* Footer note */}
        <div className="text-center pb-6 text-xs text-gray-400 px-4">
          Prices are in Indian Rupees (₹) and include applicable taxes. Cancel anytime.{" "}
          <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            Powered by Stripe
          </a>.
        </div>
      </div>
    </div>
  );
}
