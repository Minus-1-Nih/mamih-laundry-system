"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { UserMenu } from "@/components/shells/user-menu";
import { cn } from "@/lib/cn";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Zona & Driver", href: "/admin/zona-driver", icon: MapPin, exact: true },
  { label: "Pelanggan", href: "/admin/pelanggan", icon: Users, exact: true },
  { label: "Laporan", href: "/admin/laporan", icon: BarChart3, exact: true },
  { label: "Manajemen akun", href: "/admin/akun", icon: ShieldCheck, exact: true, ownerOnly: true },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <nav className="space-y-1">
      {navItems
        .filter((item) => !item.ownerOnly || user?.adminLevel === "owner")
        .map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted hover:bg-canvas hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

function CoverageCard() {
  const zones = useAppStore((state) => state.zones);
  const users = useAppStore((state) => state.users);
  const onlineDrivers = users.filter(
    (user) => user.role === "driver" && user.active,
  ).length;

  return (
    <div className="mt-6 rounded-xl border border-border bg-canvas p-3.5">
      <p className="text-sm font-semibold text-ink">Cakupan layanan</p>
      <ul className="mt-1.5 space-y-0.5">
        {zones.map((zone) => (
          <li key={zone.id} className="text-13 text-muted">
            {zone.id}, {zone.name}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-13 font-medium text-primary">
        {onlineDrivers} driver sedang online
      </p>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand href="/admin" subtitle="by Mamih Laundry" />
        </div>
        <p className="mt-7 px-3 text-13 text-muted">Operasional</p>
        <div className="mt-2">
          <NavLinks />
        </div>
        <CoverageCard />
        <div className="mt-auto pt-6">
          <Link
            href="/admin/pengaturan"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <Settings className="h-4 w-4" />
            Pengaturan
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Brand href="/admin" compact />
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              Menu
              <ChevronDown className="h-4 w-4 text-muted" />
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-3 shadow-lg">
              <NavLinks />
              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href="/admin/pengaturan"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-canvas hover:text-ink"
                >
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </Link>
              </div>
            </div>
          </details>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex justify-end lg:hidden">
            <UserMenu />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
