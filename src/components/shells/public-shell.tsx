"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteFooter } from "@/components/shells/site-footer";
import { UserMenu } from "@/components/shells/user-menu";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/store";

interface NavLink {
  label: string;
  href: string;
  match: string;
}

function navFor(customer: boolean): NavLink[] {
  return [
    customer
      ? { label: "Riwayat Pesanan", href: "/akun/riwayat", match: "/akun/riwayat" }
      : { label: "Lacak Pesanan", href: "/tracking", match: "/tracking" },
    { label: "Lokasi dan Alamat", href: "/lokasi", match: "/lokasi" },
    { label: "Sesi Operasional", href: "/sesi", match: "/sesi" },
  ];
}

function NavItems({
  customer,
  onNavigate,
  vertical = false,
}: {
  customer: boolean;
  onNavigate?: () => void;
  vertical?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {navFor(customer).map((item) => {
        const active =
          pathname === item.match || pathname.startsWith(`${item.match}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              vertical
                ? "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                : "relative flex items-center py-7 text-sm font-medium transition-colors",
              active
                ? vertical
                  ? "bg-secondary text-primary"
                  : "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
                : "text-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export interface PublicShellProps {
  children: ReactNode;
  mainClassName?: string;
}

export function PublicShell({ children, mainClassName }: PublicShellProps) {
  const user = useCurrentUser();
  const customer = user?.role === "customer";

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-16">
          <Brand href="/public" />

          <nav className="hidden items-center gap-8 md:flex">
            <NavItems customer={customer} />
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  href="/masuk"
                  className="hidden text-sm font-medium text-ink hover:text-primary sm:block"
                >
                  Masuk akun
                </Link>
                <Link
                  href="/daftar"
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Daftar
                </Link>
              </>
            )}

            <details className="relative md:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                Menu
                <ChevronDown className="h-4 w-4 text-muted" />
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-surface p-2 shadow-lg">
                <div className="flex flex-col">
                  <NavItems customer={customer} vertical />
                </div>
                {!user ? (
                  <Link
                    href="/masuk"
                    className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-secondary"
                  >
                    Masuk akun
                  </Link>
                ) : null}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 lg:px-16",
          mainClassName,
        )}
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
