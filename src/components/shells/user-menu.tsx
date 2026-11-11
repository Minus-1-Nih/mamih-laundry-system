"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { adminDisplayName, initials, roleLabel } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/cn";

export interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const user = useCurrentUser();
  const logout = useAppStore((state) => state.logout);
  const router = useRouter();

  if (!user) return null;

  const displayName =
    user.role === "admin" ? adminDisplayName(user) : user.name;

  const homeHref =
    user.role === "admin"
      ? "/admin"
      : user.role === "driver"
        ? "/driver"
        : "/akun/riwayat";

  const logoutHref =
    user.role === "admin"
      ? "/masuk/admin"
      : user.role === "driver"
        ? "/masuk/driver"
        : "/masuk";

  function handleLogout() {
    logout();
    router.push(logoutHref);
  }

  return (
    <details className={cn("group relative", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-pill p-1 pr-2 transition-colors hover:bg-secondary [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-13 font-semibold text-primary">
          {initials(displayName)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-medium leading-tight text-ink">
            {displayName}
          </span>
          <span className="block text-13 leading-tight text-muted">
            {roleLabel(user)}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-ink">{displayName}</p>
          <p className="text-13 text-muted">{user.email}</p>
          <p className="mt-1 text-13 font-medium text-primary">
            {roleLabel(user)}
          </p>
        </div>
        <Link
          href={homeHref}
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-secondary"
        >
          <LayoutDashboard className="h-4 w-4 text-muted" />
          Dashboard
        </Link>
        {user.role === "admin" && user.adminLevel === "owner" ? (
          <Link
            href="/admin/akun"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-secondary"
          >
            <ShieldCheck className="h-4 w-4 text-muted" />
            Manajemen akun
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger-fg transition-colors hover:bg-danger-bg"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </details>
  );
}
