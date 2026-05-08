"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import type { AppSettings, FeatureFlags } from "@/types/admin";
import Image from "next/image";
import { useEffect, useState } from "react";

type TabKey =
  | "general"
  | "branding"
  | "email"
  | "maintenance"
  | "feature-flags"
  | "rate-limits"
  | "google-oauth"
  | "replicate"
  | "openai"
  | "secrets";

const tabs: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "branding", label: "Branding" },
  { key: "email", label: "Email" },
  { key: "maintenance", label: "Maintenance" },
  { key: "feature-flags", label: "Feature Flags" },
  { key: "rate-limits", label: "Rate Limits" },
  { key: "openai", label: "OpenAI" },
  { key: "secrets", label: "Secrets" },
  { key: "google-oauth", label: "Google OAuth" },
  { key: "replicate", label: "Replicate" },
];

const rateLimitDefaults = { free: 2, pro: 20, business: 80 };

const defaultSettings: AppSettings = {
  appName: "",
  appDescription: "",
  logoUrl: "",
  primaryColor: "#4f46e5",
  supportEmail: "",
  contactEmail: "",
  allowRegistration: true,
  requireEmailVerification: false,
  maintenanceMode: false,
  maintenanceMessage: "",
  googleClientId: "",
  googleClientSecret: "",
  replicateApiToken: "",
  openaiApiKey: "",
  nextauthSecret: "",
  nextauthUrl: "",
  stripeSecretKey: "",
  stripePublishableKey: "",
};

const defaultFlags: FeatureFlags = {} as FeatureFlags;

export default function SettingsPage() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const {
    appSettings: remoteSettings,
    featureFlags: remoteFlags,
    loading,
    saveSettings,
    saveFeatureFlags,
  } = useSettings();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [rateLimits, setRateLimits] = useState(rateLimitDefaults);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    if (remoteSettings) {
      setSettings(remoteSettings);
      setLogoPreview(remoteSettings.logoUrl ?? "");
    }
    if (remoteFlags) {
      setFlags(remoteFlags);
    }
  }, [remoteSettings, remoteFlags]);

  const saveGeneral = async () => {
    const next = await saveSettings(settings);
    setSettings(next);
    pushToast({ title: "General settings saved", variant: "success" });
  };

  const saveFlags = async () => {
    const next = await saveFeatureFlags(flags);
    setFlags(next);
    pushToast({ title: "Feature flags saved", variant: "success" });
  };

  const saveMaintenance = async () => {
    const next = await saveSettings({
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
          <StatusBadge status={settings.maintenanceMode ? "error" : "active"} />
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

      {activeTab === "secrets" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">NEXTAUTH_SECRET</span>
              <input
                value={settings.nextauthSecret ?? ""}
                onChange={(e) => setSettings({ ...settings, nextauthSecret: e.target.value })}
                placeholder="NEXTAUTH_SECRET"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">NEXTAUTH_URL</span>
              <input
                value={settings.nextauthUrl ?? ""}
                onChange={(e) => setSettings({ ...settings, nextauthUrl: e.target.value })}
                placeholder="http://localhost:3000"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">STRIPE_SECRET_KEY</span>
              <input
                value={settings.stripeSecretKey ?? ""}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                placeholder="sk_..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
              <input
                value={settings.stripePublishableKey ?? ""}
                onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                placeholder="pk_..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>

          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            ⚠ These values are stored in the database. For production, prefer storing secrets in a secure vault or environment variables.
          </p>

          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                const patch = {
                  nextauthSecret: settings.nextauthSecret,
                  nextauthUrl: settings.nextauthUrl,
                  stripeSecretKey: settings.stripeSecretKey,
                  stripePublishableKey: settings.stripePublishableKey,
                } as Partial<typeof settings>;
                const next = await saveSettings(patch);
                setSettings(next);
                pushToast({ title: "Secrets saved", variant: "success" });
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save secrets
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

      {activeTab === "openai" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-900">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">OpenAI API Key</h3>
              <p className="text-xs text-zinc-500">Used for chat, image generation, and image editing. Get your key from{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">platform.openai.com</a>.
              </p>
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">API Key</span>
            <input
              type="password"
              value={settings.openaiApiKey ?? ""}
              onChange={(event) =>
                setSettings({ ...settings, openaiApiKey: event.target.value })
              }
              placeholder="sk-proj-…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            ⚠ Stored in the database. For production, prefer the environment variable <code>OPENAI_API_KEY</code>.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() =>
                saveSettings({ openaiApiKey: settings.openaiApiKey }).then(() =>
                  pushToast({ title: "OpenAI key saved", variant: "success" }),
                )
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save OpenAI key
            </button>
          </div>
        </section>
      )}

      {activeTab === "google-oauth" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Google OAuth credentials</h3>
              <p className="text-xs text-zinc-500">Used for &quot;Sign in with Google&quot;. Get keys from{" "}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Google Cloud Console</a>.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Client ID</span>
              <input
                value={settings.googleClientId ?? ""}
                onChange={(event) =>
                  setSettings({ ...settings, googleClientId: event.target.value })
                }
                placeholder="490932099209-xxxx.apps.googleusercontent.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Client Secret</span>
              <input
                type="password"
                value={settings.googleClientSecret ?? ""}
                onChange={(event) =>
                  setSettings({ ...settings, googleClientSecret: event.target.value })
                }
                placeholder="GOCSPX-…"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            ⚠ These values are stored in the database. For production, prefer setting them as environment variables (<code>GOOGLE_CLIENT_ID</code> / <code>GOOGLE_CLIENT_SECRET</code>).
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => saveSettings({
                googleClientId: settings.googleClientId,
                googleClientSecret: settings.googleClientSecret,
              }).then(() => pushToast({ title: "Google OAuth saved", variant: "success" }))}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Google OAuth
            </button>
          </div>
        </section>
      )}

      {activeTab === "replicate" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-900">
              🎨
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Replicate API</h3>
              <p className="text-xs text-zinc-500">Used for video and image generation. Get your token from{" "}
                <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">replicate.com</a>.
              </p>
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">API Token</span>
            <input
              type="password"
              value={settings.replicateApiToken ?? ""}
              onChange={(event) =>
                setSettings({ ...settings, replicateApiToken: event.target.value })
              }
              placeholder="r8_…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            ⚠ This value is stored in the database. For production, prefer setting it as an environment variable (<code>REPLICATE_API_TOKEN</code>).
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => saveSettings({ replicateApiToken: settings.replicateApiToken })
                .then(() => pushToast({ title: "Replicate API token saved", variant: "success" }))}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Replicate token
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
