"use client";

import {
  createPlan,
  deletePlan,
  getPlans,
  getSubscriptions,
  updatePlan,
} from "@/services/admin/plans.service";
import type { Plan, Subscription } from "@/types/admin";
import { useEffect, useMemo, useState } from "react";

export function useSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [plansData, subsData] = await Promise.all([
          getPlans(),
          getSubscriptions().catch(() => [] as Subscription[]),
        ]);
        if (!mounted) return;
        setPlans(plansData);
        setSubscriptions(subsData);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const mrr = plans.reduce(
      (total, plan) => total + (plan.revenueMonthly ?? 0),
      0,
    );
    const arr = plans.reduce(
      (total, plan) => total + (plan.revenueYearly ?? 0),
      0,
    );
    const churn = subscriptions.length
      ? Math.max(
          1,
          Math.round(
            (subscriptions.filter((sub) => sub.status === "canceled").length /
              subscriptions.length) *
              100,
          ),
        )
      : 0;
    return { mrr, arr, churn };
  }, [plans, subscriptions]);

  return {
    loading,
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
    removePlan: async (id: string) => {
      await deletePlan(id);
      setPlans((current) => current.filter((plan) => plan.id !== id));
    },
  };
}
