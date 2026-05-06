"use client";

import {
  getSettings,
  updateFeatureFlags,
  updateSettings,
} from "@/services/admin/settings.service";
import type { AppSettings, FeatureFlags } from "@/types/admin";
import { useEffect, useState } from "react";

export function useSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        if (!mounted) return;
        setAppSettings(data.appSettings);
        setFeatureFlags(data.featureFlags);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveSettings = async (patch: Partial<AppSettings>) => {
    setSaving(true);
    try {
      const updated = await updateSettings(patch);
      setAppSettings(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const saveFeatureFlags = async (flags: Partial<FeatureFlags>) => {
    setSaving(true);
    try {
      const updated = await updateFeatureFlags(flags);
      setFeatureFlags(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    appSettings,
    featureFlags,
    saveSettings,
    saveFeatureFlags,
  };
}
