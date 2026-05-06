"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ToastProvider, ToastViewport } from "@/hooks/useToast";
import { adminApi } from "@/services/admin/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // All initial state is SSR-safe (no sessionStorage reads here).
  // The effect below runs only on the client and populates everything.
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);

  // Client-only: read sessionStorage, pre-populate state, then validate with backend.
  // All setState calls are inside an async IIFE so React Compiler doesn't flag them
  // as synchronous setState-in-effect calls.
  useEffect(() => {
    void (async () => {
      const token = sessionStorage.getItem("admin_token");

      if (!token) {
        setAuthorized(false);
        setReady(true);
        return;
      }

      // Pre-populate from storage so the UI has a name while /auth/me is in-flight.
      const storedName = sessionStorage.getItem("admin_name") ?? "Admin";
      const storedEmail = sessionStorage.getItem("admin_email") ?? "";
      const storedRole = sessionStorage.getItem("admin_role") ?? "";
      setAdminName(storedName);
      setAdminEmail(storedEmail);
      setAuthorized(
        storedRole === "admin" || storedRole === "super_admin" || !storedRole,
      );

      // Validate token + refresh profile from server.
      try {
        const response = await adminApi.get<{
          name: string;
          email: string;
          role: string;
        }>("/auth/me");
        const { name, email, role } = response.data;
        sessionStorage.setItem("admin_name", name);
        sessionStorage.setItem("admin_email", email);
        sessionStorage.setItem("admin_role", role);
        setAdminName(name);
        setAdminEmail(email);
        setAuthorized(role === "admin" || role === "super_admin");
      } catch {
        // 401 clears storage and dispatches admin-auth-changed via the axios interceptor.
        // Re-read storage to pick up the cleared state.
        const token2 = sessionStorage.getItem("admin_token");
        const role2 = sessionStorage.getItem("admin_role") ?? "";
        setAdminName(sessionStorage.getItem("admin_name") ?? "Admin");
        setAdminEmail(sessionStorage.getItem("admin_email") ?? "");
        setAuthorized(
          Boolean(token2) &&
            (role2 === "admin" || role2 === "super_admin" || !role2),
        );
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Re-sync state whenever login/logout occurs anywhere.
  useEffect(() => {
    const onAuthChanged = () => {
      const token = sessionStorage.getItem("admin_token");
      const role = sessionStorage.getItem("admin_role") ?? "";
      setAdminName(sessionStorage.getItem("admin_name") ?? "Admin");
      setAdminEmail(sessionStorage.getItem("admin_email") ?? "");
      setAuthorized(
        Boolean(token) && (role === "admin" || role === "super_admin" || !role),
      );
    };
    window.addEventListener("admin-auth-changed", onAuthChanged);
    return () => {
      window.removeEventListener("admin-auth-changed", onAuthChanged);
    };
  }, []);

  // Navigation guard — only runs after client has determined auth state.
  useEffect(() => {
    if (!ready) return;
    const onAccessPage = pathname === "/admin/access";
    if (!authorized && !onAccessPage) {
      router.replace("/admin/access");
    }
    if (authorized && onAccessPage) {
      router.replace("/admin");
    }
  }, [authorized, pathname, ready, router]);

  const handleSignOut = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_name");
    sessionStorage.removeItem("admin_email");
    sessionStorage.removeItem("admin_role");
    window.dispatchEvent(new Event("admin-auth-changed"));
    setAuthorized(false);
    router.replace("/admin/access");
  };

  if (!ready) {
    return <LoadingSpinner label="Preparing admin shell" />;
  }

  if (pathname === "/admin/access") {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="flex min-h-screen">
          <AdminSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            badgeCounts={{}}
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <AdminTopbar
              adminName={adminName}
              adminEmail={adminEmail}
              collapsed={collapsed}
              onToggleSidebar={() => setCollapsed((value) => !value)}
              onSignOut={handleSignOut}
              notifications={[]}
            />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
