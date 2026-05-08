import type { Tool } from "@/types/admin";
import { adminApi } from "./api";

interface ListMeta {
  total: number;
  page: number;
  pageSize: number;
}

export async function getTools(
  page = 1,
  pageSize = 50,
  filters: { search?: string; category?: string } = {},
): Promise<{ items: Tool[]; meta: ListMeta }> {
  const params: Record<string, string | number> = { page, pageSize };
  if (filters.search) params.search = filters.search;
  if (filters.category && filters.category !== "all")
    params.category = filters.category;
  const response = await adminApi.get("/tools", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      items: data as Tool[],
      meta: { total: data.length, page, pageSize },
    };
  }
  const envelope = data as { data: Tool[]; meta: ListMeta };
  return { items: envelope.data, meta: envelope.meta };
}

export async function getToolById(id: string): Promise<Tool> {
  const response = await adminApi.get(`/tools/${id}`);
  return response.data as Tool;
}

export async function createTool(
  payload: Omit<Tool, "id" | "clickCount" | "createdAt" | "updatedAt">,
): Promise<Tool> {
  const response = await adminApi.post("/tools", payload);
  return response.data as Tool;
}

export async function updateTool(
  id: string,
  patch: Partial<Tool>,
): Promise<Tool> {
  const response = await adminApi.patch(`/tools/${id}`, patch);
  return response.data as Tool;
}

export async function deleteTool(id: string): Promise<void> {
  await adminApi.delete(`/tools/${id}`);
}
