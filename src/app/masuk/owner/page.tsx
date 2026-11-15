import { AuthShell } from "@/components/shells/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function MasukOwnerPage() {
  return (
    <AuthShell
      mode="owner"
      title="Masuk sebagai Owner."
      subtitle="Akses penuh ke seluruh operasional, termasuk manajemen akun."
    >
      <LoginForm mode="owner" />
    </AuthShell>
  );
}
