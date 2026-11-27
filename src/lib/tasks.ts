import { DEMO_MINUTES, DEMO_NOW } from "@/lib/demo-date";
import {
  isOverdue,
  orderDate,
  orderDeliveryDate,
  timeToMinutes,
  todayKey,
} from "@/lib/format";
import { sessionFor } from "@/lib/sessions";
import type {
  OperationalSession,
  Order,
  SessionType,
  User,
  ZoneId,
} from "@/lib/types";

/**
 * Courier task pool (MNI-9). Orders are pushed to every driver whose zone
 * matches, but only for the session that is currently running. A driver claims
 * a task before executing it, so two couriers cannot complete the same leg.
 */

/** Demo wall-clock presets for the two operational sessions. */
export const DEMO_SESSION_MINUTES = {
  pickup: 14 * 60,
  delivery: 18 * 60,
} as const;

export type DemoSessionKey = keyof typeof DEMO_SESSION_MINUTES;

/** The demo clock shifted to another minute of the same WIB day. */
export function demoNowAt(minutes: number): Date {
  return new Date(DEMO_NOW.getTime() + (minutes - DEMO_MINUTES) * 60_000);
}

export type SessionState = "active" | "upcoming" | "ended" | "closed";

export function sessionState(
  session: OperationalSession,
  nowMinutes: number,
): SessionState {
  if (!session.open) return "closed";
  if (nowMinutes < timeToMinutes(session.start)) return "upcoming";
  if (nowMinutes >= timeToMinutes(session.end)) return "ended";
  return "active";
}

/** Pickup owns waiting orders; a ready order has moved to the delivery leg. */
export function taskLeg(order: Order): SessionType {
  return order.status === "siap" ? "delivery" : "pickup";
}

export function taskDueDate(
  order: Order,
  leg: SessionType = taskLeg(order),
): string {
  return leg === "pickup" ? orderDate(order) : orderDeliveryDate(order);
}

export interface DriverTaskList {
  pickup: Order[];
  delivery: Order[];
  /** Tasks of this zone and session already claimed by another courier. */
  heldByOthers: number;
  activeSession?: OperationalSession;
  nextSession?: OperationalSession;
}

function bySchedule(a: Order, b: Order): number {
  const due = taskDueDate(a).localeCompare(taskDueDate(b));
  return due !== 0 ? due : a.schedule.localeCompare(b.schedule);
}

function nextOpenSession(
  sessions: OperationalSession[],
  nowMinutes: number,
): OperationalSession | undefined {
  const today = [...sessions]
    .filter(
      (session) => session.open && timeToMinutes(session.start) > nowMinutes,
    )
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))[0];
  // After the last session of the day, point at tomorrow's pickup.
  return today ?? sessions.find((session) => session.open && session.type === "pickup");
}

export function driverTasks(
  orders: Order[],
  driver: Pick<User, "id" | "zoneIds">,
  sessions: OperationalSession[],
  nowMinutes: number,
): DriverTaskList {
  const now = demoNowAt(nowMinutes);
  const today = todayKey(now);
  const zones: ZoneId[] = driver.zoneIds ?? [];
  const activeSession = sessions.find(
    (session) => sessionState(session, nowMinutes) === "active",
  );

  const pickup: Order[] = [];
  const delivery: Order[] = [];
  let heldByOthers = 0;

  for (const order of orders) {
    if (order.deletedAt) continue;
    if (order.status !== "menunggu" && order.status !== "siap") continue;
    if (!zones.includes(order.zoneId)) continue;

    const leg = taskLeg(order);
    const session = sessionFor(leg, sessions);
    if (!session) continue;
    if (taskDueDate(order, leg) > today) continue;

    // `assignedAt` marks a real claim; a legacy `driverId` is just the last actor.
    const claimed = Boolean(order.assignedAt && order.driverId);
    const mine = claimed && order.driverId === driver.id;
    const overdue = isOverdue(order, now);
    const state = sessionState(session, nowMinutes);

    if (!mine) {
      if (!session.open) continue;
      // Only the active session pushes new work; overdue tasks bypass the window.
      if (!overdue && state !== "active") continue;
    }

    if (claimed && !mine) {
      heldByOthers += 1;
      continue;
    }

    (leg === "pickup" ? pickup : delivery).push(order);
  }

  pickup.sort(bySchedule);
  delivery.sort(bySchedule);

  return {
    pickup,
    delivery,
    heldByOthers,
    activeSession,
    nextSession: nextOpenSession(sessions, nowMinutes),
  };
}

