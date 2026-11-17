import { DEMO_NOW } from "@/lib/demo-date";
import {
  addDaysToKey,
  formatPhone,
  isValidPhone,
  normalizePhone,
  parseScheduleTime,
  timeToMinutes,
  todayKey,
} from "@/lib/format";
import {
  findServiceByLabel,
  matchService,
  matchTier,
} from "@/lib/service-catalog";
import type { ServiceTier, SessionType, ZoneId } from "@/lib/types";

export interface ParsedOrder {
  customerName: string;
  phone: string;
  service: string;
  tier: ServiceTier | "";
  zoneId: ZoneId | "";
  landmark: string;
  session: SessionType | "";
  schedule: string;
  /** YYYY-MM-DD, defaulted to today. */
  scheduleDate: string;
  note: string;
}

export interface ValidationResult {
  errors: Partial<Record<keyof ParsedOrder, string>>;
  warnings: Partial<Record<keyof ParsedOrder, string>>;
}

export interface ParseResult extends ValidationResult {
  data: ParsedOrder;
  inferred: (keyof ParsedOrder)[];
  unknownLines: string[];
  requiredFound: number;
  formError?: string;
  ok: boolean;
}

export const requiredFields = [
  "customerName",
  "phone",
  "service",
  "zoneId",
  "landmark",
  "session",
  "schedule",
] as const satisfies readonly (keyof ParsedOrder)[];

export const parsedFieldLabels: Record<keyof ParsedOrder, string> = {
  customerName: "Nama pelanggan",
  phone: "Nomor HP",
  service: "Jenis layanan",
  tier: "Paket",
  zoneId: "Zona",
  landmark: "Patokan alamat",
  session: "Sesi",
  schedule: "Jadwal",
  scheduleDate: "Tanggal jadwal",
  note: "Catatan",
};

export const sampleOrderMessage = `PESANAN LAUNDRY
Nama: Sari Wulandari
No HP: 0857-3344-9901
Layanan: Cuci Kering Setrika
Paket: Reguler
Zona: Z2
Patokan: Kos Melati, Jl. Sukapura No. 18
Sesi: Penjemputan
Jadwal: 4 Nov, 14:00
Catatan: Pisahkan pakaian putih`;

const aliases: Record<string, keyof ParsedOrder> = {
  nama: "customerName",
  "nama pelanggan": "customerName",
  "no hp": "phone",
  "no. hp": "phone",
  "nomor hp": "phone",
  hp: "phone",
  whatsapp: "phone",
  wa: "phone",
  "no whatsapp": "phone",
  "no. whatsapp": "phone",
  layanan: "service",
  service: "service",
  "jenis layanan": "service",
  paket: "tier",
  tier: "tier",
  pilihan: "tier",
  zona: "zoneId",
  zone: "zoneId",
  patokan: "landmark",
  "patokan alamat": "landmark",
  alamat: "landmark",
  "alamat/patokan": "landmark",
  "alamat patokan": "landmark",
  sesi: "session",
  "sesi layanan": "session",
  jadwal: "schedule",
  waktu: "schedule",
  tanggal: "schedule",
  catatan: "note",
  keterangan: "note",
  note: "note",
};

const MONTHS: Record<string, number> = {
  jan: 1,
  januari: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agt: 8,
  agustus: 8,
  aug: 8,
  sep: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  oct: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
  dec: 12,
};

const sessionWindows: Record<
  SessionType,
  { start: number; end: number; label: string }
