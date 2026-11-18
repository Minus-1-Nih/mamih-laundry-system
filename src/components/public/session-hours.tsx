"use client";

import { serviceHours, sessionFor, sessionSpan } from "@/lib/sessions";
import { useAppStore } from "@/lib/store";
import type { SessionType } from "@/lib/types";

/**
 * The public landing page is server-rendered, but the store lives in the
 * browser. These small client islands read the same session config the admin
 * edits in `/admin/pengaturan`, so the advertised hours cannot drift.
 */

export function ServiceHoursText({ withWib = true }: { withWib?: boolean }) {
  const sessions = useAppStore((state) => state.sessions);
  const hours = serviceHours(sessions);
  return <>{withWib ? hours : hours.replace(" WIB", "")}</>;
}

export function SessionWindowText({
  type,
  withWib = false,
}: {
  type: SessionType;
  withWib?: boolean;
}) {
  const sessions = useAppStore((state) => state.sessions);
  const session = sessionFor(type, sessions);
  if (!session) return <>-</>;
  return (
    <>
      {sessionSpan(session)}
      {withWib ? " WIB" : ""}
    </>
  );
}
