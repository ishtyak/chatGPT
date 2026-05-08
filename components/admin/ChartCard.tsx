"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  onExport?: () => void;
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  dateOptions?: { label: string; value: string }[];
};

export function ChartCard({
  title,
  description,
  children,
  onExport,
  dateRange,
  onDateRangeChange,
  dateOptions = [],
}: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dateOptions.length > 0 &&
            dateRange !== undefined &&
            onDateRangeChange && (
              <select
                value={dateRange}
                onChange={(event) => onDateRangeChange(event.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
      <div className="h-72 min-w-0">{children}</div>
    </section>
  );
}
