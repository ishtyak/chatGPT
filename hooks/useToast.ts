"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
};
type ToastContextValue = {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, ...toast }]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast],
  );
  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return createElement(
    "div",
    {
      className:
        "fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2",
    },
    toasts.map((toast) =>
      createElement(
        "button",
        {
          key: toast.id,
          type: "button",
          onClick: () => dismissToast(toast.id),
          className: `rounded-2xl border p-4 text-left shadow-lg backdrop-blur transition-colors ${toast.variant === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" : toast.variant === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : toast.variant === "warning" ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"}`,
        },
        createElement(
          "div",
          { className: "text-sm font-semibold" },
          toast.title,
        ),
        toast.description
          ? createElement(
              "div",
              { className: "mt-1 text-xs leading-5 opacity-90" },
              toast.description,
            )
          : null,
      ),
    ),
  );
}
