"use client";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
