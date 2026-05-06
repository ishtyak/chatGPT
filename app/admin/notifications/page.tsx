"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { adminMockState } from "@/lib/admin/mockData";
import type { Notification } from "@/types/admin";
import { useState } from "react";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function NotificationsPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<Notification[]>(
    clone(adminMockState.notifications),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Notification | null>(null);

  const save = () => {
    if (!form) return;
    const next: Notification = {
      ...form,
      id: form.id || `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setItems((current) => {
      const itemsNext = [
        ...current.filter((item) => item.id !== next.id),
        next,
      ];
      adminMockState.notifications = clone(itemsNext);
      return itemsNext;
    });
    setDrawerOpen(false);
    setForm(null);
    pushToast({ title: "Notification saved", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Schedule announcements, broadcasts, and in-app notices for the platform."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Notifications" },
        ]}
        action={
          <button
            onClick={() => {
              setForm({
                id: "",
                type: "announcement",
                title: "",
                body: "",
                audience: "All users",
                status: "draft",
                scheduleAt: null,
                createdAt: new Date().toISOString(),
              });
              setDrawerOpen(true);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            New broadcast
          </button>
        }
      />

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {item.body}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Audience: {item.audience} · Type: {item.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm(item);
                    setDrawerOpen(true);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DrawerForm
        open={drawerOpen}
        title={form?.id ? "Edit notice" : "Compose notice"}
        description="Draft announcements for email or in-app delivery."
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
              onClick={save}
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
                className="min-h-36 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Audience</span>
                <input
                  value={form.audience}
                  onChange={(event) =>
                    setForm({ ...form, audience: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Type</span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type: event.target.value as Notification["type"],
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="announcement">Announcement</option>
                  <option value="email">Email</option>
                  <option value="in_app">In-app</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as Notification["status"],
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Schedule at</span>
                <input
                  type="datetime-local"
                  onChange={(event) =>
                    setForm({ ...form, scheduleAt: event.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </label>
            </div>
          </div>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete notification?"
        description="This removes the notice from the admin mock store."
        danger
        confirmLabel="Delete"
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          setItems((current) => current.filter((item) => item.id !== deleteId));
          adminMockState.notifications = adminMockState.notifications.filter(
            (item) => item.id !== deleteId,
          );
          setDeleteId(null);
          pushToast({ title: "Notification deleted", variant: "success" });
        }}
      />
    </div>
  );
}
