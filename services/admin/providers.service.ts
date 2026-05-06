import { adminMockState } from "@/lib/admin/mockData";
import type { AIProvider } from "@/types/admin";
import { adminApi } from "./api";

const useRemote = process.env.NEXT_PUBLIC_ADMIN_API_MODE === "remote";
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export async function getProviders() {
  if (useRemote) {
    const response = await adminApi.get("/providers");
    return response.data as AIProvider[];
  }
  await wait();
  return clone(adminMockState.providers);
}

export async function updateProvider(id: string, patch: Partial<AIProvider>) {
  if (useRemote) {
    const response = await adminApi.patch(`/providers/${id}`, patch);
    return response.data as AIProvider;
  }
  await wait();
  const index = adminMockState.providers.findIndex(
    (provider) => provider.id === id,
  );
  if (index === -1) throw new Error("Provider not found");
  adminMockState.providers[index] = {
    ...adminMockState.providers[index],
    ...patch,
  };
  return clone(adminMockState.providers[index]);
}

export async function toggleProvider(id: string, enabled: boolean) {
  return updateProvider(id, {
    isEnabled: enabled,
    status: enabled ? "active" : "disabled",
  });
}

export async function reorderProviders(ids: string[]) {
  await wait();
  const reordered = ids
    .map((id) =>
      adminMockState.providers.find((provider) => provider.id === id),
    )
    .filter(Boolean) as AIProvider[];
  adminMockState.providers = reordered.map((provider, index) => ({
    ...provider,
    priority: index + 1,
  }));
  return clone(adminMockState.providers);
}

export async function testProviderKey(id: string) {
  await wait(400);
  const provider = adminMockState.providers.find((item) => item.id === id);
  if (!provider) throw new Error("Provider not found");
  return {
    ok: provider.status !== "error",
    message:
      provider.status === "error" ? "Authentication failed" : "Key verified",
  };
}
