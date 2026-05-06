import type { Notification } from "@/types/admin";
import { adminApi } from "./api";

interface ListMeta {
  total: number;
  page: number;
  pageSize: number;
}

export async function getNotifications(
  page = 1,
  pageSize = 50,
  filters: { type?: string; status?: string } = {},
): Promise<{ items: Notification[]; meta: ListMeta }> {
  const params: Record<string, string | number> = { page, pageSize };
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  const response = await adminApi.get("/notifications", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      items: data as Notification[],
      meta: { total: data.length, page, pageSize },
    };
  }
  const envelope = data as { data: Notification[]; meta: ListMeta };
  return { items: envelope.data, meta: envelope.meta };
}

export async function createNotification(
  payload: Omit<Notification, "id" | "createdAt">,
): Promise<Notification> {
  const response = await adminApi.post("/notifications", payload);
  return response.data as Notification;
}

export async function updateNotification(
  id: string,
  patch: Partial<Notification>,
): Promise<Notification> {
  const response = await adminApi.patch(`/notifications/${id}`, patch);
  return response.data as Notification;
}

export async function deleteNotification(id: string): Promise<void> {
  await adminApi.delete(`/notifications/${id}`);
}
