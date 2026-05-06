"use client";

import { useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Props = {
  adminName: string;
  adminEmail: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  notifications: NotificationItem[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function AdminTopbar({
  adminName,
  adminEmail,
  collapsed,
  onToggleSidebar,
  onSignOut,
  notifications,
  searchValue = "",
  onSearchChange,
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {collapsed ? "☰" : "⇤"}
        </button>
        <div className="hidden flex-1 md:block">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search users, plans, prompts, tools…"
            className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowNotifications((value) => !value)}
            className="relative rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            🔔
            <span className="ml-2 text-xs text-zinc-500">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => setShowMenu((value) => !value)}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
              {(adminName ?? "A").slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {adminName}
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                {adminEmail}
              </span>
            </span>
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-4 top-16 z-30 w-[min(92vw,24rem)] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Notifications
            </h3>
            <button
              className="text-xs text-zinc-500"
              onClick={() => setShowNotifications(false)}
            >
              Close
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMenu && (
        <div className="absolute right-4 top-16 z-30 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
