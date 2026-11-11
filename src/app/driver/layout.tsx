import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DriverShell } from "@/components/shells/driver-shell";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <DriverShell>
      <RoleGuard role="driver">{children}</RoleGuard>
    </DriverShell>
  );
}
