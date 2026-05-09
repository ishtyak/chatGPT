"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider, ToastViewport } from "../hooks/useToast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </SessionProvider>
  );
}
