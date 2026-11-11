import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-primary focus:outline-none aria-invalid:border-danger-fg aria-invalid:ring-1 aria-invalid:ring-danger-fg",
        className,
      )}
      {...props}
    />
  );
}
