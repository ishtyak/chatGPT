"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePrompts } from "@/hooks/usePrompts";
import { useToast } from "@/hooks/useToast";
import type { PromptTemplate } from "@/types/admin";
import { useMemo, useState } from "react";

export default function PromptsPage() {
  const { pushToast } = useToast();
  const {
    rows: prompts,
    search,
    setSearch,
    category,
    setCategory,
    create,
    update,
    remove,
  } = usePrompts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<PromptTemplate | null>(null);

  const categories = useMemo(
    () => ["all", ...new Set(prompts.map((prompt) => prompt.category))],
    [prompts],
  );

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (prompt: PromptTemplate) => (
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {prompt.name}
          </p>
          <p className="text-xs text-zinc-500">{prompt.tags.join(", ")}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (prompt: PromptTemplate) => (
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {prompt.description}
          </p>
          <p className="text-xs text-zinc-500">{prompt.content}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (prompt: PromptTemplate) => prompt.category,
    },
    {
      key: "status",
      header: "Status",
      render: (prompt: PromptTemplate) => (
        <StatusBadge status={prompt.status} />
      ),
    },
  ];

  const savePrompt = async () => {
    if (!form) return;
    try {
      if (form.id) {
        await update(form.id, form);
      } else {
        await create({
          name: form.name,
          slug: form.name.toLowerCase().replaceAll(" ", "-"),
          category: form.category,
          author: form.author,
          description: form.description,
          content: form.content,
          tags: form.tags,
          isFeatured: form.isFeatured,
          isPublished: form.isPublished,
          status: form.status,
        });
      }
      setDrawerOpen(false);
      setForm(null);
      pushToast({ title: "Prompt saved", variant: "success" });
    } catch {
      pushToast({ title: "Save failed", variant: "error" });
    }
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
                name: "",
                slug: "",
                category: categories[1] ?? "General",
                author: "Softkey AI",
                description: "",
                content: "",
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
        placeholder="Search title, body, author or tags..."
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
              onClick={async () => {
                await Promise.all(
                  [...selectedIds].map((id) =>
                    update(id, { isPublished: true, status: "published" }),
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
              onClick={async () => {
                await Promise.all(
                  [...selectedIds].map((id) =>
                    update(id, { isPublished: false, status: "draft" }),
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
        rows={prompts}
        rowId={(prompt) => prompt.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={(id) =>
          setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          })
        }
        onToggleSelectAll={(checked) =>
          setSelectedIds(
            checked ? new Set(prompts.map((prompt) => prompt.id)) : new Set(),
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
              onClick={async () => {
                await update(prompt.id, {
                  isPublished: !prompt.isPublished,
                  status: prompt.isPublished ? "draft" : "published",
                });
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
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Body</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
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
        description="This permanently removes the prompt."
        danger
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await remove(confirmDelete);
          setConfirmDelete(null);
          pushToast({ title: "Prompt deleted", variant: "success" });
        }}
      />
    </div>
  );
}
