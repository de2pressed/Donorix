"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type NotificationToastItem = {
  id: string;
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "emergency";
  createdAt?: string;
};

interface NotificationToastProps {
  toasts: NotificationToastItem[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !toasts.length) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl glass-panel px-4 py-3 shadow-lg ${toast.type === "emergency" ? "border-l-4 border-red-500" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-content-primary">{toast.title}</p>
            {toast.message ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-content-secondary">{toast.message}</p>
            ) : null}
          </div>
          <button
            aria-label="Dismiss notification"
            className="btn-interactive shrink-0 rounded-md p-1 text-content-secondary transition hover:text-content-primary"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
