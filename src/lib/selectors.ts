import {
  canonicalPhone,
  isOverdue,
  isToday,
  orderDate,
  todayKey,
} from "@/lib/format";
import type { Order, OrderStatus, SessionType, ZoneId } from "@/lib/types";

export function visibleOrders(orders: Order[]): Order[] {
  return orders.filter((order) => !order.deletedAt);
}

export function todayOrders(orders: Order[]): Order[] {
  return visibleOrders(orders).filter((order) => isToday(order.createdAt));
}

export function customerOrders(orders: Order[], customerId: string): Order[] {
  return visibleOrders(orders)
    .filter((order) => order.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function driverActiveTasks(
  orders: Order[],
  zoneIds: ZoneId[],
): Order[] {
  const today = todayKey();
  return visibleOrders(orders)
    .filter(
      (order) =>
        zoneIds.includes(order.zoneId) &&
        orderDate(order) <= today &&
        (order.status === "menunggu" || order.status === "siap"),
    )
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "menunggu" ? -1 : 1;
      const dateOrder = orderDate(a).localeCompare(orderDate(b));
      return dateOrder !== 0 ? dateOrder : a.schedule.localeCompare(b.schedule);
    });
}

/** Normalised phone + schedule date + schedule time, the duplicate key. */
export function findSimilarOrder(
  orders: Order[],
  key: { phone: string; scheduleDate: string; schedule: string },
): Order | undefined {
  const phone = canonicalPhone(key.phone);
  if (!phone || !key.scheduleDate || !key.schedule) return undefined;
  return visibleOrders(orders).find(
    (order) =>
      canonicalPhone(order.phone) === phone &&
      orderDate(order) === key.scheduleDate &&
      order.schedule === key.schedule,
  );
}

export function driverHistory(
  orders: Order[],
  driverId: string,
): Order[] {
  return visibleOrders(orders)
    .filter((order) => order.status === "selesai" && order.driverId === driverId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function completedAt(order: Order): number {
  const last = [...order.history]
    .reverse()
    .find((event) => event.status === "selesai");
  return new Date(last?.at ?? order.createdAt).getTime();
}

export function driverZoneHistory(
  orders: Order[],
  zoneIds: ZoneId[],
): Order[] {
  return visibleOrders(orders)
    .filter(
      (order) => zoneIds.includes(order.zoneId) && order.status === "selesai",
    )
    .sort((a, b) => completedAt(b) - completedAt(a));
}

export function countStatus(orders: Order[], status: OrderStatus): number {
  return orders.filter((order) => order.status === status).length;
}

export function countSession(orders: Order[], session: SessionType): number {
  return orders.filter((order) => order.session === session).length;
}

export function countZone(orders: Order[], zoneId: ZoneId): number {
  return orders.filter((order) => order.zoneId === zoneId).length;
}

export function overdueOrders(orders: Order[]): Order[] {
  return orders.filter((order) => isOverdue(order));
}

export function readyWithoutDriver(orders: Order[]): Order[] {
  return orders.filter(
    (order) => order.status === "siap" && !order.driverId,
  );
}
