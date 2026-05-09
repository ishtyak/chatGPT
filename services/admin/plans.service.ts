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
  slug?: string;
  description?: string;
  price: number;
  price_monthly?: number;
  price_yearly?: number;
  duration_days: number;
  ai_call_quota?: number;
  credits_included?: number;
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
  const priceMonthly = Number(raw.price_monthly ?? raw.price ?? 0);
  const priceYearly = Number(raw.price_yearly ?? Math.round(priceMonthly * 0.83));
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug ?? raw.name.toLowerCase().replaceAll(" ", "-"),
    description: raw.description ?? `${raw.name} plan`,
    priceMonthly,
    priceYearly,
    currency: "INR",
    aiCallQuota: Number(raw.ai_call_quota ?? raw.credits_included ?? 0),
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
  if ("slug" in plan && plan.slug !== undefined) payload.slug = plan.slug;
  if ("description" in plan && plan.description !== undefined) payload.description = plan.description;
  if ("priceMonthly" in plan && plan.priceMonthly !== undefined) {
    payload.price = plan.priceMonthly;
    payload.price_monthly = plan.priceMonthly;
  }
  if ("priceYearly" in plan && plan.priceYearly !== undefined)
    payload.price_yearly = plan.priceYearly;
  if ("aiCallQuota" in plan && plan.aiCallQuota !== undefined) {
    payload.ai_call_quota = plan.aiCallQuota;
    payload.credits_included = plan.aiCallQuota;
  }
  if ("features" in plan && plan.features !== undefined)
    payload.features = plan.features;
  if ("isActive" in plan && plan.isActive !== undefined)
    payload.is_active = plan.isActive;
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
