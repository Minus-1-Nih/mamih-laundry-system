import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({
  active = false,
  className,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-[34px] items-center rounded-pill border px-3.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-surface text-primary"
          : "border-border bg-surface text-muted hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}
