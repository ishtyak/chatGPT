"use client";

import {
  getProviders,
  reorderProviders,
  testProviderKey,
  toggleProvider,
  updateProvider,
} from "@/services/admin/providers.service";
import type { AIProvider } from "@/types/admin";
import { useEffect, useState } from "react";

export function useProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const nextProviders = await getProviders();
        if (!mounted) return;
        setProviders(nextProviders);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    providers,
    loading,
    updateProvider: async (id: string, patch: Partial<AIProvider>) => {
      const updated = await updateProvider(id, patch);
      setProviders((current) =>
        current.map((provider) => (provider.id === id ? updated : provider)),
      );
      return updated;
    },
    toggleProvider: async (id: string, enabled: boolean) => {
      const updated = await toggleProvider(id, enabled);
      setProviders((current) =>
        current.map((provider) => (provider.id === id ? updated : provider)),
      );
      return updated;
    },
    reorderProviders: async (ids: string[]) => {
      const updated = await reorderProviders(ids);
      setProviders(updated);
      return updated;
    },
    testProviderKey,
  };
}
