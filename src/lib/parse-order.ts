import {
  formatPhone,
  isValidPhone,
  normalizePhone,
  parseScheduleTime,
} from "@/lib/format";
import type { Order, SessionType, ZoneId } from "@/lib/types";

export interface ParsedOrder {
  customerName: string;
  phone: string;
  service: string;
  zoneId: ZoneId | "";
  landmark: string;
  session: SessionType | "";
  schedule: string;
  note: string;
}

export interface ParseResult {
  data: ParsedOrder;
  errors: Partial<Record<keyof ParsedOrder, string>>;
  recognized: number;
  ok: boolean;
}

export const parsedFieldLabels: Record<keyof ParsedOrder, string> = {
  customerName: "Nama pelanggan",
  phone: "Nomor HP",
  service: "Jenis layanan",
  zoneId: "Zona",
  landmark: "Patokan alamat",
  session: "Sesi",
  schedule: "Jadwal",
  note: "Catatan",
};

export const sampleOrderMessage = `PESANAN LAUNDRY
Nama: Sari Wulandari
No HP: 0857-3344-9901
Layanan: Cuci Kering Setrika
Zona: Z2
Patokan: Kos Melati, Jl. Sukapura No. 18
Sesi: Penjemputan
Jadwal: 4 Nov, 14:00
Catatan: Pisahkan pakaian putih`;

const aliases: Record<string, keyof ParsedOrder> = {
  nama: "customerName",
  "nama pelanggan": "customerName",
  "no hp": "phone",
  "nomor hp": "phone",
  hp: "phone",
  whatsapp: "phone",
  wa: "phone",
  "no whatsapp": "phone",
  layanan: "service",
  "jenis layanan": "service",
  zona: "zoneId",
  zone: "zoneId",
  patokan: "landmark",
  "patokan alamat": "landmark",
  alamat: "landmark",
  sesi: "session",
  jadwal: "schedule",
  waktu: "schedule",
  catatan: "note",
  note: "note",
};

function clean(value: string): string {
  return value
    .replace(/^[*_~]+|[*_~]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseZone(value: string): ZoneId | "" {
  const upper = value.toUpperCase();
  const code = /\bZ\s*([123])\b/.exec(upper);
  if (code) return `Z${code[1]}` as ZoneId;
  if (/SUKABIRUS/.test(upper)) return "Z1";
  if (/SUKAPURA/.test(upper)) return "Z2";
  if (/CIGANITRI/.test(upper)) return "Z3";
  return "";
}

function parseSession(value: string): SessionType | "" {
  const lower = value.toLowerCase();
  if (/penjemputan|pickup|jemput/.test(lower)) return "pickup";
  if (/pengantaran|delivery|antar/.test(lower)) return "delivery";
  return "";
}

function parsePhone(value: string): string {
  const digits = normalizePhone(value);
  if (!digits) return "";
  const local = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return formatPhone(local);
}

export function parseOrderMessage(text: string): ParseResult {
  const data: ParsedOrder = {
    customerName: "",
    phone: "",
    service: "",
    zoneId: "",
    landmark: "",
    session: "",
    schedule: "",
    note: "",
  };

  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([^:]+?)\s*:\s*(.*)$/.exec(line);
    if (!match) continue;

    const key = match[1]
      .replace(/[*_~]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const field = aliases[key];
    if (!field) continue;

    const value = clean(match[2]);
    if (!value) continue;

    if (field === "zoneId") {
      data.zoneId = parseZone(value);
    } else if (field === "session") {
      data.session = parseSession(value);
    } else if (field === "schedule") {
      data.schedule = parseScheduleTime(value) ?? "";
    } else if (field === "phone") {
      data.phone = parsePhone(value);
    } else {
      data[field] = value;
    }
  }

  const errors = validateParsedOrder(data);
  const recognized = Object.values(data).filter(Boolean).length;

  return {
    data,
    errors,
    recognized,
    ok: Object.keys(errors).length === 0,
  };
}

export function validateParsedOrder(
  data: ParsedOrder,
): ParseResult["errors"] {
  const errors: ParseResult["errors"] = {};
  const required: (keyof ParsedOrder)[] = [
    "customerName",
    "phone",
    "service",
    "zoneId",
    "landmark",
    "session",
    "schedule",
  ];

  for (const field of required) {
    if (!data[field]) {
      errors[field] = "Tidak ditemukan di pesan — isi manual.";
    }
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Nomor HP belum valid. Contoh: 0812-3456-7890.";
  }
  if (
    data.customerName &&
    (data.customerName.length < 2 || data.customerName.length > 80)
  ) {
    errors.customerName = "Nama pelanggan perlu 2–80 karakter.";
  }
  if (data.landmark && data.landmark.length < 5) {
    errors.landmark = "Patokan alamat terlalu singkat.";
  }

  return errors;
}

export function orderWhatsAppMessage(order: Order): string {
  return [
    "PESANAN LAUNDRIA",
    `Kode: ${order.code}`,
    `Nama: ${order.customerName}`,
    `No HP: ${order.phone}`,
    `Layanan: ${order.service}`,
    `Zona: ${order.zoneId}`,
    `Patokan: ${order.landmark}`,
    `Sesi: ${order.session === "pickup" ? "Penjemputan" : "Pengantaran"}`,
    `Jadwal: ${order.schedule}`,
    order.note ? `Catatan: ${order.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
