"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down";
  helper?: string;
};

export function StatCard({
  icon,
  label,
  value,
  trend,
  trendDirection = "up",
  helper,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>
      </div>
      {(trend || helper) && (
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span
            className={`inline-flex items-center gap-1 font-medium ${trendDirection === "up" ? "text-emerald-500" : "text-red-500"}`}
          >
            <span>{trendDirection === "up" ? "▲" : "▼"}</span>
            {trend}
          </span>
          {helper && <span>{helper}</span>}
        </div>
      )}
    </div>
  );
}
