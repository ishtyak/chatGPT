"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: "signup" | "signin";
  demoUser?: {
    email: string;
    pass: string;
  }
}

// # Authentication modal component with email/password and social login options
export default function AuthModal({ onClose, defaultMode = "signup", demoUser = { email: "", pass: "" } }: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(demoUser?.email || "");
  const [password, setPassword] = useState(demoUser?.pass || "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() || undefined, email, password }),
        });
        const data = await res.json();
        if (data?.message == "Feature not availiable in demo mode") {
          alert("Feature not availiable in demo mode")
          return 
        }
        if (!res.ok) {
          setError(data.error || "Registration failed.");
          setLoading(false);
          return;
        }
        // Auto sign-in after registration
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("Account created! Please sign in.");
          setMode("signin");
        } else {
          onClose();
        }
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("Invalid email or password.");
        } else {
          onClose();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-1 text-center text-2xl font-semibold text-zinc-900">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500">
          {isSignUp ? "Create your account to continue" : "Sign in to your account to continue"}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          {/* Apple */}
          {/* <button className="flex w-full items-center justify-center gap-2.5 rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
            </svg>
            Continue with Apple
          </button> */}

          {/* Google Login remove comment if you want this to work */}
          {/* <button
            onClick={() => signIn("google")}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button> */}

          {/* Magic Link */}
          {/* <button className="flex w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Continue with Magic Link
          </button> */}
        </div>

        {/* OR divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs text-zinc-400">OR</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {/* Name (sign-up only) */}
        {isSignUp && (
          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-11 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="w-full rounded-full bg-zinc-400 py-3 text-sm font-medium text-white transition-colors disabled:opacity-60 enabled:bg-zinc-900 enabled:hover:bg-zinc-800"
        >
          {loading ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
        </button>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-zinc-500">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(""); }} className="font-semibold text-zinc-900 hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>
              {/* Remove comment if you want this to work */}
              {/* Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="font-semibold text-zinc-900 hover:underline">
                Sign up
              </button> */}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
