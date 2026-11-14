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
        "inline-flex h-9 items-center rounded-pill border px-3.5 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-[var(--dur-micro)] active:translate-y-px",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-rule bg-transparent text-ink-2 hover:border-accent hover:text-accent",
        className,
      )}
      {...props}
    />
  );
}
