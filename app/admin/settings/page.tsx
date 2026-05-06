"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import {
  getSettings,
  updateFeatureFlags,
  updateSettings,
} from "@/services/admin/settings.service";
import type { AppSettings, FeatureFlags } from "@/types/admin";
import Image from "next/image";
import { useEffect, useState } from "react";

type TabKey =
  | "general"
  | "branding"
  | "email"
  | "maintenance"
  | "feature-flags"
  | "rate-limits";

const tabs: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "branding", label: "Branding" },
  { key: "email", label: "Email" },
  { key: "maintenance", label: "Maintenance" },
  { key: "feature-flags", label: "Feature Flags" },
  { key: "rate-limits", label: "Rate Limits" },
];

const rateLimitDefaults = { free: 2, pro: 20, business: 80 };

export default function SettingsPage() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<AppSettings>(
    adminMockState.appSettings,
  );
  const [flags, setFlags] = useState<FeatureFlags>(adminMockState.featureFlags);
  const [rateLimits, setRateLimits] = useState(rateLimitDefaults);
  const [logoPreview, setLogoPreview] = useState<string>(
    adminMockState.appSettings.logoUrl,
  );

  useEffect(() => {
    (async () => {
      const data = await getSettings();
      setSettings(data.appSettings);
      setFlags(data.featureFlags);
      setLogoPreview(data.appSettings.logoUrl);
    })();
  }, []);

  const saveGeneral = async () => {
    const next = await updateSettings(settings);
    setSettings(next);
    pushToast({ title: "General settings saved", variant: "success" });
  };

  const saveFlags = async () => {
    const next = await updateFeatureFlags(flags);
    setFlags(next);
    pushToast({ title: "Feature flags saved", variant: "success" });
  };

  const saveMaintenance = async () => {
    const next = await updateSettings({
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
    setSettings({ ...settings, ...next });
    pushToast({
      title: settings.maintenanceMode
        ? "Maintenance enabled"
        : "Maintenance disabled",
      variant: settings.maintenanceMode ? "warning" : "success",
    });
  };

  const saveRateLimits = () => {
    pushToast({ title: "Rate limits saved", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage site identity, maintenance, feature flags, and plan-level controls."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === tab.key ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge
            status={
              adminMockState.appSettings.maintenanceMode ? "error" : "active"
            }
          />
        </div>
      </div>

      {activeTab === "general" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Site name</span>
              <input
                value={settings.siteName}
                onChange={(event) =>
                  setSettings({ ...settings, siteName: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Support email</span>
              <input
                value={settings.supportEmail}
                onChange={(event) =>
                  setSettings({ ...settings, supportEmail: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-zinc-500">Contact URL</span>
              <input
                value={settings.contactUrl}
                onChange={(event) =>
                  setSettings({ ...settings, contactUrl: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveGeneral}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save general
            </button>
          </div>
        </section>
      )}

      {activeTab === "branding" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Brand tagline</span>
              <input
                value={settings.brandTagline}
                onChange={(event) =>
                  setSettings({ ...settings, brandTagline: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Primary color</span>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(event) =>
                  setSettings({ ...settings, primaryColor: event.target.value })
                }
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-zinc-500">Logo upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result =
                      typeof reader.result === "string" ? reader.result : "";
                    setLogoPreview(result);
                    setSettings({ ...settings, logoUrl: result });
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full rounded-xl border border-dashed border-zinc-200 bg-white px-3 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={56}
                  height={56}
                  unoptimized
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-zinc-500">SK</span>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              Preview and brand controls for the Softkey AI admin and public
              product surfaces.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveGeneral}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save branding
            </button>
          </div>
        </section>
      )}

      {activeTab === "email" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Email from name</span>
              <input
                value={settings.emailFromName}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    emailFromName: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">
                Email from address
              </span>
              <input
                value={settings.emailFromAddress}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    emailFromAddress: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>
          <div className="mt-4 text-sm text-zinc-500">
            Configure outbound notification identity for broadcasts and
            transactional mail.
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveGeneral}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save email settings
            </button>
          </div>
        </section>
      )}

      {activeTab === "maintenance" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  maintenanceMode: event.target.checked,
                })
              }
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Enable maintenance mode
            </span>
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-zinc-500">
              Maintenance message
            </span>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  maintenanceMessage: event.target.value,
                })
              }
              className="min-h-32 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveMaintenance}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save maintenance
            </button>
          </div>
        </section>
      )}

      {activeTab === "feature-flags" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="space-y-4">
            {Object.entries(flags).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {key.replaceAll("_", " ")}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) =>
                    setFlags({
                      ...flags,
                      [key]: event.target.checked,
                    } as FeatureFlags)
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveFlags}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save flags
            </button>
          </div>
        </section>
      )}

      {activeTab === "rate-limits" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(rateLimits).map(([key, value]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-zinc-500 capitalize">
                  {key} users/day
                </span>
                <input
                  type="number"
                  value={value}
                  onChange={(event) =>
                    setRateLimits({
                      ...rateLimits,
                      [key]: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveRateLimits}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save rate limits
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
