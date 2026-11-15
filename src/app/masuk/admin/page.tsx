import { AuthShell } from "@/components/shells/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function MasukAdminPage() {
  return (
    <AuthShell
      mode="admin"
      title="Masuk sebagai Admin."
      subtitle="Akses operasional harian Laundria: pesanan, status, dan driver."
    >
      <LoginForm mode="admin" />
    </AuthShell>
  );
}
