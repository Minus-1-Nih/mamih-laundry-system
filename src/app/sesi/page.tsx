import { SessionClient } from "@/components/customer/session-client";
import { PublicShell } from "@/components/shells/public-shell";

export default function SessionPage() {
  return (
    <PublicShell>
      <SessionClient />
    </PublicShell>
  );
}
