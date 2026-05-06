"use client";

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-500" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
