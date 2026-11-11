import { AuthShell } from "@/components/shells/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function MasukDriverPage() {
  return (
    <AuthShell
      mode="driver"
      title="Masuk sebagai Driver."
      subtitle="Lihat tugas penjemputan dan pengantaran untuk zona Anda."
    >
      <LoginForm mode="driver" />
    </AuthShell>
  );
}
