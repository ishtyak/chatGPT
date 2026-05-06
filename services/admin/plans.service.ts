import type { Plan, Subscription } from "@/types/admin";
import { adminApi } from "./api";

export async function getPlans(): Promise<Plan[]> {
  const response = await adminApi.get("/plans");
  const data = response.data;
  return Array.isArray(data)
    ? (data as Plan[])
    : ((data as { data: Plan[] }).data ?? []);
}

export async function createPlan(
  plan: Omit<
    Plan,
    "id" | "activeSubscribers" | "revenueMonthly" | "revenueYearly"
  >,
): Promise<Plan> {
  const response = await adminApi.post("/plans", plan);
  return response.data as Plan;
}

export async function updatePlan(
  id: string,
  patch: Partial<Plan>,
): Promise<Plan> {
  const response = await adminApi.patch(`/plans/${id}`, patch);
  return response.data as Plan;
}

export async function deletePlan(id: string): Promise<void> {
  await adminApi.delete(`/plans/${id}`);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await adminApi.get("/subscriptions");
  const data = response.data;
  return Array.isArray(data)
    ? (data as Subscription[])
    : ((data as { data: Subscription[] }).data ?? []);
}
