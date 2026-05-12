"use client";

import {
  activateUser,
  bulkSuspendUsers,
  deleteUser,
  exportUsersCsv,
  getUsers,
  suspendUser,
  updateUser,
} from "@/services/admin/users.service";
import type { User, UserStatus } from "@/types/admin";
import { useCallback, useEffect, useMemo, useState } from "react";

export type UserFilters = {
  status: UserStatus | "all";
  planId: string | "all";
  search: string;
  from: string;
  to: string;
};

export function useUsers(initialPage = 1, pageSize = 50) {
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UserFilters>({
    status: "all",
    planId: "all",
    search: "",
    from: "",
    to: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getUsers(page, pageSize, filters);
        if (!mounted) return;
        setRows(result.items);
        setTotal(result.total);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filters, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(rows.map((row) => row.id)) : new Set());
    },
    [rows],
  );

  const mutations = useMemo(
    () => ({
      update: async (id: string, patch: Partial<User>) => {
        const updated = await updateUser(id, patch);
        setRows((current) =>
          current.map((row) => (row.id === id ? updated : row)),
        );
        return updated;
      },
      suspend: async (id: string) => {
        const updated = await suspendUser(id);
        setRows((current) =>
          current.map((row) => (row.id === id ? updated : row)),
        );
        return updated;
      },
      activate: async (id: string) => {
        const updated = await activateUser(id);
        setRows((current) =>
          current.map((row) => (row.id === id ? updated : row)),
        );
        return updated;
      },
      delete: async (id: string) => {
        await deleteUser(id);
        setRows((current) => current.filter((row) => row.id !== id));
        setSelectedIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      },
      removeUser: async (id: string) => {
        setRows((current) => current.filter((row) => row.id !== id));
      },
      bulkSuspend: async (ids: string[]) => {
        await bulkSuspendUsers(ids);
        setRows((current) =>
          current.map((row) =>
            ids.includes(row.id) ? { ...row, status: "suspended" } : row,
          ),
        );
      },
      exportCsv: async (ids?: string[]) => exportUsersCsv(ids),
    }),
    [],
  );

  return {
    page,
    setPage,
    loading,
    error,
    rows,
    total,
    totalPages,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    ...mutations,
  };
}
