export type AuthLoginMode = "customer" | "admin" | "owner" | "driver";

export type PasswordResetHelp =
  | {
      channel: "whatsapp";
      heading: string;
      body: string;
      cta: string;
    }
  | {
      channel: "local";
      heading: string;
      body: string;
    };

export function passwordResetHelp(mode: AuthLoginMode): PasswordResetHelp {
  if (mode === "owner") {
    return {
      channel: "local",
      heading: "Owner tidak mereset kata sandi lewat WhatsApp.",
      body: "Gunakan perangkat yang masih masuk, lalu buka Manajemen akun. Jika tidak ada sesi aktif, kembalikan data demo dari peramban.",
    };
  }

  if (mode === "customer") {
    return {
      channel: "whatsapp",
      heading: "Reset kata sandi melalui Admin.",
      body: "Admin akan memverifikasi bahwa Anda pemilik akun, lalu membantu membuat kata sandi baru.",
      cta: "Hubungi Admin",
    };
  }

  return {
    channel: "whatsapp",
    heading: "Reset kata sandi melalui Owner.",
    body: "Owner akan memverifikasi identitas Anda, lalu mengatur kata sandi baru dari Manajemen akun.",
    cta: "Hubungi Owner",
  };
}

export function passwordResetMessage(
  mode: Exclude<AuthLoginMode, "owner">,
  identifier?: string,
): string {
  const account = identifier?.trim();
  const greeting =
    mode === "customer"
      ? "Halo Admin Mamih Laundry, saya ingin meminta bantuan untuk reset kata sandi akun pelanggan saya."
      : `Halo Owner Laundria, saya ingin meminta bantuan untuk reset kata sandi akun ${mode === "admin" ? "Admin" : "Driver"} saya.`;

  return account ? `${greeting}\nAkun: ${account}` : greeting;
}
