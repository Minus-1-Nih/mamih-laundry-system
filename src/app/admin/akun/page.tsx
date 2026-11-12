import { AccountsClient } from "@/components/admin/accounts-client";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminAccountsPage() {
  return (
    <RoleGuard role="admin" adminLevel="owner">
      <AccountsClient />
    </RoleGuard>
  );
}
