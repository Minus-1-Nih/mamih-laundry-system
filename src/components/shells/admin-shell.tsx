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
    <nav aria-label="Navigasi admin" className="flex flex-col gap-0.5">
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
                "flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-[background-color,color] duration-[var(--dur-micro)]",
                active
                  ? "bg-accent text-accent-ink"
                  : "text-ink-2 hover:bg-paper hover:text-ink",
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
    <div className="mt-8 border border-rule bg-paper p-4">
      <p className="small-print text-muted">Cakupan layanan</p>
      <ul className="mt-2">
        {zones.map((zone) => (
          <li
            key={zone.id}
            className="flex items-baseline gap-2 border-b border-rule py-1.5 last:border-0"
          >
            <span className="small-print w-6 shrink-0 text-muted">{zone.id}</span>
            <span className="text-13 leading-snug text-ink">{zone.name}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 border-t border-rule pt-3 text-13 font-medium text-accent">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
        {onlineDrivers} driver sedang online
      </p>
    </div>
  );
}

function SettingsLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin/pengaturan"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-sm font-medium text-ink-2 transition-[background-color,color] duration-[var(--dur-micro)] hover:bg-paper hover:text-ink"
    >
      <Settings className="h-4 w-4 shrink-0" />
      Pengaturan
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-rule bg-paper-2 px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand href="/admin" subtitle="by Mamih Laundry" />
        </div>
        <p className="small-print mt-9 px-3 text-muted">Operasional</p>
        <div className="mt-2">
          <NavLinks />
        </div>
        <CoverageCard />
        <div className="mt-auto border-t border-rule pt-3">
          <SettingsLink />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-[var(--z-sticky-nav)] flex items-center justify-between gap-3 border-b border-rule bg-paper px-4 py-3 lg:hidden">
          <Brand href="/admin" compact />
          <details className="group relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-pill border border-rule px-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              Menu
              <ChevronDown className="h-4 w-4 text-muted transition-transform duration-[var(--dur-short)] group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-64 border-2 border-ink bg-paper p-2 shadow-[6px_6px_0_var(--color-paper-3)]">
              <NavLinks />
              <div className="mt-2 border-t border-rule pt-2">
                <SettingsLink />
              </div>
            </div>
          </details>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-5 py-6 lg:px-10 lg:py-10">
          <div className="mb-4 flex justify-end lg:hidden">
            <UserMenu />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
