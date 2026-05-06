import type { AppSettings, FeatureFlags } from "@/types/admin";
import { adminApi } from "./api";

export async function getSettings(): Promise<{
  appSettings: AppSettings;
  featureFlags: FeatureFlags;
}> {
  const response = await adminApi.get("/settings");
  return response.data as {
    appSettings: AppSettings;
    featureFlags: FeatureFlags;
  };
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const response = await adminApi.patch("/settings", patch);
  return response.data as AppSettings;
}

export async function updateFeatureFlags(
  flags: Partial<FeatureFlags>,
): Promise<FeatureFlags> {
  const response = await adminApi.patch("/settings/feature-flags", flags);
  return response.data as FeatureFlags;
}
