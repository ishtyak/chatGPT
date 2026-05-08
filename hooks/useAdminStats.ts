"use client";

import { getChartData, getStats } from "@/services/admin/analytics.service";
import type { ChartDataPoint } from "@/types/admin";
import { useEffect, useState } from "react";

export function useAdminStats() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [charts, setCharts] = useState<Record<string, ChartDataPoint[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [nextStats, nextCharts] = await Promise.all([
          getStats(),
          getChartData(),
        ]);
        if (!mounted) return;
        setStats(nextStats);
        setCharts(nextCharts);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    stats,
    charts,
    loading,
    refresh: async () => {
      const [nextStats, nextCharts] = await Promise.all([
        getStats(),
        getChartData(),
      ]);
      setStats(nextStats);
      setCharts(nextCharts);
    },
  };
}
