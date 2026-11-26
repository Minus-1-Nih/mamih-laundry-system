import { AuthShell } from "@/components/shells/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function LupaPasswordPage() {
  return (
    <AuthShell
      mode="customer"
      title="Lupa password?"
      subtitle="Masukkan email dan nomor WhatsApp akun Anda, lalu buat kata sandi baru."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
