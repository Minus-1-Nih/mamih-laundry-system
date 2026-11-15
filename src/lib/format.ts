import { DEMO_MINUTES, DEMO_NOW, DEMO_NOW_ISO } from "@/lib/demo-date";
import type { Order, SessionType, User, ZoneId } from "@/lib/types";

const TZ = "Asia/Jakarta";

const shortDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const time = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const number = new Intl.NumberFormat("id-ID");

export function formatDateShort(iso: string): string {
  return shortDate.format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  return longDate.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return time.format(new Date(iso)).replace(":", ".");
}

export function formatTimeWithWib(iso: string): string {
  return `${formatTime(iso)} WIB`;
}

export function formatDateTime(iso: string): string {
  return `${formatDateShort(iso)}, ${formatTime(iso)}`;
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatRupiah(value: number): string {
  return `Rp${formatNumber(value)}`;
}

export function dateKeyWib(iso: string): string {
  return dateKey.format(new Date(iso));
}

export function yymmddWib(date: Date): string {
  return dateKey.format(date).replaceAll("-", "").slice(2);
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return value;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  return /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(normalizePhone(value));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Pelanggan";
  if (parts.length === 1) return `${parts[0]}***`;
  return `${parts[0]} ${parts[1][0]}***`;
}

export function roleLabel(user: User): string {
  if (user.role === "admin") return user.adminLevel === "owner" ? "Owner" : "Admin";
  if (user.role === "driver") return "Driver";
  return "Pelanggan";
}

export function adminDisplayName(user: User): string {
  return `Admin ${user.name}`;
}

export function sessionLabel(session: SessionType): string {
  return session === "pickup" ? "Penjemputan" : "Pengantaran";
}

export function formatOrderCode(zoneId: ZoneId, date: Date, seq: number): string {
  return `${zoneId}-${yymmddWib(date)}-${String(seq).padStart(3, "0")}`;
}

export function parseOrderCode(
  code: string,
): { zoneId: ZoneId; dateKey: string; seq: number } | null {
  const match = /^(Z[123])-(\d{6})-(\d{3})$/.exec(code.trim().toUpperCase());
  if (!match) return null;
  return {
    zoneId: match[1] as ZoneId,
    dateKey: match[2],
    seq: Number(match[3]),
  };
}

export function orderSequence(code: string): number {
  return parseOrderCode(code)?.seq ?? 0;
}

export function nextOrderCode(
  zoneId: ZoneId,
  orders: Order[],
  date: Date = DEMO_NOW,
): string {
  const day = yymmddWib(date);
  const max = orders.reduce((current, order) => {
    const parsed = parseOrderCode(order.code);
    return parsed && parsed.dateKey === day
      ? Math.max(current, parsed.seq)
      : current;
  }, 0);

  return `${zoneId}-${day}-${String(max + 1).padStart(3, "0")}`;
}

export function isToday(iso: string): boolean {
  return dateKeyWib(iso) === dateKeyWib(DEMO_NOW_ISO);
}

function scheduledAt(order: Order): Date {
  const [hour, minute] = order.schedule.replace(".", ":").split(":").map(Number);
  return new Date(
    `${dateKeyWib(order.createdAt)}T${String(hour).padStart(2, "0")}:${String(
      minute ?? 0,
    ).padStart(2, "0")}:00+07:00`,
  );
}

export function isOverdue(order: Order, now: Date = DEMO_NOW): boolean {
  if (order.status !== "menunggu") return false;
  return scheduledAt(order).getTime() < now.getTime();
}

export function overdueHours(order: Order, now: Date = DEMO_NOW): number {
  return Math.max(
    0,
    Math.floor((now.getTime() - scheduledAt(order).getTime()) / 3_600_000),
  );
}

export function estimateTotal(weight: string, service: string): number {
  const kg = Number.parseFloat(weight.replace(",", "."));
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  const rate = /express/i.test(service) ? 16_000 : 10_000;
  return Math.max(25_000, Math.round(kg * rate));
}

export function parseScheduleTime(value: string): string | null {
  const match = /(\d{1,2})[:.](\d{2})/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

export function scheduleWindow(schedule: string, minutes = 60): string {
  const [hour, minute] = schedule.replace(".", ":").split(":").map(Number);
  const start = hour * 60 + (minute || 0);
  const end = start + minutes;
  const format = (value: number) =>
    `${String(Math.floor(value / 60) % 24).padStart(2, "0")}.${String(
      value % 60,
    ).padStart(2, "0")}`;
  return `${format(start)}-${format(end)}`;
}

export function timeToMinutes(value: string): number {
  const [hour, minute] = value.replace(".", ":").split(":").map(Number);
  return hour * 60 + (minute || 0);
}

export function isSessionActive(
  start: string,
  end: string,
  nowMinutes: number = DEMO_MINUTES,
): boolean {
  return nowMinutes >= timeToMinutes(start) && nowMinutes < timeToMinutes(end);
}

export function isSessionNext(
  start: string,
  nowMinutes: number = DEMO_MINUTES,
): boolean {
  return nowMinutes < timeToMinutes(start);
}
