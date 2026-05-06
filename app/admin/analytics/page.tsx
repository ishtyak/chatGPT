"use client";

import { ChartCard } from "@/components/admin/ChartCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useToast } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import { exportChartCsv } from "@/services/admin/analytics.service";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const dateOptions = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export default function AnalyticsPage() {
  const { pushToast } = useToast();
  const { charts } = useAdminStats();
  const [range, setRange] = useState("30d");
  const chartData = useMemo(
    () => ({ ...adminMockState.chartData, ...(charts ?? {}) }),
    [charts],
  );

  const exportHandler = async (
    label: string,
    data: { label: string; value: number }[],
  ) => {
    const csv = await exportChartCsv(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${label}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast({ title: `${label} exported`, variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track growth, usage, and revenue signals across the product."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Analytics" },
        ]}
        action={
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      {range === "custom" && (
        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 md:grid-cols-2">
          <input
            type="date"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
          <input
            type="date"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Registrations"
          onExport={() =>
            void exportHandler("registrations", chartData.registrations)
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart data={chartData.registrations}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#27272a"
              />
              <XAxis dataKey="label" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="AI usage"
          onExport={() => void exportHandler("ai-usage", chartData.aiUsage)}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <AreaChart data={chartData.aiUsage}>
              <defs>
                <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
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
                stroke="#10b981"
                fill="url(#usageFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Subscription conversions"
          onExport={() =>
            void exportHandler("conversions", chartData.conversions)
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={chartData.conversions}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#27272a"
              />
              <XAxis dataKey="label" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top templates"
          onExport={() =>
            void exportHandler("top-templates", chartData.templateUsage)
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart layout="vertical" data={chartData.templateUsage}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#27272a"
              />
              <XAxis type="number" stroke="#a1a1aa" />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                stroke="#a1a1aa"
              />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Provider distribution"
          onExport={() =>
            void exportHandler(
              "provider-distribution",
              chartData.providerDistribution,
            )
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <PieChart>
              <Tooltip />
              <Pie
                data={chartData.providerDistribution}
                dataKey="value"
                nameKey="label"
                outerRadius={120}
                innerRadius={72}
              >
                {chartData.providerDistribution.map((entry) => (
                  <Cell key={entry.label} fill={entry.color ?? "#4f46e5"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
