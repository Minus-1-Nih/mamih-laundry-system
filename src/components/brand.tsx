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
    <Link
      href={href}
      aria-label="Laundria, beranda"
      className={cn("flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-accent text-accent-ink",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
      >
        <Waves className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-display leading-none text-ink",
            compact ? "text-xl" : "text-2xl",
          )}
        >
          Laundria
        </span>
        {subtitle ? (
          <span className="small-print mt-1 block text-muted">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
