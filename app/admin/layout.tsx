"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ToastProvider, ToastViewport } from "@/hooks/useToast";
import { adminApi } from "@/services/admin/api";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // sessionStorage is only available in the browser. On the server all reads
  // return null, so the component starts in an unauthenticated / not-ready state
  // and the client re-hydrates immediately from real storage.
  const ss = (key: string) =>
    typeof window !== "undefined" ? sessionStorage.getItem(key) : null;

  // If there is no token there is nothing async to wait for, so ready = true.
  const [ready, setReady] = useState<boolean>(() => !ss("admin_token"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>(
    () => ss("admin_name") ?? "Admin",
  );
  const [adminEmail, setAdminEmail] = useState<string>(
    () => ss("admin_email") ?? "",
  );
  const [authorized, setAuthorized] = useState<boolean>(() => {
    const token = ss("admin_token");
    const role = ss("admin_role");
    return (
      Boolean(token) && (role === "admin" || role === "super_admin" || !role)
    );
  });

  const syncAuthFromStorage = useCallback(() => {
    const token = sessionStorage.getItem("admin_token");
    const role = sessionStorage.getItem("admin_role");
    const name = sessionStorage.getItem("admin_name") ?? "Admin";
    const email = sessionStorage.getItem("admin_email") ?? "";
    setAdminName(name);
    setAdminEmail(email);
    setAuthorized(
      Boolean(token) && (role === "admin" || role === "super_admin" || !role),
    );
  }, []);

  // On mount: validate token with backend (/auth/me).
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      let mounted = true;
      (async () => {
        try {
          const response = await adminApi.get<{
            name: string;
            email: string;
            role: string;
          }>("/auth/me");
          if (!mounted) return;
          const { name, email, role } = response.data;
          sessionStorage.setItem("admin_name", name);
          sessionStorage.setItem("admin_email", email);
          sessionStorage.setItem("admin_role", role);
          setAdminName(name);
          setAdminEmail(email);
          setAuthorized(role === "admin" || role === "super_admin");
        } catch {
          // 401 is handled by the interceptor (clears storage + dispatches event)
          syncAuthFromStorage();
        } finally {
          if (mounted) setReady(true);
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, [syncAuthFromStorage]);

  useEffect(() => {
    const onAuthChanged = () => {
      syncAuthFromStorage();
    };
    window.addEventListener("admin-auth-changed", onAuthChanged);
    return () => {
      window.removeEventListener("admin-auth-changed", onAuthChanged);
    };
  }, [syncAuthFromStorage]);

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
