"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useToast } from "@/hooks/useToast";
import {
    activateUser,
    deleteUser,
    getUserById,
    getUserSessions,
    suspendUser,
    updateUser,
} from "@/services/admin/users.service";
import type { User, UserSession } from "@/types/admin";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pushToast } = useToast();
  const { plans } = useSubscriptions();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const planLookup = useMemo(
    () => Object.fromEntries(plans.map((plan) => [plan.id, plan.name])),
    [plans],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [currentUser, currentSessions] = await Promise.all([
        getUserById(params.id),
        getUserSessions(params.id),
      ]);
      if (!mounted) return;
      setUser(currentUser);
      setSessions(currentSessions);
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const planName = user ? (planLookup[user.planId] ?? user.planId) : "—";

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/80">
        Loading user profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={user.email}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: user.name },
        ]}
        action={
          <button
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-800"
            onClick={() => router.back()}
          >
            Back
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 rounded-full border border-zinc-200 dark:border-zinc-800"
              />
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Joined {new Date(user.joinedAt).toLocaleDateString()} ·{" "}
                  {user.country}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const updated = await suspendUser(user.id);
                  setUser(updated);
                  pushToast({ title: "User suspended", variant: "warning" });
                }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = await activateUser(user.id);
                  setUser(updated);
                  pushToast({ title: "User activated", variant: "success" });
                }}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300"
              >
                Activate
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["AI Usage", user.aiUsage?.toLocaleString()],
              ["Chat Count", user.chatCount?.toLocaleString()],
              ["Usage Minutes", user.usageMinutes?.toLocaleString()],
              ["Spent", `$${user.totalSpent?.toLocaleString()}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Name</span>
              <input
                value={user.name}
                onChange={(event) =>
                  setUser({ ...user, name: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Email</span>
              <input
                value={user.email}
                onChange={(event) =>
                  setUser({ ...user, email: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Plan</span>
              <select
                value={user.planId}
                onChange={(event) =>
                  setUser({ ...user, planId: event.target.value })
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
                value={user.status}
                onChange={(event) =>
                  setUser({
                    ...user,
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

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                const updated = await updateUser(user.id, user);
                setUser(updated);
                pushToast({ title: "Profile saved", variant: "success" });
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Plan
            </h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span>{planName}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Usage summary
            </h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Template uses</span>
                <span>{user.templateCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tool clicks</span>
                <span>{user.toolClicks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Source</span>
                <span>{user.source}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Session history
        </h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <DataTable<UserSession>
            columns={[
              {
                key: "device",
                header: "Device",
                render: (session) => session.device,
              },
              {
                key: "browser",
                header: "Browser",
                render: (session) => session.browser,
              },
              {
                key: "ip",
                header: "IP",
                render: (session) => session.ipAddress,
              },
              {
                key: "location",
                header: "Location",
                render: (session) => session.location,
              },
              {
                key: "status",
                header: "Status",
                render: (session) => <StatusBadge status={session.status} />,
              },
              {
                key: "lastSeen",
                header: "Last Seen",
                render: (session) =>
                  new Date(session.lastSeenAt)?.toLocaleString(),
              },
            ]}
            rows={sessions}
            rowId={(session) => session.id}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this user?"
        description="This permanently removes the user account."
        danger
        confirmLabel="Delete user"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteUser(user.id);
          pushToast({ title: "User deleted", variant: "success" });
          router.push("/admin/users");
        }}
      />
    </div>
  );
}


