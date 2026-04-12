"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setDisplayValue(value || 0);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 rounded-full bg-brand transition-all duration-500 ease-out"
        style={{ transform: `translateX(-${100 - displayValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
