import { adminMockState } from "@/lib/admin/mockData";
import type { User, UserSession, UserStatus } from "@/types/admin";
import { adminApi } from "./api";

const useRemote = process.env.NEXT_PUBLIC_ADMIN_API_MODE === "remote";
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

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
) {
  if (useRemote) {
    const response = await adminApi.get("/users", {
      params: { page, pageSize, ...filters },
    });
    return response.data as {
      items: User[];
      total: number;
      page: number;
      pageSize: number;
    };
  }

  await wait();
  const filtered = adminMockState.users.filter((user) => {
    const search = filters.search?.trim().toLowerCase();
    const matchesSearch =
      !search ||
      [user.name, user.email, user.country, user.source]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      user.status === filters.status;
    const matchesPlan =
      !filters.planId ||
      filters.planId === "all" ||
      user.planId === filters.planId;
    const joinedAt = new Date(user.joinedAt).getTime();
    const matchesFrom =
      !filters.from || joinedAt >= new Date(filters.from).getTime();
    const matchesTo = !filters.to || joinedAt <= new Date(filters.to).getTime();
    return (
      matchesSearch && matchesStatus && matchesPlan && matchesFrom && matchesTo
    );
  });

  const start = (page - 1) * pageSize;
  return {
    items: clone(filtered.slice(start, start + pageSize)),
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function getUserById(id: string) {
  if (useRemote) {
    const response = await adminApi.get(`/users/${id}`);
    return response.data as User;
  }
  await wait();
  const user = adminMockState.users.find((item) => item.id === id);
  return user ? clone(user) : null;
}

export async function getUserSessions(id: string) {
  if (useRemote) {
    const response = await adminApi.get(`/users/${id}/sessions`);
    return response.data as UserSession[];
  }
  await wait();
  return clone(
    adminMockState.sessions.filter((session) => session.userId === id),
  );
}

export async function updateUser(id: string, patch: Partial<User>) {
  if (useRemote) {
    const response = await adminApi.patch(`/users/${id}`, patch);
    return response.data as User;
  }
  await wait();
  const index = adminMockState.users.findIndex((user) => user.id === id);
  if (index === -1) throw new Error("User not found");
  adminMockState.users[index] = { ...adminMockState.users[index], ...patch };
  return clone(adminMockState.users[index]);
}

export async function suspendUser(id: string) {
  return updateUser(id, { status: "suspended" });
}

export async function activateUser(id: string) {
  return updateUser(id, { status: "active" });
}

export async function deleteUser(id: string) {
  if (useRemote) {
    await adminApi.delete(`/users/${id}`);
    return true;
  }
  await wait();
  adminMockState.users = adminMockState.users.filter((user) => user.id !== id);
  adminMockState.subscriptions = adminMockState.subscriptions.filter(
    (subscription) => subscription.userId !== id,
  );
  adminMockState.sessions = adminMockState.sessions.filter(
    (session) => session.userId !== id,
  );
  return true;
}

export async function bulkSuspendUsers(ids: string[]) {
  await wait();
  ids.forEach((id) => {
    const index = adminMockState.users.findIndex((user) => user.id === id);
    if (index >= 0) {
      adminMockState.users[index].status = "suspended";
    }
  });
  return true;
}

export async function exportUsersCsv(ids?: string[]) {
  const selected = ids?.length
    ? adminMockState.users.filter((user) => ids.includes(user.id))
    : adminMockState.users;
  const header = ["Name", "Email", "Plan", "Status", "AI Usage", "Joined"];
  const rows = selected.map((user) => [
    user.name,
    user.email,
    user.planId,
    user.status,
    String(user.aiUsage),
    user.joinedAt,
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}
