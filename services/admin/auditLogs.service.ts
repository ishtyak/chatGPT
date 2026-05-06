import type { AuditLog } from "@/types/admin";
import { adminApi } from "./api";

interface ListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export async function getAuditLogs(
  page = 1,
  pageSize = 50,
  filters: { entity?: string; action?: string } = {},
): Promise<{ items: AuditLog[]; meta: ListMeta }> {
  const params: Record<string, string | number> = { page, pageSize };
  if (filters.entity) params.entity = filters.entity;
  if (filters.action) params.action = filters.action;
  const response = await adminApi.get("/audit-logs", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    const total = data.length;
    return {
      items: data as AuditLog[],
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
  }
  const envelope = data as { data: AuditLog[]; meta: ListMeta };
  return { items: envelope.data, meta: envelope.meta };
}