> = {
  pickup: { start: 12 * 60, end: 17 * 60, label: "penjemputan (12.00–17.00)" },
  delivery: { start: 17 * 60, end: 22 * 60, label: "pengantaran (17.00–22.00)" },
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function clean(value: string): string {
  return value
    .replace(/^[*_~]+|[*_~]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLine(line: string): string {
  return line
    .replace(/^\s*>\s?/, "")
    .replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "")
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

function makeDateKey(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Pull a date out of a Jadwal value. Returns null when only a time is given. */
function extractDate(
  text: string,
  today: string,
): { key: string; fromMessage: boolean } | null {
  const lower = text.toLowerCase();

  if (/\b(hari ini|today)\b/.test(lower)) {
    return { key: today, fromMessage: true };
  }
  if (/\b(besok|esok|tomorrow)\b/.test(lower)) {
    return { key: addDaysToKey(today, 1), fromMessage: true };
  }
  if (/\blusa\b/.test(lower)) {
    return { key: addDaysToKey(today, 2), fromMessage: true };
  }

  const currentYear = Number(today.slice(0, 4));

  const numeric = /\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/.exec(lower);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    let year = numeric[3] ? Number(numeric[3]) : currentYear;
    if (numeric[3] && year < 100) year += 2000;
    const key = makeDateKey(year, month, day);
    if (key) return { key, fromMessage: true };
  }

  const named = /\b(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?\b/.exec(lower);
  if (named) {
    const day = Number(named[1]);
    const month = MONTHS[named[2]];
    if (month) {
      const year = named[3] ? Number(named[3]) : currentYear;
      const key = makeDateKey(year, month, day);
      if (key) return { key, fromMessage: true };
    }
  }

  return null;
}

function parseScheduleValue(
  value: string,
  today: string,
): { time: string; date: string; fromMessage: boolean } | null {
  // Prefer hh:mm so "4.11" is not mistaken for a time.
  const timeMatch = /(\d{1,2}):(\d{2})/.exec(value) ?? /(\d{1,2})\.(\d{2})/.exec(value);
  if (!timeMatch) return null;
  const time = parseScheduleTime(timeMatch[0]);
  if (!time) return null;

  const date = extractDate(value, today);
  return {
    time,
    date: date?.key ?? today,
    fromMessage: Boolean(date),
  };
}

export interface ValidationOptions {
  today?: Date;
}

/** Service is a select, so a value that is not a catalogue label is unresolved. */
export function validateParsedOrder(
  data: ParsedOrder,
  options: ValidationOptions = {},
): ValidationResult {
  const errors: ValidationResult["errors"] = {};
  const warnings: ValidationResult["warnings"] = {};

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = "Tidak ditemukan di pesan, isi manual.";
    }
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Nomor HP belum valid. Contoh: 0812-3456-7890.";
  }
  if (
    data.customerName &&
    (data.customerName.length < 2 || data.customerName.length > 80)
  ) {
    errors.customerName = "Nama pelanggan perlu 2-80 karakter.";
  }
  if (data.landmark && data.landmark.length < 5) {
    errors.landmark = "Patokan alamat terlalu singkat.";
  }
  if (data.service && !findServiceByLabel(data.service)) {
    errors.service = "Layanan belum dikenali. Pilih dari daftar.";
  }

  const now = options.today ?? DEMO_NOW;

  if (data.schedule && data.scheduleDate) {
    const at = Date.parse(
      `${data.scheduleDate}T${data.schedule.replace(".", ":")}:00+07:00`,
    );
    if (Number.isFinite(at) && at < now.getTime()) {
      errors.schedule = "Waktu jadwal sudah lewat. Pilih waktu berikutnya.";
    }
  }

  if (data.session && data.schedule && !errors.schedule) {
    const window = sessionWindows[data.session];
    const minutes = timeToMinutes(data.schedule);
    if (minutes < window.start || minutes >= window.end) {
      warnings.schedule = `Di luar sesi ${window.label}. Tetap simpan?`;
    }
  }

  return { errors, warnings };
}

export function countRequired(data: ParsedOrder): number {
  return requiredFields.filter((field) => Boolean(data[field])).length;
}

export function parseOrderMessage(
  text: string,
  options: { today?: Date } = {},
): ParseResult {
  const today = options.today ?? DEMO_NOW;
  const todayIso = todayKey(today);
  const raw: Partial<Record<keyof ParsedOrder, string>> = {};
  const unknownLines: string[] = [];
  let labelCount = 0;

  for (const line of text.split(/\r?\n/)) {
    const stripped = stripLine(line);
    if (!stripped) continue;

    const normalizedLine = stripped.replace(/：/g, ":");
    const match = /^([^:]+?)\s*:\s*(.*)$/.exec(normalizedLine);

    if (!match) {
      if (!/^pesanan\s+(laundry|laundria)$/i.test(stripped)) {
        unknownLines.push(stripped);
      }
      continue;
    }

    const key = match[1]
      .replace(/[*_~]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const field = aliases[key];
    if (!field) {
      unknownLines.push(stripped);
      continue;
    }

    labelCount += 1;
    const value = clean(match[2]);
    if (!value) continue;
    raw[field] = value;
  }

  const data: ParsedOrder = {
    customerName: raw.customerName ?? "",
    phone: raw.phone ? parsePhone(raw.phone) : "",
    service: "",
    tier: "",
    zoneId: raw.zoneId ? parseZone(raw.zoneId) : "",
    landmark: raw.landmark ?? "",
    session: raw.session ? parseSession(raw.session) : "",
    schedule: "",
    scheduleDate: todayIso,
    note: raw.note ?? "",
  };

  const inferred: (keyof ParsedOrder)[] = [];

  if (raw.service) {
    const match = matchService(raw.service);
    data.service = match ? match.service.label : clean(raw.service);
  }

  const tier = (raw.tier ? matchTier(raw.tier) : null) ??
    (raw.service ? matchTier(raw.service) : null);
  const service = findServiceByLabel(data.service);

  if (service?.tiered) {
    if (tier) {
      data.tier = tier;
    } else {
      data.tier = "reguler";
      inferred.push("tier");
    }
  } else if (tier) {
    data.tier = tier;
  }

  if (raw.schedule) {
    const parsedSchedule = parseScheduleValue(raw.schedule, todayIso);
    if (parsedSchedule) {
      data.schedule = parsedSchedule.time;
      data.scheduleDate = parsedSchedule.date;
      if (!parsedSchedule.fromMessage) inferred.push("scheduleDate");
    }
  } else {
    inferred.push("scheduleDate");
  }

  const validation = validateParsedOrder(data, { today });
  const formError =
    labelCount < 2
      ? "Pesan tidak mengikuti template. Pastikan minimal Nama dan No HP ada."
      : undefined;

  return {
    data,
    ...validation,
    inferred,
    unknownLines,
    requiredFound: countRequired(data),
    formError,
    ok: Object.keys(validation.errors).length === 0 && !formError,
  };
}
