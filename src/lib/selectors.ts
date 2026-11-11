import { isOverdue, isToday } from "@/lib/format";
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
  return visibleOrders(orders)
    .filter(
      (order) =>
        zoneIds.includes(order.zoneId) &&
        (order.status === "menunggu" || order.status === "siap"),
    )
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "menunggu" ? -1 : 1;
      return a.schedule.localeCompare(b.schedule);
    });
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
