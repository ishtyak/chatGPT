import type { AIProvider } from "@/types/admin";
import { adminApi } from "./api";

export async function getProviders(): Promise<AIProvider[]> {
  const response = await adminApi.get("/providers");
  const data = response.data;
  // Backend may return { apiKeyMasked } — remap to maskedApiKey used by our type
  const items: AIProvider[] = (
    Array.isArray(data) ? data : ((data as { data: AIProvider[] }).data ?? [])
  ).map((item: AIProvider & { apiKeyMasked?: string }) => ({
    ...item,
    maskedApiKey: item.maskedApiKey ?? item.apiKeyMasked ?? "",
  }));
  return items;
}

export async function updateProvider(
  id: string,
  patch: Partial<AIProvider> & { apiKey?: string },
): Promise<AIProvider> {
  const response = await adminApi.patch(`/providers/${id}`, patch);
  const item = response.data as AIProvider & { apiKeyMasked?: string };
  return {
    ...item,
    maskedApiKey: item.maskedApiKey ?? item.apiKeyMasked ?? "",
  };
}

export async function toggleProvider(
  id: string,
  enabled: boolean,
): Promise<AIProvider> {
  return updateProvider(id, { isEnabled: enabled });
}

export async function reorderProviders(ids: string[]): Promise<AIProvider[]> {
  const updates = ids.map((id, index) =>
    adminApi.patch(`/providers/${id}`, { priority: index + 1 }),
  );
  await Promise.all(updates);
  return getProviders();
}

export async function testProviderKey(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const response = await adminApi.post(`/providers/${id}/test`);
  return response.data as { ok: boolean; message: string };
}
