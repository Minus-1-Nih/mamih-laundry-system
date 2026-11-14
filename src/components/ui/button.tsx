import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerSolid";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-accent-ink hover:border-accent-hover hover:bg-accent-hover",
  secondary:
    "border border-ink bg-transparent text-ink hover:bg-paper-2",
  ghost:
    "border border-transparent bg-transparent text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger:
    "border border-danger-fg bg-danger-bg text-danger-fg hover:bg-danger-hover",
  dangerSolid:
    "border border-danger-fg bg-danger-fg text-paper hover:bg-danger-strong",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-13",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-[var(--dur-micro)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
