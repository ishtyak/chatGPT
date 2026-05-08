import axios from "axios";
import type { Plan, Subscription } from "@/types/admin";
import { adminApi } from "./api";

// Unauthenticated client for public endpoints (e.g. pricing page)
const publicApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ??
    "http://localhost:4000/api/admin",
  timeout: 15000,
});

// The backend uses snake_case; map to/from the frontend camelCase Plan type.
type BackendPlan = {
  id: string | number;
  name: string;
  price: number;
  duration_days: number;
  features: string | string[];
  is_active: boolean | number;
  student_count?: number;
};

function parseFeatures(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toFrontendPlan(raw: BackendPlan): Plan {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.name.toLowerCase().replaceAll(" ", "-"),
    description: `${raw.name} plan`,
    priceMonthly: Number(raw.price ?? 0),
    priceYearly: Number(raw.price ?? 0) * 10, // 2-month discount convention
    currency: "USD",
    aiCallQuota: 0,
    modelAccess: [],
    features: parseFeatures(raw.features),
    isActive: Boolean(raw.is_active),
    sortOrder: 0,
    activeSubscribers: Number(raw.student_count ?? 0),
    revenueMonthly: 0,
    revenueYearly: 0,
  };
}

function toBackendPayload(
  plan: Omit<Plan, "id" | "activeSubscribers" | "revenueMonthly" | "revenueYearly"> | Partial<Plan>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if ("name" in plan && plan.name !== undefined) payload.name = plan.name;
  if ("priceMonthly" in plan && plan.priceMonthly !== undefined)
    payload.price = plan.priceMonthly;
  if ("features" in plan && plan.features !== undefined)
    payload.features = plan.features;
  if ("isActive" in plan && plan.isActive !== undefined)
    payload.is_active = plan.isActive;
  // duration_days is required by the backend but not exposed in the form;
  // default to 30 days (monthly billing cycle).
  if (!("duration_days" in payload)) payload.duration_days = 30;
  return payload;
}

export async function getPlans(): Promise<Plan[]> {
  const response = await publicApi.get("/plans");
  const data = response.data;
  const rows: BackendPlan[] = Array.isArray(data)
    ? (data as BackendPlan[])
    : ((data as { data: BackendPlan[] }).data ?? []);
  return rows.map(toFrontendPlan);
}

export async function createPlan(
  plan: Omit<
    Plan,
    "id" | "activeSubscribers" | "revenueMonthly" | "revenueYearly"
  >,
): Promise<Plan> {
  const response = await adminApi.post("/plans", toBackendPayload(plan));
  return toFrontendPlan(response.data as BackendPlan);
}

export async function updatePlan(
  id: string,
  patch: Partial<Plan>,
): Promise<Plan> {
  const response = await adminApi.patch(`/plans/${id}`, toBackendPayload(patch));
  return toFrontendPlan(response.data as BackendPlan);
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
