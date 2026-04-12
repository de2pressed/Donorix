"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

export function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  const tNav = useTranslations("nav");
  const previousCount = useRef(unreadCount);
  const shouldRing = unreadCount > previousCount.current;

  useEffect(() => {
    previousCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <Link
      href="/notifications"
      className="relative flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground"
      aria-label={tNav("notifications")}
    >
      <motion.span
        animate={shouldRing ? { rotate: [0, -16, 12, -10, 6, 0] } : { rotate: 0 }}
        className="inline-flex"
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <Bell className="size-4" />
      </motion.span>
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">
          {Math.min(unreadCount, 9)}
        </span>
      ) : null}
    </Link>
  );
}
