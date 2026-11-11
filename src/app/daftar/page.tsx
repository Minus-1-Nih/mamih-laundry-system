import { AuthShell } from "@/components/shells/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function DaftarPage() {
  return (
    <AuthShell
      mode="customer"
      title="Buat akun Laundria."
      subtitle="Daftar untuk melihat riwayat, alamat, dan status cucian Anda."
    >
      <RegisterForm />
    </AuthShell>
  );
}
