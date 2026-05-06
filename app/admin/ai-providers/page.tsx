"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useProviders } from "@/hooks/useProviders";
import { useMemo, useState } from "react";

const AVAILABLE_MODELS = [
  "GPT-4.1",
  "GPT-4o",
  "Claude Sonnet 4",
  "Claude Opus 4",
  "Gemini 2.0 Flash",
  "Gemini 2.0 Pro",
  "Mistral Large",
  "Mistral Small",
];

export default function AIProvidersPage() {
  const {
    providers,
    toggleProvider,
    updateProvider,
    reorderProviders,
    testProviderKey,
  } = useProviders();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});

  const fallbackIds = useMemo(
    () =>
      [...providers]
        .sort((a, b) => a.priority - b.priority)
        .map((provider) => provider.id),
    [providers],
  );

  const usageWidthClass = (usagePercent: number) => {
    if (usagePercent < 25) return "w-1/4";
    if (usagePercent < 50) return "w-1/2";
    if (usagePercent < 75) return "w-3/4";
    return "w-full";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Provider Management"
        description="Control provider routing, API keys, model access, and fallback behavior."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "AI Providers" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {providers.map((provider) => {
          const usagePercent = Math.min(
            100,
            Math.round((provider.monthlyUsage / provider.monthlyLimit) * 100),
          );
          return (
            <div
              key={provider.id}
              draggable
              onDragStart={() => setDraggedId(provider.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={async () => {
                if (!draggedId || draggedId === provider.id) return;
                const ids = fallbackIds.filter((id) => id !== draggedId);
                const targetIndex = ids.indexOf(provider.id);
                ids.splice(targetIndex, 0, draggedId);
                await reorderProviders(ids);
                setDraggedId(null);
              }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {provider.name}
                    </h3>
                    <StatusBadge status={provider.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Priority {provider.priority}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  <input
                    type="checkbox"
                    checked={provider.isEnabled}
                    onChange={async (event) =>
                      await toggleProvider(provider.id, event.target.checked)
                    }
                  />
                  Enabled
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-500">API key</span>
                  <input
                    value={keyDrafts[provider.id] ?? provider.maskedApiKey}
                    onChange={(event) =>
                      setKeyDrafts((current) => ({
                        ...current,
                        [provider.id]: event.target.value,
                      }))
                    }
                    onBlur={async (event) => {
                      await updateProvider(provider.id, {
                        maskedApiKey: event.target.value
                          ? `••••••••${event.target.value.slice(-4)}`
                          : provider.maskedApiKey,
                      });
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </label>
                <div className="block text-sm">
                  <span className="mb-1 block text-zinc-500">
                    Monthly usage
                  </span>
                  <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
                    <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-2 rounded-full bg-indigo-600 ${usageWidthClass(usagePercent)}`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {provider.monthlyUsage.toLocaleString()} /{" "}
                      {provider.monthlyLimit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Model access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MODELS.map((model) => (
                    <label
                      key={model}
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={provider.models.includes(model)}
                        onChange={async (event) =>
                          await updateProvider(provider.id, {
                            models: event.target.checked
                              ? [...provider.models, model]
                              : provider.models.filter(
                                  (item) => item !== model,
                                ),
                          })
                        }
                      />
                      {model}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                <span className="text-zinc-500">Drag handle for priority</span>
                <button
                  type="button"
                  className="cursor-grab rounded-lg bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  ⇅ Drag
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const result = await testProviderKey(provider.id);
                    alert(result.message);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-800"
                >
                  Test key
                </button>
                <button
                  type="button"
                  onClick={async () =>
                    await updateProvider(provider.id, {
                      status:
                        provider.status === "error"
                          ? "active"
                          : provider.status,
                    })
                  }
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-800"
                >
                  Refresh status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Fallback chain builder
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Drag providers into the order you want requests to cascade through
          when the primary model fails.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[...providers]
            .sort((a, b) => a.priority - b.priority)
            .map((provider) => (
              <button
                key={provider.id}
                type="button"
                draggable
                onDragStart={() => setDraggedId(provider.id)}
                onDrop={async () => {
                  if (!draggedId) return;
                  const ordered = [...providers]
                    .map((item) => item.id)
                    .filter((id) => id !== draggedId);
                  const targetIndex = ordered.indexOf(provider.id);
                  ordered.splice(targetIndex, 0, draggedId);
                  await reorderProviders(ordered);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="rounded-full bg-indigo-600/10 px-4 py-2 text-sm font-medium text-indigo-400"
              >
                {provider.name}
              </button>
            ))}
        </div>
        <div className="mt-4 text-xs text-zinc-500">
          Current order:{" "}
          {[...providers]
            .sort((a, b) => a.priority - b.priority)
            .map((provider) => provider.name)
            .join(" → ")}
        </div>
      </div>
    </div>
  );
}
