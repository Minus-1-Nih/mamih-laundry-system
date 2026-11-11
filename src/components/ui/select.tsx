import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none aria-invalid:border-danger-fg aria-invalid:ring-1 aria-invalid:ring-danger-fg",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