export type TaskGate = { ok: true } | { ok: false; error: string };

function sessionName(type: SessionType): string {
  return type === "pickup" ? "penjemputan" : "pengantaran";
}

/** Re-checked by the store, not just the card that rendered the button. */
export function canClaim(
  order: Order,
  driver: Pick<User, "id" | "zoneIds">,
  sessions: OperationalSession[],
  nowMinutes: number,
): TaskGate {
  if (order.deletedAt) {
    return { ok: false, error: "Pesanan sudah dihapus." };
  }
  if (order.status !== "menunggu" && order.status !== "siap") {
    return { ok: false, error: "Pesanan ini tidak punya tugas lapangan." };
  }
  if (!(driver.zoneIds ?? []).includes(order.zoneId)) {
    return { ok: false, error: "Pesanan ini di luar zona tugas Anda." };
  }
  if (order.assignedAt && order.driverId === driver.id) {
    return { ok: true };
  }
  if (order.assignedAt && order.driverId) {
    return { ok: false, error: "Tugas ini sudah diambil kurir lain." };
  }

  const leg = taskLeg(order);
  const session = sessionFor(leg, sessions);
  if (!session) {
    return { ok: false, error: "Sesi operasional belum diatur." };
  }
  if (!session.open) {
    return { ok: false, error: `Sesi ${sessionName(leg)} sedang ditutup.` };
  }

  const now = demoNowAt(nowMinutes);
  if (taskDueDate(order, leg) > todayKey(now)) {
    return { ok: false, error: "Tugas ini belum masuk jadwal hari ini." };
  }
  if (!isOverdue(order, now)) {
    const state = sessionState(session, nowMinutes);
    if (state === "upcoming") {
      return {
        ok: false,
        error: `Sesi ${sessionName(leg)} belum dimulai (${session.start} WIB).`,
      };
    }
    if (state === "ended") {
      return {
        ok: false,
        error: `Sesi ${sessionName(leg)} sudah berakhir (${session.end} WIB).`,
      };
    }
  }

  return { ok: true };
}

export function canRelease(
  order: Order,
  actor: Pick<User, "id" | "role">,
): TaskGate {
  if (order.status !== "menunggu" && order.status !== "siap") {
    return { ok: false, error: "Tugas lapangan pesanan ini sudah selesai." };
  }
  if (!order.assignedAt || !order.driverId) {
    return { ok: false, error: "Tugas ini belum diambil kurir." };
  }
  if (actor.role !== "admin" && order.driverId !== actor.id) {
    return {
      ok: false,
      error: "Hanya kurir yang memegang tugas ini yang dapat melepasnya.",
    };
  }
  return { ok: true };
}

export function canReassign(
  order: Order,
  target: Pick<User, "id" | "role" | "active" | "zoneIds">,
): TaskGate {
  if (order.status !== "menunggu" && order.status !== "siap") {
    return { ok: false, error: "Pesanan ini tidak punya tugas lapangan." };
  }
  if (target.role !== "driver" || !target.active) {
    return { ok: false, error: "Pilih kurir yang aktif." };
  }
  if (!(target.zoneIds ?? []).includes(order.zoneId)) {
    return {
      ok: false,
      error: "Kurir ini tidak bertugas di zona pesanan.",
    };
  }
  return { ok: true };
}
