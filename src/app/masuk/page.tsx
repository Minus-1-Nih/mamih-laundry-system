import { AuthShell } from "@/components/shells/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function MasukPage() {
  return (
    <AuthShell
      mode="customer"
      title="Senang melihat Anda lagi."
      subtitle="Masuk untuk melihat riwayat pesanan dan mengelola alamat penjemputan Anda."
    >
      <LoginForm mode="customer" />
    </AuthShell>
  );
}
