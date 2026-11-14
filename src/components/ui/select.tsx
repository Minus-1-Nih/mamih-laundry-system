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
        "h-11 w-full border border-muted bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus aria-invalid:border-danger-fg disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
