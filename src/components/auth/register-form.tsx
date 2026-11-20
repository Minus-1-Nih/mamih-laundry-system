"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatPhone, isValidPhone } from "@/lib/format";
import {
  passwordRules,
  sanitizeNameInput,
  validateFullName,
  validatePassword,
} from "@/lib/register-validation";
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
  const rules = passwordRules(password);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nameError = validateFullName(name);
    if (nameError) {
      setError(nameError);
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
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
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
          className="flex items-start gap-2 border border-danger-fg bg-danger-bg px-3 py-2.5 text-sm text-danger-fg"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Field label="Nama lengkap" htmlFor="name" hint="Hanya huruf, tanpa angka.">
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(sanitizeNameInput(event.target.value))}
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
            placeholder="Huruf, angka, dan simbol"
            aria-describedby="password-rules"
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
        <ul id="password-rules" className="mt-2 space-y-1 text-13">
          {[
            [rules.length, "Minimal 6 karakter"],
            [rules.letter, "Mengandung huruf"],
            [rules.digit, "Mengandung angka"],
            [rules.symbol, "Mengandung simbol, misalnya ! @ # ."],
          ].map(([met, label]) => (
            <li
              key={label as string}
              className={`flex items-center gap-1.5 ${met ? "text-accent" : "text-muted"}`}
            >
              {met ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <X className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{label as string}</span>
              <span className="sr-only">{met ? "terpenuhi" : "belum terpenuhi"}</span>
            </li>
          ))}
        </ul>
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

      <Button type="submit" size="lg" className="w-full">
        Daftar
      </Button>

      <p className="text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
        >
          Masuk
        </Link>
      </p>

      <div className="border border-rule bg-paper-2 px-4 py-3.5">
        <p className="text-13 text-muted">
          Akun Admin dan Driver dibuat oleh Owner. Pendaftaran ini khusus untuk
          akun Pelanggan.
        </p>
      </div>
    </form>
  );
}
