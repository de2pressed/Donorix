"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { Ref } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type SearchablePickerProps = {
  id?: string;
  title: string;
  description?: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  value?: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (value: string) => void;
  triggerRef?: Ref<HTMLButtonElement>;
};

export function SearchablePicker({
  id,
  title,
  description,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  value,
  options,
  disabled = false,
  onChange,
  triggerRef,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(640);
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null);
  const [mobileTop, setMobileTop] = useState(96);
  const [mobileSheetHeight, setMobileSheetHeight] = useState(360);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    function syncViewport() {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
      setViewportHeight(Math.round(window.visualViewport?.height ?? window.innerHeight));
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
    };
  }, []);

  const mergedTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      setTriggerElement(node);

      if (!triggerRef) return;

      if (typeof triggerRef === "function") {
        triggerRef(node);
        return;
      }

      (triggerRef as { current: HTMLButtonElement | null }).current = node;
    },
    [triggerRef],
  );

  useEffect(() => {
    if (!open || !isMobile || !triggerElement) {
      return;
    }

    function updateMobilePlacement() {
      const anchor = triggerElement;
      if (!anchor) {
        return;
      }

      const visualViewport = window.visualViewport;
      const viewportTop = Math.round(visualViewport?.offsetTop ?? 0);
      const viewportBottom = viewportTop + Math.round(visualViewport?.height ?? window.innerHeight);
      const rect = anchor.getBoundingClientRect();
      const safeTop = viewportTop + 12;
      const safeBottom = viewportBottom - 12;
      const spaceBelow = safeBottom - rect.bottom - 8;
      const spaceAbove = rect.top - safeTop - 8;
      const renderAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
      const maxViewportHeight = Math.max(160, Math.min(safeBottom - safeTop, 420));
      const preferredSpace = Math.max(220, Math.min(renderAbove ? spaceAbove : spaceBelow, 420));
      const availableSpace = Math.min(preferredSpace, maxViewportHeight);

      setMobileSheetHeight(availableSpace);
      setMobileTop(
        renderAbove
          ? Math.max(safeTop, rect.top - availableSpace - 8)
          : Math.min(rect.bottom + 8, safeBottom - availableSpace),
      );
    }

    updateMobilePlacement();

    window.addEventListener("resize", updateMobilePlacement);
    window.visualViewport?.addEventListener("resize", updateMobilePlacement);
    window.visualViewport?.addEventListener("scroll", updateMobilePlacement);

    return () => {
      window.removeEventListener("resize", updateMobilePlacement);
      window.visualViewport?.removeEventListener("resize", updateMobilePlacement);
      window.visualViewport?.removeEventListener("scroll", updateMobilePlacement);
    };
  }, [isMobile, open, triggerElement, viewportHeight]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <button
          ref={mergedTriggerRef}
          aria-expanded={open}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-2 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
          id={id}
          type="button"
        >
          <span className="truncate">{value ?? placeholder}</span>
          <ChevronsUpDown className="ml-3 size-4 shrink-0 text-muted-foreground" />
        </button>
      </DialogTrigger>
        <DialogContent
          className={cn(
            "max-h-[min(85vh,42rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0 sm:max-w-lg",
            isMobile &&
              "left-3 right-3 w-auto max-w-none translate-x-0 translate-y-0 rounded-[1.5rem]",
          )}
          style={
            isMobile
              ? {
                  top: `${mobileTop}px`,
                  height: `${mobileSheetHeight}px`,
                  maxHeight: `${mobileSheetHeight}px`,
                }
              : undefined
        }
      >
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="border-b border-border px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-11"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div
          className="max-h-[50vh] overflow-y-auto px-3 py-3 md:max-h-[50vh]"
          style={isMobile ? { maxHeight: `${Math.max(180, mobileSheetHeight - 148)}px` } : undefined}
        >
          {filteredOptions.length ? (
            <div className="space-y-1">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{option}</span>
                  <Check className={cn("size-4 text-brand", value === option ? "opacity-100" : "opacity-0")} />
                </button>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
