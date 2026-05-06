import { adminMockState } from "@/lib/admin/mockData";
import type { AppSettings, FeatureFlags } from "@/types/admin";
import { adminApi } from "./api";

const useRemote = process.env.NEXT_PUBLIC_ADMIN_API_MODE === "remote";
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export async function getSettings() {
  if (useRemote) {
    const response = await adminApi.get("/settings");
    return response.data as {
      appSettings: AppSettings;
      featureFlags: FeatureFlags;
    };
  }
  await wait();
  return {
    appSettings: clone(adminMockState.appSettings),
    featureFlags: clone(adminMockState.featureFlags),
  };
}

export async function updateSettings(patch: Partial<AppSettings>) {
  if (useRemote) {
    const response = await adminApi.patch("/settings", patch);
    return response.data as AppSettings;
  }
  await wait();
  adminMockState.appSettings = { ...adminMockState.appSettings, ...patch };
  return clone(adminMockState.appSettings);
}

export async function updateFeatureFlags(flags: Partial<FeatureFlags>) {
  if (useRemote) {
    const response = await adminApi.patch("/settings/feature-flags", flags);
    return response.data as FeatureFlags;
  }
  await wait();
  adminMockState.featureFlags = { ...adminMockState.featureFlags, ...flags };
  return clone(adminMockState.featureFlags);
}
