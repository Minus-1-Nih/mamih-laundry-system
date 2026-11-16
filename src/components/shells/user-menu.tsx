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
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-control border border-transparent py-1.5 pl-3.5 pr-3.5 transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-rule hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 items-center justify-center border border-rule bg-accent-soft text-13 font-semibold text-accent">
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
        <ChevronDown className="h-4 w-4 text-muted transition-transform duration-[var(--dur-short)] group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-64 border-2 border-ink bg-paper p-1.5 shadow-[6px_6px_0_var(--color-paper-3)]">
        <div className="border-b border-rule px-3.5 py-2.5">
          <p className="text-sm font-medium text-ink">{displayName}</p>
          <p className="text-13 text-muted">{user.email}</p>
          <p className="mt-1 text-13 font-medium text-accent">
            {roleLabel(user)}
          </p>
        </div>
        <Link
          href={homeHref}
          className="mt-1 flex items-center gap-2 px-3.5 py-2 text-sm text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
        >
          <LayoutDashboard className="h-4 w-4 text-muted" />
          Dashboard
        </Link>
        {user.role === "admin" && user.adminLevel === "owner" ? (
          <Link
            href="/admin/akun"
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
          >
            <ShieldCheck className="h-4 w-4 text-muted" />
            Manajemen akun
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-danger-fg transition-colors duration-[var(--dur-micro)] hover:bg-danger-bg"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </details>
  );
}
