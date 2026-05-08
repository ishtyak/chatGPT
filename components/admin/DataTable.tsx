"use client";

import { LoadingSpinner } from "./LoadingSpinner";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowId: (row: T) => string;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  actions?: (row: T) => React.ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyState?: React.ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowId,
  loading = false,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  actions,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyState,
}: Props<T>) {
  const allSelected =
    selectable &&
    rows.length > 0 &&
    rows.every((row) => selectedIds?.has(rowId(row)));

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) =>
                      onToggleSelectAll?.(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
                  }
                >
                  <LoadingSpinner label="Loading table" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
                  }
                  className="p-6"
                >
                  {emptyState ?? (
                    <div className="py-8 text-center text-sm text-zinc-500">
                      No records found.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = rowId(row);
                return (
                  <tr
                    key={id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                  >
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(id) ?? false}
                          onChange={() => onToggleSelect?.(id)}
                          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={`${id}-${column.key}`}
                        className={`px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300 ${column.className ?? ""}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-4 text-right">{actions(row)}</td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
