"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Droplets } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export function PageTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const initialized = useRef(false);
  const previousPath = useRef(pathname);

  const routeKey = useMemo(() => {
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (sessionStorage.getItem("donorix_splash_v1_seen") === "true") {
      return;
    }

    setShowSplash(true);
    sessionStorage.setItem("donorix_splash_v1_seen", "true");

    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;

      const nextUrl = new URL(link.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const currentUrl = `${window.location.pathname}${window.location.search}`;
      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;

      if (currentUrl === nextPath) return;

      setLoading(true);
      setProgress(12);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const intervalId = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 85) return current;
        return current + Math.max(2, (90 - current) * 0.14);
      });
    }, 120);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loading]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      previousPath.current = pathname;
      return;
    }

    previousPath.current = pathname;
    setProgress(100);

    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, searchParams]);

  const isPolicyTransition =
    pathname.startsWith("/policies") && previousPath.current.startsWith("/policies");

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-1">
        <motion.div
          animate={{ opacity: progress > 0 ? 1 : 0, scaleX: progress / 100 }}
          className="h-full origin-left bg-brand shadow-[0_0_18px_rgba(179,12,49,0.45)]"
          initial={false}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[94] flex items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            initial={{ opacity: 1 }}
            key="donorix-splash"
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
              >
                <div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-brand text-brand-foreground shadow-glow">
                  <Droplets className="size-7" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                    India-first blood matching
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">Donorix</h1>
                </div>
              </motion.div>
              <div className="h-16 w-8 overflow-hidden rounded-full border border-brand/20 bg-brand-soft/60 p-1">
                <motion.div
                  animate={{ height: "100%" }}
                  className="w-full rounded-full bg-gradient-to-t from-brand via-brand to-[#ff7a59]"
                  initial={{ height: reduceMotion ? "100%" : "12%" }}
                  transition={{ duration: reduceMotion ? 0 : 0.72, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={
            isPolicyTransition
              ? { opacity: 0, x: reduceMotion ? 0 : -24 }
              : { opacity: 0, y: reduceMotion ? 0 : -6 }
          }
          initial={
            isPolicyTransition
              ? { opacity: 0, x: reduceMotion ? 0 : 24 }
              : { opacity: 0, y: reduceMotion ? 0 : 8 }
          }
          key={routeKey}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
