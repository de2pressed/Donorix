"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("donorix-booting")) {
      return;
    }

    const startedAt =
      typeof window.__donorixSplashStart === "number"
        ? window.__donorixSplashStart
        : Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, 600 - elapsed);

    const timeoutId = window.setTimeout(() => {
      root.classList.remove("donorix-booting");
      window.sessionStorage.setItem("donorix_splash_v2_seen", "true");
    }, remaining);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={pathname}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(2px)" }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
