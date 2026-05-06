"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { useUsers } from "@/hooks/useUsers";
import { adminMockState } from "@/lib/admin/mockData";
import type { User } from "@/types/admin";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const planLookup = Object.fromEntries(
  adminMockState.plans.map((plan) => [plan.id, plan.name]),
);

export default function UsersPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const {
    page,
    setPage,
    loading,
    rows,
    totalPages,
    filters,
    setFilters,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    update,
    suspend,
    delete: deleteUser,
    bulkSuspend,
    exportCsv,
  } = useUsers(1, 50);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      {
        key: "avatar",
        header: "Avatar",
        render: (user: User) => (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800"
          />
        ),
      },
      {
        key: "name",
        header: "Name",
        render: (user: User) => (
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {user.name}
            </p>
            <p className="text-xs text-zinc-500">{user.country}</p>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (user: User) => <span>{user.email}</span>,
      },
      {
        key: "plan",
        header: "Plan",
        render: (user: User) => (
          <span>{planLookup[user.planId] ?? user.planId}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (user: User) => <StatusBadge status={user.status} />,
      },
      {
        key: "usage",
        header: "AI Usage",
        render: (user: User) => <span>{user.aiUsage.toLocaleString()}</span>,
      },
      {
        key: "joined",
        header: "Joined",
        render: (user: User) => (
          <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
        ),
      },
    ],
    [],
  );

  const selectedList = Array.from(selectedIds);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search, inspect, and manage users with bulk controls and account actions."
        breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
      />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        placeholder="Search name, email, country, source…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status,
            onChange: (status) =>
              setFilters((current) => ({
                ...current,
                status: status as typeof filters.status,
              })),
            options: [
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
              { label: "Unverified", value: "unverified" },
            ],
          },
          {
            key: "plan",
            label: "Plan",
            value: filters.planId,
            onChange: (planId) =>
              setFilters((current) => ({ ...current, planId })),
            options: [
              { label: "All", value: "all" },
              ...adminMockState.plans.map((plan) => ({
                label: plan.name,
                value: plan.id,
              })),
            ],
          },
        ]}
        rightSlot={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={async () => {
            await bulkSuspend(selectedList);
            pushToast({
              title: "Users suspended",
              description: `${selectedList.length} users updated.`,
              variant: "warning",
            });
          }}
          disabled={selectedList.length === 0}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bulk suspend
        </button>
        <button
          type="button"
          onClick={async () => {
            const csv = await exportCsv(selectedList);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "users.csv";
            anchor.click();
            URL.revokeObjectURL(url);
            pushToast({ title: "Export ready", variant: "success" });
          }}
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Export CSV
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Selected: {selectedList.length}
        </span>
      </div>

      <DataTable<User>
        columns={columns}
        rows={rows}
        rowId={(user) => user.id}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<span>U</span>}
            title="No users found"
            description="Try broadening the filters or resetting the date range."
          />
        }
        actions={(user) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/users/${user.id}`)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => setEditUser(user)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={async () => {
                await suspend(user.id);
                pushToast({
                  title: "User suspended",
                  description: user.email,
                  variant: "warning",
                });
              }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300"
            >
              Suspend
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(user.id)}
              className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      />

      <DrawerForm
        open={Boolean(editUser)}
        title={editUser ? `Edit ${editUser.name}` : "Edit user"}
        description="Update core account fields and plan assignment."
        onClose={() => setEditUser(null)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={async () => {
                if (!editUser) return;
                await update(editUser.id, editUser);
                pushToast({ title: "User updated", variant: "success" });
                setEditUser(null);
              }}
            >
              Save changes
            </button>
          </div>
        }
      >
        {editUser && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Name</span>
              <input
                value={editUser.name}
                onChange={(event) =>
                  setEditUser({ ...editUser, name: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Email</span>
              <input
                value={editUser.email}
                onChange={(event) =>
                  setEditUser({ ...editUser, email: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Plan</span>
              <select
                value={editUser.planId}
                onChange={(event) =>
                  setEditUser({ ...editUser, planId: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                {adminMockState.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Status</span>
              <select
                value={editUser.status}
                onChange={(event) =>
                  setEditUser({
                    ...editUser,
                    status: event.target.value as User["status"],
                  })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="unverified">Unverified</option>
              </select>
            </label>
          </div>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        description="This action permanently removes the account, subscriptions, and sessions from the admin mock store."
        danger
        confirmLabel="Delete user"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteUser(deleteTarget);
          pushToast({ title: "User deleted", variant: "success" });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
