"use client";

import {
  createPrompt,
  deletePrompt,
  getPrompts,
  updatePrompt,
} from "@/services/admin/prompts.service";
import type { PromptTemplate } from "@/types/admin";
import { useCallback, useEffect, useState } from "react";

export function usePrompts(pageSize = 50) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PromptTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const load = useCallback(
    async (
      currentPage: number,
      currentSearch: string,
      currentCategory: string,
    ) => {
      setLoading(true);
      try {
        const { items, meta } = await getPrompts(currentPage, pageSize, {
          search: currentSearch,
          category: currentCategory,
        });
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
        const { items, meta } = await getPrompts(page, pageSize, {
          search,
          category,
        });
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
  }, [page, pageSize, search, category]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    loading,
    rows,
    total,
    totalPages,
    page,
    setPage,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    category,
    setCategory: (value: string) => {
      setCategory(value);
      setPage(1);
    },
    refresh: () => load(page, search, category),
    create: async (
      payload: Omit<
        PromptTemplate,
        "id" | "usageCount" | "createdAt" | "updatedAt"
      >,
    ) => {
      const created = await createPrompt(payload);
      setRows((current) => [created, ...current]);
      setTotal((current) => current + 1);
      return created;
    },
    update: async (id: string, patch: Partial<PromptTemplate>) => {
      const updated = await updatePrompt(id, patch);
      setRows((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    },
    remove: async (id: string) => {
      await deletePrompt(id);
      setRows((current) => current.filter((item) => item.id !== id));
      setTotal((current) => Math.max(0, current - 1));
    },
  };
}
