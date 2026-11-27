// Verifikasi pelanggan yang lupa kata sandi. Prototipe tanpa email/OTP:
// pemilik akun membuktikan diri dengan email + nomor WhatsApp terdaftar.

import type { User } from "@/lib/types";

/** Hanya digit, dengan awalan 62 diseragamkan menjadi 0. */
export function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
}

export function findCustomerForReset(
  users: User[],
  email: string,
  phone: string,
): { ok: true; user: User } | { ok: false; error: string } {
  const needle = email.trim().toLowerCase();
  const user = users.find(
    (candidate) =>
      candidate.role === "customer" && candidate.email.toLowerCase() === needle,
  );
  if (!user || phoneDigits(user.phone) !== phoneDigits(phone)) {
    return {
      ok: false,
      error: "Email dan nomor WhatsApp tidak cocok dengan akun pelanggan mana pun.",
    };
  }
  if (!user.active) {
    return { ok: false, error: "Akun ini sedang nonaktif. Hubungi Admin." };
  }
  return { ok: true, user };
}
