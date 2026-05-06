import { adminMockState } from "@/lib/admin/mockData";
import type { ChartDataPoint } from "@/types/admin";
import { adminApi } from "./api";

const useRemote = process.env.NEXT_PUBLIC_ADMIN_API_MODE === "remote";
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export async function getStats() {
  if (useRemote) {
    const response = await adminApi.get("/analytics/stats");
    return response.data as Record<string, number>;
  }
  await wait();
  const activeUsers = adminMockState.users.filter(
    (user) => user.status === "active",
  ).length;
  const newToday = adminMockState.users.filter(
    (user) =>
      new Date(user.joinedAt).toDateString() === new Date().toDateString(),
  ).length;
  const revenue = adminMockState.plans.reduce(
    (total, plan) => total + plan.revenueMonthly,
    0,
  );
  const aiCalls = adminMockState.users.reduce(
    (total, user) => total + user.aiUsage,
    0,
  );
  const activeSubscriptions = adminMockState.subscriptions.filter(
    (sub) => sub.status === "active",
  ).length;
  return {
    totalUsers: adminMockState.users.length,
    activeUsers,
    newToday,
    revenueMonthToDate: revenue,
    aiCallsToday: Math.round(aiCalls / 30),
    activeSubscriptions,
  };
}

export async function getChartData() {
  if (useRemote) {
    const response = await adminApi.get("/analytics/charts");
    return response.data;
  }
  await wait();
  return clone(adminMockState.chartData);
}

export async function exportChartCsv(points: ChartDataPoint[]) {
  const header = ["Label", "Value"];
  return [header, ...points.map((point) => [point.label, String(point.value)])]
    .map((row) => row.join(","))
    .join("\n");
}
