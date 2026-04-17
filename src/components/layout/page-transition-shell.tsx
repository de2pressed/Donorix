"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function SearchParamsKey({
  children,
  pathname,
  reduceMotion,
}: {
  children: React.ReactNode;
  pathname: string;
  reduceMotion: boolean;
}) {
  const searchParams = useSearchParams();
  const search = searchParams?.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(2px)" }}
      key={routeKey}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const failSafeTimeout = useRef<number | null>(null);

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
      setProgress(0);

      if (failSafeTimeout.current) {
        window.clearTimeout(failSafeTimeout.current);
      }

      failSafeTimeout.current = window.setTimeout(() => {
        setProgress(100);
        setLoading(false);
        window.setTimeout(() => setProgress(0), 120);
      }, 500);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (failSafeTimeout.current) {
        window.clearTimeout(failSafeTimeout.current);
      }
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
      return;
    }

    if (failSafeTimeout.current) {
      window.clearTimeout(failSafeTimeout.current);
      failSafeTimeout.current = null;
    }

    setProgress(100);

    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {loading ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
            initial={reduceMotion ? { opacity: 0.96 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(5,5,6,0.84)_0%,rgba(16,9,12,0.78)_42%,rgba(3,3,4,0.92)_100%)] backdrop-blur-[30px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_52%_at_50%_0%,rgba(179,12,49,0.18)_0%,rgba(179,12,49,0.08)_38%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.14)_100%)]" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-1">
        <motion.div
          animate={{ opacity: progress > 0 ? 1 : 0, scaleX: progress / 100 }}
          className="h-full origin-left bg-brand shadow-[0_0_18px_rgba(179,12,49,0.45)]"
          initial={false}
          transition={{
            scaleX: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
            opacity: { duration: 0.15 },
          }}
        />
      </div>

      <Suspense
        fallback={
          <motion.div
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(2px)" }}
            key={pathname}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        }
      >
        <SearchParamsKey pathname={pathname} reduceMotion={reduceMotion}>
          {children}
        </SearchParamsKey>
      </Suspense>
    </>
  );
}
