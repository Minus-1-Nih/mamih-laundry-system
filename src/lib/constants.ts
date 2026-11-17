export const WHATSAPP_NUMBER = "6285942570627";
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;
export const STORE_NAME = "Laundria Sukabirus";
export const SERVICE_HOURS = "12.00-22.00 WIB";

/**
 * The prototype is not deployed, so there is no canonical origin to hardcode.
 * The browser's own origin is the real one; this fallback keeps pure tests and
 * any server-side render honest.
 */
export const FALLBACK_APP_URL = "http://localhost:3000";

export function appBaseUrl(): string {
  return typeof window === "undefined"
    ? FALLBACK_APP_URL
    : window.location.origin;
}

/** Absolute public tracking URL for a code, e.g. http://localhost:3000/tracking?kode=Z1-... */
export function trackingUrl(code: string, base: string = appBaseUrl()): string {
  return `${base.replace(/\/+$/, "")}/tracking?kode=${encodeURIComponent(code)}`;
}

export function whatsappLink(message?: string): string {
  return message
    ? `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`
    : WHATSAPP_BASE;
}

export function whatsappLinkTo(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("62")
      ? digits
      : `62${digits}`;
  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
