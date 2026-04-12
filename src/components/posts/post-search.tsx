"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PostSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleViewportState = () => {
      const shouldCollapse = window.innerWidth < 768 && window.scrollY > 80;
      setCollapsed(shouldCollapse);
      if (!shouldCollapse) setExpanded(false);
    };

    handleViewportState();
    window.addEventListener("scroll", handleViewportState, { passive: true });
    window.addEventListener("resize", handleViewportState);

    return () => {
      window.removeEventListener("scroll", handleViewportState);
      window.removeEventListener("resize", handleViewportState);
    };
  }, []);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const showCompactButton = collapsed && !expanded && !value;

  if (showCompactButton) {
    return (
      <Button
        aria-label="Expand search"
        className="rounded-full"
        size="icon"
        type="button"
        variant="outline"
        onClick={() => setExpanded(true)}
      >
        <Search className="size-4" />
      </Button>
    );
  }

  return (
    <div className="relative max-w-full transition-all duration-200">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        aria-label="Search posts"
        className="pl-11 pr-12"
        placeholder="Search patient, blood type, hospital, city, state, or condition"
        value={value}
        onBlur={() => {
          if (collapsed && !value) setExpanded(false);
        }}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          type="button"
          onClick={() => {
            onChange("");
            if (collapsed) setExpanded(false);
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
