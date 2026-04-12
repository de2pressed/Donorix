"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const syncStatus = () => setOnline(navigator.onLine);

    syncStatus();
    window.addEventListener("online", syncStatus);
    window.addEventListener("offline", syncStatus);

    return () => {
      window.removeEventListener("online", syncStatus);
      window.removeEventListener("offline", syncStatus);
    };
  }, []);

  if (online) return null;

  return (
    <div className="sticky top-0 z-[70] border-b border-warning/30 bg-warning/15 px-4 py-3 text-sm text-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <WifiOff className="size-4" />
        You&apos;re offline. Live updates and new submissions will resume when your connection returns.
      </div>
    </div>
  );
}
