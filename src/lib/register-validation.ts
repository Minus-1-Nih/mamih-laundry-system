// Aturan isian pendaftaran pelanggan. Dipakai form dan store agar sama persis.

// Huruf (termasuk huruf beraksen), spasi, titik, apostrof, dan tanda hubung
// untuk nama seperti "Muh. Rizky" atau "Nur'aini". Angka dan simbol lain ditolak.
const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;

/** Membuang karakter yang tidak boleh ada di nama saat pengguna mengetik. */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^\p{L} .'-]/gu, "");
}

export function validateFullName(name: string): string | null {
  const clean = name.trim();
  if (clean.length < 2) return "Nama lengkap wajib diisi.";
  if (!NAME_PATTERN.test(clean)) {
    return "Nama lengkap hanya boleh berisi huruf.";
  }
  return null;
}

export const PASSWORD_MIN = 6;

export interface PasswordRules {
  length: boolean;
  letter: boolean;
  digit: boolean;
  symbol: boolean;
}

export function passwordRules(password: string): PasswordRules {
  return {
    length: password.length >= PASSWORD_MIN,
    letter: /\p{L}/u.test(password),
    digit: /\d/.test(password),
    symbol: /[^\p{L}\d\s]/u.test(password),
  };
}

export function validatePassword(password: string): string | null {
  const rules = passwordRules(password);
  if (!rules.length) return `Kata sandi minimal ${PASSWORD_MIN} karakter.`;
  if (!rules.letter || !rules.digit || !rules.symbol) {
    return "Kata sandi harus berisi huruf, angka, dan simbol.";
  }
  return null;
}
