"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/services/admin/api";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/admin";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";

export default function UsersPage() {
  const router = useRouter();
  const { plans } = useSubscriptions();
  const planLookup = useMemo(
    () => Object.fromEntries(plans.map((plan) => [plan.id, plan.name])),
    [plans],
  );
  const {
    page,
    setPage,
    loading,
    error,
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

  // ── Credit adjustment state ─────────────────────────────────────────────
  const [editUserCredits, setEditUserCredits] = useState<number | null>(null);
  const [creditAdjust, setCreditAdjust] = useState<string>("");
  const [creditReason, setCreditReason] = useState<string>("");
  const [creditLoading, setCreditLoading] = useState(false);
  const prevEditUserId = useRef<string | null>(null);

  // Fetch the selected user's credit balance when the edit drawer opens
  useEffect(() => {
    if (!editUser) { setEditUserCredits(null); return; }
    if (prevEditUserId.current === editUser.id) return;
    prevEditUserId.current = editUser.id;
    setCreditAdjust("");
    setCreditReason("");
    adminApi
      .get(`/payments/users/${editUser.id}/credits`)
      .then((res: any) => setEditUserCredits(res.data?.balance ?? res.data ?? null))
      .catch(() => setEditUserCredits(null));
  }, [editUser]);

  const columns = useMemo(
    () => [
      {
        key: "avatar",
        header: "Avatar",
        render: (user: User) =>
          user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {(user.name ?? "?").slice(0, 2).toUpperCase()}
            </div>
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
        render: (user: User) => <span>{user.aiUsage?.toLocaleString()}</span>,
      },
      {
        key: "credits",
        header: "Credits",
        render: (user: User) => (
          <button
            type="button"
            onClick={() => setEditUser(user)}
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            title="Click to adjust credits"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M12 8v4l3 3" /></svg>
            Edit
          </button>
        ),
      },
      {
        key: "joined",
        header: "Joined",
        render: (user: User) => (
          <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
        ),
      },
    ],
    [planLookup],
  );

  const selectedList = Array.from(selectedIds);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search, inspect, and manage users with bulk controls and account actions."
        breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

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
              ...plans.map((plan) => ({
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
            enqueueSnackbar(`${selectedList.length} users updated.`, { variant: "warning" })
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
            enqueueSnackbar("Export ready", { variant: "warning" })
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
                enqueueSnackbar(user.email, { variant: "warning" })
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
        onClose={() => {
          setEditUser(null);
          prevEditUserId.current = null;
        }}
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
                enqueueSnackbar("User updated", { variant: "warning" })
                setEditUser(null);
                prevEditUserId.current = null;
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
                {plans.map((plan) => (
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

            {/* ── Credit adjustment ── */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Wallet Credits</span>
                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">
                  {editUserCredits !== null ? editUserCredits : "…"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. +10 or -5"
                  value={creditAdjust}
                  onChange={(e) => setCreditAdjust(e.target.value)}
                  className="w-28 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>
              <button
                type="button"
                disabled={creditLoading || !creditAdjust || Number(creditAdjust) === 0 || isNaN(Number(creditAdjust))}
                onClick={async () => {
                  if (!editUser || !creditAdjust) return;
                  const amount = Number(creditAdjust);
                  if (isNaN(amount) || amount === 0) return;
                  setCreditLoading(true);
                  try {
                    const res = await adminApi.post("/payments/adjust", {
                      userId: editUser.id,
                      amount,
                      reason: creditReason || (amount > 0 ? "admin_add" : "admin_deduct"),
                    });
                    if (res?.data?.message == "Feature not availiable in demo mode") {
                      alert("Feature not availiable in demo mode")
                      return
                    }
                    const newBalance = (res as any).data?.balance ?? (editUserCredits ?? 0) + amount;
                    setEditUserCredits(typeof newBalance === "number" ? newBalance : (editUserCredits ?? 0) + amount);
                    setCreditAdjust("");
                    setCreditReason("");
                    enqueueSnackbar(`Credits ${amount > 0 ? "added" : "deducted"} (${amount > 0 ? "+" : ""}${amount})`, { variant: "success" })
                  } catch (err: any) {
                    enqueueSnackbar(err?.message, { variant: "error" })
                  } finally {
                    setCreditLoading(false);
                  }
                }}
                className="w-full rounded-xl bg-indigo-600 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {creditLoading ? "Applying…" : "Apply adjustment"}
              </button>
            </div>
          </div>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        description="This action permanently removes the user account."
        danger
        confirmLabel="Delete user"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteUser(deleteTarget);
          enqueueSnackbar("User deleted", { variant: "success" })
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
