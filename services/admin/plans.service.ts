import { adminMockState } from "@/lib/admin/mockData";
import type { Plan } from "@/types/admin";
import { adminApi } from "./api";

const useRemote = process.env.NEXT_PUBLIC_ADMIN_API_MODE === "remote";
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export async function getPlans() {
  if (useRemote) {
    const response = await adminApi.get("/plans");
    return response.data as Plan[];
  }
  await wait();
  return clone(adminMockState.plans);
}

export async function createPlan(
  plan: Omit<
    Plan,
    "id" | "activeSubscribers" | "revenueMonthly" | "revenueYearly"
  >,
) {
  if (useRemote) {
    const response = await adminApi.post("/plans", plan);
    return response.data as Plan;
  }
  await wait();
  const created: Plan = {
    ...plan,
    id: `plan_${Date.now()}`,
    activeSubscribers: 0,
    revenueMonthly: 0,
    revenueYearly: 0,
  };
  adminMockState.plans = [...adminMockState.plans, created];
  return clone(created);
}

export async function updatePlan(id: string, patch: Partial<Plan>) {
  if (useRemote) {
    const response = await adminApi.patch(`/plans/${id}`, patch);
    return response.data as Plan;
  }
  await wait();
  const index = adminMockState.plans.findIndex((plan) => plan.id === id);
  if (index === -1) throw new Error("Plan not found");
  adminMockState.plans[index] = { ...adminMockState.plans[index], ...patch };
  return clone(adminMockState.plans[index]);
}
