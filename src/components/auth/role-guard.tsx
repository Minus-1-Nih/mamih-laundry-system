"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { AdminLevel, Role } from "@/lib/types";

export interface RoleGuardProps {
  role: Role;
  adminLevel?: AdminLevel;
  children: ReactNode;
}

function loginPath(role: Role): string {
  if (role === "admin") return "/masuk/admin";
  if (role === "driver") return "/masuk/driver";
  return "/masuk";
}

export function RoleGuard({ role, adminLevel, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppStore((state) => state.hydrated);
  const users = useAppStore((state) => state.users);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const user = users.find((item) => item.id === currentUserId);

  const authorized =
    hydrated &&
    Boolean(user) &&
    user?.role === role &&
    (!adminLevel || user?.adminLevel === adminLevel);

  useEffect(() => {
    if (!hydrated) return;

    if (!user || user.role !== role) {
      router.replace(
        `${loginPath(role)}?next=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (adminLevel && user.adminLevel !== adminLevel) {
      router.replace("/admin");
    }
  }, [hydrated, user, role, adminLevel, router, pathname]);

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm">Memeriksa akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
