"use client";

import { ChartCard } from "@/components/admin/ChartCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useMemo, useState } from "react";

type PlanForm = {
  id?: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  aiCallQuota: number;
  modelAccess: string[];
  features: string;
};

export default function SubscriptionsPage() {
  const { plans, subscriptions, summary, createPlan, updatePlan, removePlan } =
    useSubscriptions();
  const [form, setForm] = useState<PlanForm>({
    name: "",
    priceMonthly: 0,
    priceYearly: 0,
    aiCallQuota: 0,
    modelAccess: [],
    features: "",
  });
  const [open, setOpen] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const activeSubscribers = useMemo(
    () =>
      subscriptions.map((subscription) => {
        const plan = plans.find((item) => item.id === subscription.planId);
        return {
          ...subscription,
          planName: plan?.name ?? subscription.planId,
        };
      }),
    [plans, subscriptions],
  );

  const openEdit = (planId?: string) => {
    const plan = planId ? plans.find((item) => item.id === planId) : undefined;
    setForm(
      plan
        ? {
            id: plan.id,
            name: plan.name,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            aiCallQuota: plan.aiCallQuota,
            modelAccess: plan.modelAccess,
            features: plan.features.join(", "),
          }
        : {
            name: "",
            priceMonthly: 0,
            priceYearly: 0,
            aiCallQuota: 0,
            modelAccess: [],
            features: "",
          },
    );
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions & Plans"
        description="Create plans, tune limits, and track revenue and subscriber health."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Subscriptions" },
        ]}
        action={
          <button
            onClick={() => openEdit()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Create plan
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-1">
        <ChartCard
          title="Revenue summary"
          description="Top-line commercial snapshot."
        >
          <div className="grid h-full grid-cols-3 gap-4">
            {[
              ["MRR", `$${summary.mrr?.toLocaleString()}`],
              ["ARR", `$${summary.arr?.toLocaleString()}`],
              ["Churn", `${summary.churn}%`],
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
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>
              </div>
              <StatusBadge status={plan.isActive ? "active" : "disabled"} />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                ${plan.priceMonthly}
              </span>
              <span className="pb-1 text-sm text-zinc-500">/mo</span>
            </div>
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              Quota: {plan.aiCallQuota?.toLocaleString()} calls
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400"
                >
                  {feature}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => openEdit(plan.id)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-800"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletePlanId(plan.id)}
                className="rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Active subscribers
        </h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                  Billing
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {activeSubscribers.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {subscription.userId}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {subscription.planName}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {subscription.cycle}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={subscription.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DrawerForm
        open={open}
        title={form.id ? "Edit plan" : "Create plan"}
        description="Define pricing, AI quota, models, and feature access."
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={async () => {
                const payload = {
                  name: form.name,
                  slug: form.name.toLowerCase().replaceAll(" ", "-"),
                  description: `${form.name} plan`,
                  priceMonthly: form.priceMonthly,
                  priceYearly: form.priceYearly,
                  currency: "USD",
                  aiCallQuota: form.aiCallQuota,
                  modelAccess: form.modelAccess,
                  features: form.features
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                  isActive: true,
                  sortOrder: plans.length + 1,
                } as const;
                if (form.id) {
                  await updatePlan(form.id, {
                    ...payload,
                    id: form.id,
                    activeSubscribers: 0,
                    revenueMonthly: 0,
                    revenueYearly: 0,
                  } as never);
                } else {
                  await createPlan(payload);
                }
                setOpen(false);
              }}
            >
              Save plan
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Plan name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Monthly price</span>
              <input
                type="number"
                value={form.priceMonthly}
                onChange={(event) =>
                  setForm({ ...form, priceMonthly: Number(event.target.value) })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Yearly price</span>
              <input
                type="number"
                value={form.priceYearly}
                onChange={(event) =>
                  setForm({ ...form, priceYearly: Number(event.target.value) })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">AI call quota</span>
            <input
              type="number"
              value={form.aiCallQuota}
              onChange={(event) =>
                setForm({ ...form, aiCallQuota: Number(event.target.value) })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Model access</span>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              {[
                "GPT-4.1",
                "GPT-4o",
                "Claude Sonnet 4",
                "Claude Opus 4",
                "Gemini Pro",
                "Mistral Large",
              ].map((model) => (
                <label key={model} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.modelAccess.includes(model)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        modelAccess: event.target.checked
                          ? [...form.modelAccess, model]
                          : form.modelAccess.filter((item) => item !== model),
                      })
                    }
                  />
                  {model}
                </label>
              ))}
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Features</span>
            <textarea
              value={form.features}
              onChange={(event) =>
                setForm({ ...form, features: event.target.value })
              }
              className="min-h-28 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Comma separated features"
            />
          </label>
        </div>
      </DrawerForm>

      <ConfirmDialog
        open={Boolean(deletePlanId)}
        title="Delete plan?"
        description="This will permanently remove the plan."
        danger
        confirmLabel="Delete plan"
        onClose={() => setDeletePlanId(null)}
        onConfirm={async () => {
          if (deletePlanId) await removePlan(deletePlanId);
          setDeletePlanId(null);
        }}
      />
    </div>
  );
}
