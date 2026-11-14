import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full border border-muted bg-paper px-3 text-base text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus aria-invalid:border-danger-fg aria-invalid:outline-1 aria-invalid:outline-danger-fg disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
