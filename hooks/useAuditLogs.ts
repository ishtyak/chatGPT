"use client";

import { getAuditLogs } from "@/services/admin/auditLogs.service";
import type { AuditLog } from "@/types/admin";
import { useEffect, useState } from "react";

export function useAuditLogs(
  pageSize = 50,
  filters: { entity?: string; action?: string } = {},
) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const entity = filters.entity;
  const action = filters.action;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { items, meta } = await getAuditLogs(page, pageSize, {
          entity,
          action,
        });
        if (!mounted) return;
        setRows(items);
        setTotal(meta.total);
        setTotalPages(meta.totalPages);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, pageSize, entity, action]);

  return { loading, rows, total, totalPages, page, setPage };
}
