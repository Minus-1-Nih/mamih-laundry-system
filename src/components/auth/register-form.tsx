"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatPhone, isValidPhone } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function RegisterForm() {
  const router = useRouter();
  const registerCustomer = useAppStore((state) => state.registerCustomer);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email belum tepat.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Nomor WhatsApp belum tepat. Contoh: 0812-3456-7890.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }

    const result = registerCustomer({
      name,
      email,
      phone: formatPhone(phone),
      password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({ title: "Akun berhasil dibuat. Selamat datang di Laundria." });
    router.push("/akun/riwayat");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2.5 text-sm text-danger-fg"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Field label="Nama lengkap" htmlFor="name">
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama sesuai panggilan"
          required
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@email.com"
          required
        />
      </Field>

      <Field
        label="Nomor WhatsApp"
        htmlFor="phone"
        hint="Dipakai driver untuk menghubungi Anda saat penjemputan."
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="0812-3456-7890"
          required
        />
      </Field>

      <Field label="Kata sandi" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pr-11"
            placeholder="Minimal 6 karakter"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      <Field label="Konfirmasi kata sandi" htmlFor="confirm">
        <Input
          id="confirm"
          name="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Ulangi kata sandi"
          required
        />
      </Field>

      <Button type="submit" className="w-full">
        Daftar
      </Button>

      <p className="text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Masuk
        </Link>
      </p>

      <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
        <p className="text-13 text-muted">
          Akun Admin dan Driver dibuat oleh Owner. Pendaftaran ini khusus untuk
          akun Pelanggan.
        </p>
      </div>
    </form>
  );
}
