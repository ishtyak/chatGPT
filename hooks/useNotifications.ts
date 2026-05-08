"use client";

import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "@/services/admin/notifications.service";
import type { Notification } from "@/types/admin";
import { useCallback, useEffect, useState } from "react";

export function useNotifications(pageSize = 50) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const { items, meta } = await getNotifications(currentPage, pageSize);
        setRows(items);
        setTotal(meta.total);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { items, meta } = await getNotifications(page, pageSize);
        if (!mounted) return;
        setRows(items);
        setTotal(meta.total);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    loading,
    rows,
    total,
    totalPages,
    page,
    setPage,
    refresh: () => load(page),
    create: async (payload: Omit<Notification, "id" | "createdAt">) => {
      const created = await createNotification(payload);
      setRows((current) => [created, ...current]);
      setTotal((current) => current + 1);
      return created;
    },
    update: async (id: string, patch: Partial<Notification>) => {
      const updated = await updateNotification(id, patch);
      setRows((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    },
    remove: async (id: string) => {
      await deleteNotification(id);
      setRows((current) => current.filter((item) => item.id !== id));
      setTotal((current) => Math.max(0, current - 1));
    },
  };
}
