"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import type { PromptTemplate } from "@/types/admin";
import { useMemo, useState } from "react";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function PromptsPage() {
  const { pushToast } = useToast();
  const [prompts, setPrompts] = useState<PromptTemplate[]>(
    clone(adminMockState.prompts),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<PromptTemplate | null>(null);

  const categories = useMemo(
    () => ["all", ...new Set(prompts.map((prompt) => prompt.category))],
    [prompts],
  );
  const filtered = useMemo(
    () =>
      prompts.filter((prompt) => {
        const matchesSearch =
          !search ||
          [prompt.title, prompt.author, prompt.body, prompt.tags.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCategory =
          category === "all" || prompt.category === category;
        return matchesSearch && matchesCategory;
      }),
    [category, prompts, search],
  );

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (prompt: PromptTemplate) => (
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {prompt.title}
          </p>
          <p className="text-xs text-zinc-500">{prompt.tags.join(", ")}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (prompt: PromptTemplate) => prompt.category,
    },
    {
      key: "author",
      header: "Author",
      render: (prompt: PromptTemplate) => prompt.author,
    },
    {
      key: "usage",
      header: "Usage",
      render: (prompt: PromptTemplate) => prompt.usageCount.toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (prompt: PromptTemplate) => (
        <StatusBadge status={prompt.status} />
      ),
    },
  ];

  const savePrompt = () => {
    if (!form) return;
    setPrompts((current) => {
      const next = current.filter((item) => item.id !== form.id);
      const updated: PromptTemplate = {
        ...form,
        id: form.id ?? `prompt_${Date.now()}`,
        slug: form.title.toLowerCase().replaceAll(" ", "-"),
        updatedAt: new Date().toISOString(),
      };
      const final = [...next, updated];
      adminMockState.prompts = clone(final);
      return final;
    });
    setDrawerOpen(false);
    setForm(null);
    pushToast({ title: "Prompt saved", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt Templates"
        description="Create, publish, and manage prompt assets for the library."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Prompts" }]}
        action={
          <button
            onClick={() => {
              setForm({
                id: "",
                title: "",
                slug: "",
                category: categories[1] ?? "General",
                author: "Softkey AI",
                body: "",
                tags: [],
                usageCount: 0,
                isFeatured: false,
                isPublished: false,
                status: "draft",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setDrawerOpen(true);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            New prompt
          </button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search title, body, author or tags…"
        filters={[
          {
            key: "category",
            label: "Category",
            value: category,
            onChange: setCategory,
            options: categories.map((value) => ({
              label: value === "all" ? "All" : value,
              value,
            })),
          },
        ]}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPrompts((current) =>
                  current.map((prompt) =>
                    selectedIds.has(prompt.id)
                      ? { ...prompt, isPublished: true, status: "published" }
                      : prompt,
                  ),
                );
                pushToast({ title: "Prompts published", variant: "success" });
              }}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              Bulk publish
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompts((current) =>
                  current.map((prompt) =>
                    selectedIds.has(prompt.id)
                      ? { ...prompt, isPublished: false, status: "draft" }
                      : prompt,
                  ),
                );
                pushToast({ title: "Prompts unpublished", variant: "warning" });
              }}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              Bulk unpublish
            </button>
          </div>
        }
      />

      <DataTable<PromptTemplate>
        columns={columns}
        rows={filtered}
        rowId={(prompt) => prompt.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={(id) =>
          setSelectedIds((current) => {
            const next = new Set(current);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          })
        }
        onToggleSelectAll={(checked) =>
          setSelectedIds(
            checked ? new Set(filtered.map((prompt) => prompt.id)) : new Set(),
          )
        }
        actions={(prompt) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(prompt);
                setDrawerOpen(true);
              }}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompts((current) =>
                  current.map((item) =>
                    item.id === prompt.id
                      ? {
                          ...item,
                          isPublished: !item.isPublished,
                          status: item.isPublished ? "draft" : "published",
                        }
                      : item,
                  ),
                );
              }}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-800"
            >
              {prompt.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(prompt.id)}
              className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400"
            >
              Delete
            </button>
          </div>
        )}
        emptyState={
          <EmptyState
            icon={<span>✎</span>}
            title="No prompts found"
            description="Adjust the search or category filter to reveal prompt templates."
          />
        }
      />

      <DrawerForm
        open={drawerOpen}
        title={form?.id ? "Edit prompt" : "Create prompt"}
        description="Manage prompt title, body, tags, and publish state."
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
              onClick={savePrompt}
            >
              Save
            </button>
          </div>
        }
      >
        {form && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Title</span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Body</span>
              <textarea
                value={form.body}
                onChange={(event) =>
                  setForm({ ...form, body: event.target.value })
                }
                className="min-h-40 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  {categories
                    .filter((item) => item !== "all")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Author</span>
                <input
                  value={form.author}
                  onChange={(event) =>
                    setForm({ ...form, author: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
            </div>
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
                placeholder="comma separated tags"
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
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      isPublished: event.target.checked,
                      status: event.target.checked ? "published" : "draft",
                    })
                  }
                />{" "}
                Publish
              </label>
            </div>
          </div>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete prompt?"
        description="This permanently removes the prompt from the admin mock store."
        danger
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          setPrompts((current) =>
            current.filter((item) => item.id !== confirmDelete),
          );
          adminMockState.prompts = adminMockState.prompts.filter(
            (item) => item.id !== confirmDelete,
          );
          setConfirmDelete(null);
          pushToast({ title: "Prompt deleted", variant: "success" });
        }}
      />
    </div>
  );
}
