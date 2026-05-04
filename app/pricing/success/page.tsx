"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      Promise.resolve().then(() => setStatus("error"));
      return;
    }
    // Verify session server-side
    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => {
        if (r.ok) {
          setStatus("ok");
          try {
            localStorage.setItem("hasPlan", "true");
          } catch (e) {}
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="text-gray-500 text-sm">Confirming your subscription…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
          ✕
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm max-w-xs">
          We could not verify your payment. If you were charged, please contact
          support.
        </p>
        <button
          onClick={() => router.push("/pricing")}
          className="mt-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Back to Pricing
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Animated checkmark */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h1>
      <p className="text-gray-500 text-sm max-w-xs">
        Your subscription is now active. Start creating with full AI power.
      </p>

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Start creating →
        </button>
        <button
          onClick={() => router.push("/pricing")}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          View plans
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white px-6"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
