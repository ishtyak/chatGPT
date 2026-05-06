"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { useTools } from "@/hooks/useTools";
import type { Tool } from "@/types/admin";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function ToolsPage() {
  const { pushToast } = useToast();
  const {
    rows: tools,
    category,
    setCategory,
    create,
    update,
    remove,
  } = useTools();
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<Tool | null>(null);

  const categories = useMemo(
    () => ["all", ...new Set(tools.map((tool) => tool.category))],
    [tools],
  );

  const saveTool = async () => {
    if (!form) return;
    try {
      if (form.id) {
        await update(form.id, form);
      } else {
        await create({
          name: form.name,
          slug: form.name.toLowerCase().replaceAll(" ", "-"),
          category: form.category,
          description: form.description,
          url: form.url,
          logoUrl: form.logoUrl,
          tags: form.tags,
          isFeatured: form.isFeatured,
          status: form.status,
        });
      }
      setDrawerOpen(false);
      setForm(null);
      pushToast({ title: "Tool saved", variant: "success" });
    } catch {
      pushToast({ title: "Save failed", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tools Directory"
        description="Manage the public AI tools catalog, featured placements, and categorization."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Tools" }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("card")}
              className={`rounded-lg border px-3 py-2 text-sm ${viewMode === "card" ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-200 dark:border-zinc-800"}`}
            >
              Card
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg border px-3 py-2 text-sm ${viewMode === "list" ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-200 dark:border-zinc-800"}`}
            >
              List
            </button>
            <button
              onClick={() => {
                setForm({
                  id: "",
                  name: "",
                  slug: "",
                  category: categories[1] ?? "General",
                  description: "",
                  url: "",
                  logoUrl: "",
                  tags: [],
                  isFeatured: false,
                  status: "draft",
                  clickCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                setDrawerOpen(true);
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Add tool
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[16rem_1fr]">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Categories
          </p>
          <div className="mt-3 space-y-1">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm ${category === item ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
              >
                <span>{item}</span>
                <span className="text-xs opacity-70">
                  {item === "all"
                    ? tools.length
                    : tools.filter((tool) => tool.category === item).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          {viewMode === "card" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <Image
                          src={tool.logoUrl}
                          alt={tool.name}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800">
                          {tool.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500">{tool.category}</p>
                      </div>
                    </div>
                    <StatusBadge status={tool.status} />
                  </div>
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>{tool.clickCount?.toLocaleString()} clicks</span>
                    <span>{tool.isFeatured ? "Featured" : "Standard"}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setForm(tool);
                        setDrawerOpen(true);
                      }}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(tool.id)}
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 last:border-b-0 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    {tool.logoUrl ? (
                      <Image
                        src={tool.logoUrl}
                        alt={tool.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800">
                        {tool.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {tool.name}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={tool.status} />
                    <button
                      onClick={() => {
                        setForm(tool);
                        setDrawerOpen(true);
                      }}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tools.length === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"
                    />
                  </svg>
                }
                title="No tools match"
                description="Try another category or add a new directory entry."
                ctaLabel="Add tool"
                onCta={() => setDrawerOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      <DrawerForm
        open={drawerOpen}
        title={form?.id ? "Edit tool" : "Add tool"}
        description="Manage tool name, URL, tags, featured state, and status."
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={saveTool}
            >
              Save
            </button>
          </div>
        }
      >
        {form && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="min-h-28 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Category</span>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">URL</span>
                <input
                  value={form.url}
                  onChange={(event) =>
                    setForm({ ...form, url: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Logo URL</span>
              <input
                value={form.logoUrl}
                onChange={(event) =>
                  setForm({ ...form, logoUrl: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Tags</span>
              <input
                value={form.tags.join(", ")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tags: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm({ ...form, isFeatured: event.target.checked })
                  }
                />{" "}
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.status === "active"}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.checked ? "active" : "draft",
                    })
                  }
                />{" "}
                Active
              </label>
            </div>
          </div>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete tool?"
        description="This will permanently remove the tool from the directory."
        danger
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await remove(confirmDelete);
          setConfirmDelete(null);
          pushToast({ title: "Tool deleted", variant: "success" });
        }}
      />
    </div>
  );
}
