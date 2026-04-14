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

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    function syncViewport() {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  const mergedTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!triggerRef) return;

      if (typeof triggerRef === "function") {
        triggerRef(node);
        return;
      }

      (triggerRef as { current: HTMLButtonElement | null }).current = node;
    },
    [triggerRef],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
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
            "dialog-bottom-sheet left-0 right-0 top-auto bottom-0 h-[min(72dvh,36rem)] w-screen max-h-[calc(100dvh-env(safe-area-inset-top)-0.5rem)] max-w-none translate-x-0 translate-y-0 rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 px-0 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-0",
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="border-b border-border px-6 py-5 pr-14">
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
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
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
                    <Check
                      className={cn(
                        "size-4 text-brand",
                        value === option ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
