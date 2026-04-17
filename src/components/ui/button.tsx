"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "btn-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full select-none text-[clamp(0.85rem,0.8rem+0.2vw,0.98rem)] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground shadow-glow hover:bg-brand/90 hover:shadow-[0_4px_14px_rgba(179,12,49,0.25)]",
        secondary: "bg-card text-foreground border border-border hover:bg-muted hover:border-brand/30",
        ghost: "text-foreground hover:bg-muted/80 hover:text-brand",
        outline: "border border-border bg-transparent hover:bg-brand-soft hover:border-brand/40 hover:text-brand",
        danger: "bg-danger text-danger-foreground hover:bg-danger/85 hover:shadow-[0_4px_16px_rgba(239,68,68,0.3)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-[0.78rem]",
        lg: "h-12 px-6 text-[clamp(0.92rem,0.86rem+0.2vw,1.05rem)]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
