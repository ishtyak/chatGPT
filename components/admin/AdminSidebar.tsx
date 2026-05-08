"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  badgeCounts?: Record<string, number>;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: IconDashboard },
  { label: "Users", href: "/admin/users", icon: IconUsers },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: IconBilling },
  { label: "AI Providers", href: "/admin/ai-providers", icon: IconProviders },
  { label: "Prompts", href: "/admin/prompts", icon: IconPrompts },
  //{ label: "Tools", href: "/admin/tools", icon: IconTools },
  { label: "Analytics", href: "/admin/analytics", icon: IconAnalytics },
  { label: "Settings", href: "/admin/settings", icon: IconSettings },
];

function IconDashboard() {
  return <span>⌂</span>;
}
function IconUsers() {
  return <span>◉</span>;
}
function IconBilling() {
  return <span>¤</span>;
}
function IconProviders() {
  return <span>◈</span>;
}
function IconPrompts() {
  return <span>✦</span>;
}
function IconTools() {
  return <span>⚙</span>;
}
function IconAnalytics() {
  return <span>▤</span>;
}
function IconSettings() {
  return <span>⚑</span>;
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  badgeCounts = {},
}: Props) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-zinc-950/40 transition-opacity md:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200 bg-zinc-950 text-zinc-100 transition-transform md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${collapsed ? "md:w-16" : "md:w-60"} w-60`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              S
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm">Softkey AI</div>
                <div className="text-[11px] text-zinc-400">
                  Admin control center
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={onCloseMobile}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const badge = badgeCounts[item.label] ?? 0;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-300"}`}
                    >
                      <Icon />
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                  {!collapsed && badge > 0 && (
                    <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        {!collapsed && (
          <div className="border-t border-white/10 p-4 text-xs text-zinc-400">
            <div className="rounded-2xl bg-white/5 p-3">
              Live health: <span className="text-emerald-400">Healthy</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
