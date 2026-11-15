"use client";

import { useAppStore } from "@/lib/store";
import { sessionLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

export function SessionPill() {
  const sessions = useAppStore((state) => state.sessions);
  const active = sessions.find((session) => session.open);

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1.5 text-13 font-medium whitespace-nowrap",
        active
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-rule bg-paper-2 text-muted",
      )}
    >
      {active
        ? `Sesi ${sessionLabel(active.type).toLowerCase()} aktif`
        : "Di luar jam operasional"}
    </span>
  );
}
