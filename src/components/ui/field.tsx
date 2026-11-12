import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  errorTone?: "danger" | "warning";
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  errorTone = "danger",
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger-fg" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          className={cn(
            "text-xs",
            errorTone === "warning" ? "text-waiting-fg" : "text-danger-fg",
          )}
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
