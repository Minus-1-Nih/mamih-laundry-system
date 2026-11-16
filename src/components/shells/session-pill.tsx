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
      className="inline-flex items-center gap-2 text-13 font-medium whitespace-nowrap text-ink-2"
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          active ? "bg-accent" : "bg-rule",
        )}
      />
      {active
        ? `Sesi ${sessionLabel(active.type).toLowerCase()} aktif`
        : "Di luar jam operasional"}
    </span>
  );
}
