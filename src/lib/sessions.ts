import {
  addDaysToKey,
  deliveryDateFor,
  orderDate,
  orderDeliveryDate,
  tierLabel,
  timeToMinutes,
  todayKey,
  turnaroundDays,
} from "@/lib/format";
import type { Order, OperationalSession, SessionType } from "@/lib/types";

/**
 * Operational sessions are the day's two batches: pickup through the day and
 * delivery in the evening. Everything the UI says about hours, cutoffs and
 * capacity is derived here, so a change in `/admin/pengaturan` is one edit.
 */

export const SESSION_TYPES: SessionType[] = ["pickup", "delivery"];

/** How many days ahead allocation may search before giving up. */
export const ALLOCATION_HORIZON_DAYS = 7;

export type BookableResult = { ok: true } | { ok: false; reason: string };

const wibClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Minutes since midnight in WIB, for cutoff comparisons against the demo clock. */
export function minutesOfDay(now: Date): number {
  const [hour, minute] = wibClock.format(now).split(":").map(Number);
  return hour * 60 + minute;
}

export function sessionFor(
  type: SessionType,
  sessions: OperationalSession[],
): OperationalSession | undefined {
  return sessions.find((session) => session.type === type);
}

/**
 * Which leg an order is on. Pickup owns the waiting and washing statuses; a
 * ready or finished order has moved to the delivery leg.
 */
export function legFor(order: Order): SessionType {
  return order.status === "menunggu" || order.status === "dicuci"
    ? "pickup"
    : "delivery";
}

/** The calendar day an order occupies on a given leg. */
export function legDate(order: Order, type: SessionType): string {
  return type === "pickup" ? orderDate(order) : orderDeliveryDate(order);
}

export function sessionUsed(
  orders: Order[],
  type: SessionType,
  date: string,
): number {
  return orders.filter(
    (order) => !order.deletedAt && legDate(order, type) === date,
  ).length;
}

export function sessionCapacityLeft(
  orders: Order[],
  type: SessionType,
  date: string,
  sessions: OperationalSession[],
): number {
  const session = sessionFor(type, sessions);
  if (!session) return 0;
  return Math.max(0, session.capacity - sessionUsed(orders, type, date));
}

/**
 * Whether an order may be allocated into `date`'s session. Order of checks is
 * the order the admin reads: closed, then past, then cutoff, then capacity.
 */
export function bookable(
  date: string,
  type: SessionType,
  sessions: OperationalSession[],
  orders: Order[],
  now: Date,
): BookableResult {
  const session = sessionFor(type, sessions);
  if (!session) {
    return { ok: false, reason: "Sesi operasional belum diatur." };
  }
  if (!session.open) {
    return { ok: false, reason: `Sesi ${session.type === "pickup" ? "penjemputan" : "pengantaran"} sedang tutup.` };
  }

  const today = todayKey(now);
  if (date < today) {
    return { ok: false, reason: "Tanggal sesi sudah lewat." };
  }
  if (date === today && minutesOfDay(now) >= timeToMinutes(session.cutoff)) {
    return {
      ok: false,
      reason: `Batas konfirmasi sesi hari ini ${session.cutoff} sudah lewat.`,
    };
  }
  if (sessionUsed(orders, type, date) >= session.capacity) {
    return {
      ok: false,
      reason: `Sesi ini penuh (${session.capacity} pesanan).`,
    };
  }
  return { ok: true };
}

export interface AllocationInput {
  pickupDate?: string;
  deliveryDate?: string;
}

export type AllocationResult =
  | { ok: true; pickupDate: string; deliveryDate: string }
  | { ok: false; error: string };

/**
 * The whole move rule in one pure function: keep the tier turnaround, then
 * check both legs against the same capacity and cutoff rules. The order being
 * moved is excluded from the counts so it can stay in place.
 */
