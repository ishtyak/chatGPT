import type { PromptTemplate } from "@/types/admin";
import { adminApi } from "./api";

interface ListMeta {
  total: number;
  page: number;
  pageSize: number;
}

export async function getPrompts(
  page = 1,
  pageSize = 50,
  filters: { search?: string; category?: string } = {},
): Promise<{ items: PromptTemplate[]; meta: ListMeta }> {
  const params: Record<string, string | number> = { page, pageSize };
  if (filters.search) params.search = filters.search;
  if (filters.category && filters.category !== "all")
    params.category = filters.category;
  const response = await adminApi.get("/prompts", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      items: data as PromptTemplate[],
      meta: { total: data.length, page, pageSize },
    };
  }
  const envelope = data as { data: PromptTemplate[]; meta: ListMeta };
  return { items: envelope.data, meta: envelope.meta };
}

export async function getPromptById(id: string): Promise<PromptTemplate> {
  const response = await adminApi.get(`/prompts/${id}`);
  return response.data as PromptTemplate;
}

export async function createPrompt(
  payload: Omit<
    PromptTemplate,
    "id" | "usageCount" | "createdAt" | "updatedAt"
  >,
): Promise<PromptTemplate> {
  const response = await adminApi.post("/prompts", payload);
  return response.data as PromptTemplate;
}

export async function updatePrompt(
  id: string,
  patch: Partial<PromptTemplate>,
): Promise<PromptTemplate> {
  const response = await adminApi.patch(`/prompts/${id}`, patch);
  return response.data as PromptTemplate;
}

export async function deletePrompt(id: string): Promise<void> {
  await adminApi.delete(`/prompts/${id}`);
}
