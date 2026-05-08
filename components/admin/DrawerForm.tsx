"use client";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
};

export function DrawerForm({
  open,
  title,
  description,
  children,
  onClose,
  footer,
}: Props) {
  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-zinc-950/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl border-l border-zinc-200 bg-white shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-950 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
              {footer}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
