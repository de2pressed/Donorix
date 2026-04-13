"use client";

import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? t("toLight") : t("toDark")}
      className={className}
      size="icon"
      type="button"
      variant="ghost"
      onClick={() => {
        const root = document.documentElement;
        root.classList.add("theme-transition");
        window.requestAnimationFrame(() => {
          setTheme(isDark ? "light" : "dark");
        });
        window.setTimeout(() => {
          root.classList.remove("theme-transition");
        }, 320);
      }}
    >
      <motion.span
        animate={{ opacity: 1, rotate: isDark ? 180 : 0, scale: 1 }}
        className="inline-flex"
        initial={false}
        transition={{ duration: 0.28, ease: "easeInOut" }}
      >
        {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
      </motion.span>
    </Button>
  );
}
