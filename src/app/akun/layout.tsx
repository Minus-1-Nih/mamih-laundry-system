import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { PublicShell } from "@/components/shells/public-shell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="customer">
      <PublicShell>{children}</PublicShell>
    </RoleGuard>
  );
}
