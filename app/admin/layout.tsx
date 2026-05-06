"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ToastProvider, ToastViewport } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("admin@softkey.ai");
  const [authorized, setAuthorized] = useState(false);

  const syncAuthFromStorage = useCallback(() => {
    const token = sessionStorage.getItem("admin_token");
    const role = sessionStorage.getItem("admin_role");
    const name = sessionStorage.getItem("admin_name") ?? "Admin";
    const email = sessionStorage.getItem("admin_email") ?? "admin@softkey.ai";
    setAdminName(name);
    setAdminEmail(email);
    setAuthorized(
      Boolean(token) && (role === "admin" || role === "super_admin" || !role),
    );
  }, []);

  useEffect(() => {
    syncAuthFromStorage();
    setReady(true);
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

  const badgeCounts = useMemo(
    () => ({
      Users: adminMockState.users.length,
      Subscriptions: adminMockState.subscriptions.length,
      Prompts: adminMockState.prompts.length,
      Tools: adminMockState.tools.length,
    }),
    [],
  );

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
            badgeCounts={badgeCounts}
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <AdminTopbar
              adminName={adminName}
              adminEmail={adminEmail}
              collapsed={collapsed}
              onToggleSidebar={() => setCollapsed((value) => !value)}
              onSignOut={handleSignOut}
              notifications={adminMockState.notifications.map((item) => ({
                id: item.id,
                title: item.title,
                body: item.body,
                createdAt: item.createdAt,
              }))}
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
