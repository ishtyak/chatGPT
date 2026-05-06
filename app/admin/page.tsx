"use client";

import { ChartCard } from "@/components/admin/ChartCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useToast } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import { updateSettings } from "@/services/admin/settings.service";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatMoney = (value: number) => `$${value.toLocaleString()}`;

const usageWidthClass = (usage: number, limit: number) => {
  const percent = Math.min(100, Math.round((usage / limit) * 100));
  if (percent < 25) return "w-1/4";
  if (percent < 50) return "w-1/2";
  if (percent < 75) return "w-3/4";
  return "w-full";
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { stats, charts, loading } = useAdminStats();

  const growth = useMemo(
    () => charts.userGrowth ?? adminMockState.chartData.userGrowth,
    [charts.userGrowth],
  );
  const recentActivity = adminMockState.auditLogs.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live control center for Softkey AI operations, revenue, and product health."
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          icon={<span>U</span>}
          label="Total Users"
          value={loading ? "—" : (stats.totalUsers ?? 0)}
          trend="+12%"
          helper="vs last month"
        />
        <StatCard
          icon={<span>A</span>}
          label="Active Users"
          value={loading ? "—" : (stats.activeUsers ?? 0)}
          trend="+8%"
          helper="24h"
        />
        <StatCard
          icon={<span>N</span>}
          label="New Today"
          value={loading ? "—" : (stats.newToday ?? 0)}
          trend="+4%"
          helper="today"
        />
        <StatCard
          icon={<span>$</span>}
          label="Revenue MTD"
          value={loading ? "—" : formatMoney(stats.revenueMonthToDate ?? 0)}
          trend="+18%"
          helper="month"
        />
        <StatCard
          icon={<span>AI</span>}
          label="AI Calls Today"
          value={loading ? "—" : (stats.aiCallsToday ?? 0)}
          trend="+21%"
          helper="usage"
        />
        <StatCard
          icon={<span>S</span>}
          label="Active Subs"
          value={loading ? "—" : (stats.activeSubscriptions ?? 0)}
          trend="+6%"
          helper="billing"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard
          title="30-day user growth"
          description="Growth curve for registrations and active community momentum."
          onExport={() =>
            pushToast({
              title: "Export ready",
              description: "User growth CSV exported.",
              variant: "success",
            })
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <AreaChart data={growth}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#27272a"
              />
              <XAxis dataKey="label" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                fill="url(#growthFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Quick actions
            </h3>
            <StatusBadge
              status={
                adminMockState.appSettings.maintenanceMode ? "error" : "active"
              }
            />
          </div>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-800 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
            >
              Invite User
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/subscriptions")}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-800 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
            >
              Create Plan
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/notifications")}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-800 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
            >
              Broadcast Notice
            </button>
            <button
              type="button"
              onClick={async () => {
                const next = !adminMockState.appSettings.maintenanceMode;
                await updateSettings({ maintenanceMode: next });
                pushToast({
                  title: "Maintenance updated",
                  description: next
                    ? "Maintenance mode enabled."
                    : "Maintenance mode disabled.",
                  variant: next ? "warning" : "success",
                });
              }}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
            >
              Toggle Maintenance
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Recent activity
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Last 10 events
            </span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.action}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.summary}
                    </p>
                  </div>
                  <StatusBadge
                    status={
                      item.severity === "critical"
                        ? "error"
                        : item.severity === "warning"
                          ? "pending"
                          : "active"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Provider health
          </h3>
          <div className="mt-4 space-y-3">
            {adminMockState.providers.map((provider) => {
              const percent = Math.min(
                100,
                Math.round(
                  (provider.monthlyUsage / provider.monthlyLimit) * 100,
                ),
              );
              return (
                <div
                  key={provider.id}
                  className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {provider.name}
                    </p>
                    <StatusBadge status={provider.status} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {provider.healthMessage}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className={`h-2 rounded-full bg-indigo-600 ${usageWidthClass(provider.monthlyUsage, provider.monthlyLimit)}`}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-500">
                    {provider.monthlyUsage.toLocaleString()} /{" "}
                    {provider.monthlyLimit.toLocaleString()} calls ({percent}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
