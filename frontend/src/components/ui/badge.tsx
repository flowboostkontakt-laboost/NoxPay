import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "primary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" &&
          "border-transparent bg-surface-light text-text",
        variant === "secondary" &&
          "border-transparent bg-surface-light text-text-muted",
        variant === "primary" &&
          "border-transparent bg-primary/20 text-primary-glow",
        variant === "outline" && "border-border text-text",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
