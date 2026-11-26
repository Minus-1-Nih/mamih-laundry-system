"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Box,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AuthMode } from "@/components/shells/auth-shell";
import {
  passwordResetHelp,
  passwordResetMessage,
} from "@/lib/auth-messages";
import { whatsappLink } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import type { AdminLevel, Role } from "@/lib/types";

export interface LoginFormProps {
  mode: AuthMode;
  next?: string;
}

const roleLinks: { mode: AuthMode; label: string; href: string }[] = [
  { mode: "customer", label: "Pelanggan", href: "/masuk" },
  { mode: "admin", label: "Admin", href: "/masuk/admin" },
  { mode: "owner", label: "Owner", href: "/masuk/owner" },
  { mode: "driver", label: "Driver", href: "/masuk/driver" },
];

function destination(mode: AuthMode, next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  if (mode === "driver") return "/driver";
  if (mode === "customer") return "/akun/riwayat";
  return "/admin";
}

export function LoginForm({ mode, next }: LoginFormProps) {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const forgotHelp = passwordResetHelp(mode);

  const expectedRole: Role =
    mode === "customer" ? "customer" : mode === "driver" ? "driver" : "admin";
  const expectedLevel: AdminLevel | undefined =
    mode === "owner" ? "owner" : mode === "admin" ? "store" : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = login({
      identifier,
      password,
      expectedRole,
      expectedLevel,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({ title: `Selamat datang, ${result.user.name}.` });
    const queryNext =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next") ?? undefined
        : undefined;
    router.push(destination(mode, next ?? queryNext));
  }

  function handleForgot() {
    setShowForgot((open) => !open);
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

      <Field
        label={mode === "customer" ? "Email atau nama pengguna" : "Username"}
        htmlFor="identifier"
      >
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder={
            mode === "customer" ? "nama@email.com" : "username"
          }
          required
          aria-invalid={error ? true : undefined}
        />
      </Field>

      <Field label="Kata sandi" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pr-11"
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

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 border-muted accent-accent"
          />
          Ingat saya
        </label>
        {mode === "customer" ? (
          <Link
            href="/lupa-password"
            className="-my-3 inline-flex min-h-11 items-center font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
          >
            Lupa password?
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleForgot}
            aria-expanded={showForgot}
            aria-controls="forgot-help"
            className="-my-3 inline-flex min-h-11 items-center font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
          >
            Lupa kata sandi?
          </button>
        )}
      </div>

      {showForgot && mode !== "customer" ? (
        <div
          id="forgot-help"
          className="space-y-3 border border-rule bg-paper-2 px-4 py-3.5"
        >
          <p className="text-sm font-medium text-ink">{forgotHelp.heading}</p>
          <p className="text-13 leading-relaxed text-muted">{forgotHelp.body}</p>
          {forgotHelp.channel === "whatsapp" && mode !== "owner" ? (
            <a
              href={whatsappLink(passwordResetMessage(mode, identifier))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-control border border-ink bg-transparent px-3.5 text-sm font-medium text-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:bg-paper"
            >
              {forgotHelp.cta}
            </a>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="w-full">
        Masuk
      </Button>

      {mode === "customer" ? (
        <>
          <p className="text-center text-sm text-muted">
            Belum memiliki akun?{" "}
            <Link
              href="/daftar"
              className="font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Daftar sekarang
            </Link>
          </p>

          <Link
            href="/tracking"
            className="flex items-center gap-3 border border-rule bg-paper-2 px-4 py-3.5 transition-colors duration-[var(--dur-micro)] hover:border-accent"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-accent-ink">
              <Box className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">
                Ingin memeriksa status cucian?
              </span>
              <span className="block text-13 text-muted">
                Lacak pesanan tanpa masuk akun
              </span>
            </span>
          </Link>
        </>
      ) : (
        <div className="border border-rule bg-paper-2 px-4 py-3.5">
          <p className="text-13 text-muted">
            Akun Admin dan Driver dibuat oleh Owner. Akun Pelanggan dibuat
            melalui pendaftaran mandiri.
          </p>
        </div>
      )}

      <div className="border-t border-rule pt-4">
        <p className="text-13 text-muted">
          Masuk sebagai{" "}
          {roleLinks.map((role, index) => (
            <span key={role.mode}>
              {index > 0 ? ", " : ""}
              <Link
                href={role.href}
                className={
                  role.mode === mode
                    ? "font-medium text-accent"
                    : "hover:text-ink"
                }
              >
                {role.label}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </form>
  );
}
