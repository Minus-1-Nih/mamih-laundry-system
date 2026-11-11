import type { ReactNode } from "react";
import { SessionPill } from "@/components/shells/session-pill";
import { UserMenu } from "@/components/shells/user-menu";

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {action}
        <SessionPill />
        <div className="hidden lg:block">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