export function planAllocation(
  order: Order,
  input: AllocationInput,
  sessions: OperationalSession[],
  orders: Order[],
  now: Date,
): AllocationResult {
  const others = orders.filter((item) => item.code !== order.code);
  const pickupDate = input.pickupDate ?? orderDate(order);
  const minimumDelivery = deliveryDateFor(pickupDate, order.tier);
  let deliveryDate = input.deliveryDate ?? orderDeliveryDate(order);

  if (deliveryDate < minimumDelivery) {
    if (input.deliveryDate) {
      return {
        ok: false,
        error: `Pengantaran ${tierLabel(
          order.tier ?? "reguler",
        )} minimal ${turnaroundDays(order.tier)} hari setelah penjemputan.`,
      };
    }
    deliveryDate = minimumDelivery;
  }

  const pickupCheck = bookable(pickupDate, "pickup", sessions, others, now);
  if (!pickupCheck.ok) {
    return { ok: false, error: `Penjemputan: ${pickupCheck.reason}` };
  }
  const deliveryCheck = bookable(deliveryDate, "delivery", sessions, others, now);
  if (!deliveryCheck.ok) {
    return { ok: false, error: `Pengantaran: ${deliveryCheck.reason}` };
  }

  return { ok: true, pickupDate, deliveryDate };
}

/** First bookable date at or after `from`, or null within the horizon. */
export function nextSessionDate(
  type: SessionType,
  sessions: OperationalSession[],
  orders: Order[],
  from: string,
  now: Date,
): string | null {
  for (let offset = 0; offset < ALLOCATION_HORIZON_DAYS; offset += 1) {
    const candidate = addDaysToKey(from, offset);
    if (bookable(candidate, type, sessions, orders, now).ok) {
      return candidate;
    }
  }
  return null;
}

/**
 * First pickup date whose delivery leg also fits, so a full delivery day does
 * not silently accept a pickup it cannot deliver.
 */
export function nextPickupDate(
  sessions: OperationalSession[],
  orders: Order[],
  from: string,
  now: Date,
  deliveryDateFor: (pickupDate: string) => string,
): { pickupDate: string; deliveryDate: string } | null {
  for (let offset = 0; offset < ALLOCATION_HORIZON_DAYS; offset += 1) {
    const pickupDate = addDaysToKey(from, offset);
    if (!bookable(pickupDate, "pickup", sessions, orders, now).ok) continue;
    const deliveryDate = deliveryDateFor(pickupDate);
    if (bookable(deliveryDate, "delivery", sessions, orders, now).ok) {
      return { pickupDate, deliveryDate };
    }
  }
  return null;
}

export function sessionSpan(session: OperationalSession): string {
  return `${session.start}-${session.end}`;
}

export function sessionWindowLabel(
  type: SessionType,
  sessions: OperationalSession[],
): string {
  const session = sessionFor(type, sessions);
  return session ? `${sessionSpan(session)} WIB` : "Sesi belum diatur";
}

/** Earliest open to latest close, the store's advertised hours. */
export function serviceHours(sessions: OperationalSession[]): string {
  if (sessions.length === 0) return "Sesi belum diatur";
  const start = sessions.reduce(
    (earliest, session) =>
      timeToMinutes(session.start) < timeToMinutes(earliest) ? session.start : earliest,
    sessions[0].start,
  );
  const end = sessions.reduce(
    (latest, session) =>
      timeToMinutes(session.end) > timeToMinutes(latest) ? session.end : latest,
    sessions[0].end,
  );
  return `${start}-${end} WIB`;
}

/** The gap between the latest close and the earliest open, crossing midnight. */
export function closedHours(sessions: OperationalSession[]): string {
  if (sessions.length === 0) return "Sesi belum diatur";
  const start = sessions.reduce(
    (earliest, session) =>
      timeToMinutes(session.start) < timeToMinutes(earliest) ? session.start : earliest,
    sessions[0].start,
  );
  const end = sessions.reduce(
    (latest, session) =>
      timeToMinutes(session.end) > timeToMinutes(latest) ? session.end : latest,
    sessions[0].end,
  );
  return `${end}-${start} WIB`;
}

/** Next open session and its window, for "buka lagi" copy. */
export function nextOpenSession(
  sessions: OperationalSession[],
  nowMinutes: number,
): OperationalSession | undefined {
  return [...sessions]
    .filter((session) => session.open)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    .find((session) => timeToMinutes(session.start) > nowMinutes);
}

export function capacityLabel(
  used: number,
  sessions: OperationalSession[],
  type: SessionType,
): string {
  const session = sessionFor(type, sessions);
  return `${used}/${session?.capacity ?? 0}`;
}
