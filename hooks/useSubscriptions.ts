"use client";

import { adminMockState } from "@/lib/admin/mockData";
import { createPlan, updatePlan } from "@/services/admin/plans.service";
import type { Plan } from "@/types/admin";
import { useMemo, useState } from "react";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function useSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>(clone(adminMockState.plans));
  const subscriptions = adminMockState.subscriptions;

  const summary = useMemo(() => {
    const mrr = plans.reduce((total, plan) => total + plan.revenueMonthly, 0);
    const arr = plans.reduce((total, plan) => total + plan.revenueYearly, 0);
    const churn = Math.max(
      1,
      Math.round(
        (subscriptions.filter((sub) => sub.status === "canceled").length /
          Math.max(1, subscriptions.length)) *
          100,
      ),
    );
    return { mrr, arr, churn };
  }, [plans, subscriptions]);

  return {
    plans,
    subscriptions,
    summary,
    createPlan: async (
      plan: Omit<
        Plan,
        "id" | "activeSubscribers" | "revenueMonthly" | "revenueYearly"
      >,
    ) => {
      const created = await createPlan(plan);
      setPlans((current) => [...current, created]);
      return created;
    },
    updatePlan: async (id: string, patch: Partial<Plan>) => {
      const updated = await updatePlan(id, patch);
      setPlans((current) =>
        current.map((plan) => (plan.id === id ? updated : plan)),
      );
      return updated;
    },
  };
}
