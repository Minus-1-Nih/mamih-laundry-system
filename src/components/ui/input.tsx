import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none aria-invalid:border-danger-fg aria-invalid:ring-1 aria-invalid:ring-danger-fg",
        className,
      )}
      {...props}
    />
  );
}
