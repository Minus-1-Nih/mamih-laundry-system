"use client";

import { useAppStore } from "@/lib/store";
import { sessionLabel } from "@/lib/format";

export function SessionPill() {
  const sessions = useAppStore((state) => state.sessions);
  const active = sessions.find((session) => session.open);

  return (
    <span className="inline-flex items-center rounded-pill bg-secondary px-3 py-1.5 text-13 font-medium text-primary">
      {active
        ? `Sesi ${sessionLabel(active.type).toLowerCase()} aktif`
        : "Di luar jam operasional"}
    </span>
  );
}
