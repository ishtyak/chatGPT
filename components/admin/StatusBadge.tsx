"use client";

type Props = { status: string; className?: string };

const STATUS_MAP: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20",
  suspended: "bg-red-500/15 text-red-500 ring-1 ring-red-500/20",
  unverified: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20",
  pending: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20",
  error: "bg-red-500/15 text-red-500 ring-1 ring-red-500/20",
  disabled: "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20",
  draft: "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20",
  published: "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20",
  sent: "bg-indigo-500/15 text-indigo-500 ring-1 ring-indigo-500/20",
  scheduled: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20",
  paid: "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20",
  failed: "bg-red-500/15 text-red-500 ring-1 ring-red-500/20",
  trialing: "bg-indigo-500/15 text-indigo-500 ring-1 ring-indigo-500/20",
  past_due: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20",
  refunded: "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20",
};

export function StatusBadge({ status, className = "" }: Props) {
  const normalized = status ?? "";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_MAP[normalized] ?? "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20"} ${className}`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}
