export const WHATSAPP_NUMBER = "6281234567890";
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;
export const STORE_NAME = "Laundria Sukabirus";
export const SERVICE_HOURS = "12.00-22.00 WIB";

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
