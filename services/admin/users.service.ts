import type { User, UserSession, UserStatus } from "@/types/admin";
import { adminApi } from "./api";

export type UserFilters = {
  status?: UserStatus | "all";
  planId?: string | "all";
  search?: string;
  from?: string;
  to?: string;
};

export async function getUsers(
  page = 1,
  pageSize = 50,
  filters: UserFilters = {},
): Promise<{ items: User[]; total: number; page: number; pageSize: number }> {
  const params: Record<string, string | number> = { page, pageSize };
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "all")
    params.status = filters.status;
  if (filters.planId && filters.planId !== "all")
    params.planId = filters.planId;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  const response = await adminApi.get("/users", { params });
  // Backend returns { data: [], meta: { total, page, pageSize } }
  const envelope = response.data as
    | { data: User[]; meta: { total: number; page: number; pageSize: number } }
    | User[];
  if (Array.isArray(envelope)) {
    return { items: envelope, total: envelope.length, page, pageSize };
  }
  return {
    items: envelope.data,
    total: envelope.meta.total,
    page: envelope.meta.page,
    pageSize: envelope.meta.pageSize,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const response = await adminApi.get(`/users/${id}`);
  return response.data as User;
}

export async function getUserSessions(id: string): Promise<UserSession[]> {
  const response = await adminApi.get(`/users/${id}/sessions`);
  const data = response.data;
  return Array.isArray(data)
    ? (data as UserSession[])
    : ((data as { data: UserSession[] }).data ?? []);
}

export async function updateUser(
  id: string,
  patch: Partial<User>,
): Promise<User> {
  const response = await adminApi.patch(`/users/${id}`, patch);
  return response.data as User;
}

export async function suspendUser(id: string): Promise<User> {
  const response = await adminApi.post(`/users/${id}/suspend`);
  return response.data as User;
}

export async function activateUser(id: string): Promise<User> {
  const response = await adminApi.post(`/users/${id}/activate`);
  return response.data as User;
}

export async function deleteUser(id: string): Promise<void> {
  await adminApi.delete(`/users/${id}`);
}

export async function bulkSuspendUsers(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => adminApi.post(`/users/${id}/suspend`)));
}

export async function exportUsersCsv(ids?: string[]): Promise<string> {
  const params = ids?.length ? { ids: ids.join(",") } : {};
  const response = await adminApi.get("/users/export", { params });
  return typeof response.data === "string"
    ? response.data
    : JSON.stringify(response.data);
}
