import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface BrandProps {
  href?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  tone?: "onPaper" | "onInk";
}

export function Brand({
  href = "/public",
  subtitle,
  className,
  compact = false,
  tone = "onPaper",
}: BrandProps) {
  const size = compact ? 32 : 40;
  const height = Math.round((size * 205) / 235);
  const onInk = tone === "onInk";

  return (
    <Link
      href={href}
      aria-label="Laundria, beranda"
      className={cn("flex items-center gap-2.5", className)}
    >
      <Image
        src="/brand/laundriamascot.png"
        alt=""
        width={size}
        height={height}
        className="shrink-0 object-contain"
        style={{ filter: "drop-shadow(4px 4px 0 var(--color-gold-2))" }}
      />
      <span className="min-w-0">
        <span
          className={cn(
            "block font-brand leading-none",
            onInk ? "text-paper" : "text-ink",
            compact ? "text-xl" : "text-2xl",
          )}
          style={{
            textShadow: onInk
              ? "2px 2px 0 var(--color-accent), 4px 4px 0 var(--color-gold-2)"
              : "4px 4px 0 var(--color-gold-2)",
          }}
        >
          Laundria
        </span>
        {subtitle ? (
          <span
            className={cn(
              "small-print mt-1 block",
              onInk ? "text-paper/75" : "text-muted",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
