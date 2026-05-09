"use client";

import { adminApi } from "@/services/admin/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginResponse {
  token: string;
  admin: {
    name: string;
    email: string;
    role: string;
  };
  message:string
}

export default function AdminAccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@softkey.ai");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await adminApi.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      if (response?.data?.message == "Feature not availiable in demo mode") {
        alert("Feature not availiable in demo mode")
        return
      }
      const { token, admin } = response.data;
      sessionStorage.setItem("admin_token", token);
      sessionStorage.setItem("admin_name", admin.name);
      sessionStorage.setItem("admin_email", admin.email);
      sessionStorage.setItem("admin_role", admin.role);
      // window.dispatchEvent(new Event("admin-auth-changed"));
      router.push("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid admin credentials.",
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-semibold">
              S
            </div>
            <h1 className="text-2xl font-semibold">Softkey AI Admin Access</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in with your admin credentials.
            </p>
          </div>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-300">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-indigo-500"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-300">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-indigo-500"
              />
            </label>
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Enter admin panel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
