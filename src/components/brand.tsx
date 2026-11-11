import Link from "next/link";
import { Waves } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BrandProps {
  href?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export function Brand({
  href = "/public",
  subtitle,
  className,
  compact = false,
}: BrandProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-primary text-white",
          compact ? "h-9 w-9" : "h-10 w-10",
        )}
      >
        <Waves className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-bold tracking-tight text-primary",
            compact ? "text-lg" : "text-xl",
          )}
        >
          Laundria
        </span>
        {subtitle ? (
          <span className="block text-xs leading-tight text-muted">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
