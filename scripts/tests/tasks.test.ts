import { test } from "node:test";
import assert from "node:assert/strict";

import { DEMO_NOW } from "@/lib/demo-date";
import {
  DEMO_SESSION_MINUTES,
  canClaim,
  canReassign,
  canRelease,
  demoNowAt,
  driverTasks,
  sessionState,
} from "@/lib/tasks";
import type { OperationalSession, Order, User } from "@/lib/types";

const sessions: OperationalSession[] = [
  {
    type: "pickup",
    start: "08.00",
    cutoff: "16.00",
    end: "17.00",
    capacity: 20,
    open: true,
  },
  {
    type: "delivery",
    start: "17.00",
    cutoff: "16.00",
    end: "21.00",
    capacity: 12,
    open: true,
  },
];

const driver: Pick<User, "id" | "zoneIds" | "role"> = {
  id: "u-rizky",
  role: "driver",
  zoneIds: ["Z1"],
};
const otherDriver: Pick<User, "id" | "zoneIds" | "role"> = {
  id: "u-fajar",
  role: "driver",
  zoneIds: ["Z1"],
};
const admin = { id: "u-owner", role: "admin" as const };

function order(overrides: Partial<Order> = {}): Order {
  return {
    code: "Z1-261104-001",
    customerName: "Adinda Putri",
    phone: "0812-1000-0001",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 0,
    zoneId: "Z1",
    schedule: "14.00",
    scheduleDate: "2026-11-04",
    deliveryDate: "2026-11-04",
    tier: "reguler",
    landmark: "Kos Mawar",
    status: "menunggu",
    createdAt: "2026-11-04T07:00:00.000Z",
    history: [],
    ...overrides,
  };
}

function ready(overrides: Partial<Order> = {}): Order {
  return order({ status: "siap", ...overrides });
}

function claimed(
  by: { id: string },
  overrides: Partial<Order> = {},
): Partial<Order> {
  return {
    driverId: by.id,
    assignedAt: "2026-11-04T07:00:00.000Z",
    assignedBy: "Kurir",
    ...overrides,
  };
}

function codes(orders: Order[]): string[] {
  return orders.map((item) => item.code);
}

test("only the running session pushes work, for the courier's zones", () => {
  const orders = [
    order({ code: "Z1-PICKUP", schedule: "19.00" }),
    order({ code: "Z1-TOMORROW", scheduleDate: "2026-11-05" }),
    order({ code: "Z2-OTHER-ZONE", zoneId: "Z2" }),
    order({ code: "Z1-DELETED", deletedAt: "2026-11-04T07:10:00.000Z" }),
    ready({ code: "Z1-DELIVERY" }),
  ];

  const atLunch = driverTasks(orders, driver, sessions, 14 * 60);
  assert.deepEqual(codes(atLunch.pickup), ["Z1-PICKUP"]);
  assert.deepEqual(codes(atLunch.delivery), []);
  assert.equal(atLunch.activeSession?.type, "pickup");

  const atDinner = driverTasks(orders, driver, sessions, 18 * 60);
  assert.deepEqual(codes(atDinner.pickup), []);
  assert.deepEqual(codes(atDinner.delivery), ["Z1-DELIVERY"]);
  assert.equal(atDinner.activeSession?.type, "delivery");
});

test("a pickup scheduled after its session window waits instead of leaking", () => {
  const orders = [order({ code: "Z1-LATE", schedule: "19.00" })];
  const atDinner = driverTasks(orders, driver, sessions, 18 * 60);
  assert.deepEqual(codes(atDinner.pickup), []);
});

test("overdue tasks bypass the session window", () => {
  const orders = [order({ code: "Z1-OVERDUE", schedule: "14.00" })];
  const atDinner = driverTasks(orders, driver, sessions, 18 * 60);
  assert.deepEqual(codes(atDinner.pickup), ["Z1-OVERDUE"]);
  assert.equal(canClaim(orders[0], driver, sessions, 18 * 60).ok, true);
});

test("claimed tasks leave the pool but stay with the holder", () => {
  const orders = [
    order({ code: "Z1-HELD", ...claimed(otherDriver) }),
    order({ code: "Z1-MINE", ...claimed(driver) }),
    order({ code: "Z1-FREE" }),
  ];

  const list = driverTasks(orders, driver, sessions, 14 * 60);
  assert.deepEqual(codes(list.pickup), ["Z1-MINE", "Z1-FREE"]);
  assert.equal(list.heldByOthers, 1);

  // A held leg survives the session ending, so the courier can still finish it.
  const afterHours = driverTasks(
    [order({ code: "Z1-MINE", schedule: "19.00", ...claimed(driver) })],
    driver,
    sessions,
    18 * 60,
  );
  assert.deepEqual(codes(afterHours.pickup), ["Z1-MINE"]);
});

test("claim gates re-check zone, session, and ownership", () => {
  assert.equal(
    canClaim(order({ zoneId: "Z2" }), driver, sessions, 14 * 60).ok,
    false,
  );

  const upcoming = canClaim(
    order({ code: "Z1-EARLY", schedule: "19.00" }),
    driver,
    sessions,
    14 * 60,
  );
  assert.equal(upcoming.ok, true);

  const ended = canClaim(
    order({ code: "Z1-ENDED", schedule: "19.00" }),
    driver,
    sessions,
    18 * 60,
  );
  assert.equal(ended.ok, false);

  const taken = canClaim(
    order({ ...claimed(otherDriver) }),
    driver,
    sessions,
    14 * 60,
  );
  assert.equal(taken.ok, false);

  const mine = canClaim(
    order({ ...claimed(driver), schedule: "19.00" }),
    driver,
    sessions,
    18 * 60,
  );
  assert.equal(mine.ok, true);

  const earlyButOverdue = canClaim(
    order({ schedule: "06.00" }),
    driver,
    sessions,
    7 * 60,
  );
  assert.equal(earlyButOverdue.ok, true);
});

test("release is only for the holder or an admin, before the leg completes", () => {
  const held = order({ ...claimed(otherDriver) });

  assert.equal(canRelease(held, otherDriver).ok, true);
  assert.equal(canRelease(held, driver).ok, false);
  assert.equal(canRelease(held, admin).ok, true);
  assert.equal(canRelease(order(), otherDriver).ok, false);
  assert.equal(
    canRelease(order({ status: "dicuci", ...claimed(otherDriver) }), admin).ok,
    false,
  );
});

test("admin reassignment needs an active driver in the order's zone", () => {
  const target: Pick<User, "id" | "role" | "active" | "zoneIds"> = {
    id: "u-bayu",
    role: "driver",
    active: true,
    zoneIds: ["Z1"],
  };

  assert.equal(canReassign(order(), target).ok, true);
  assert.equal(
    canReassign(order(), { ...target, active: false }).ok,
    false,
  );
  assert.equal(
    canReassign(order(), { ...target, zoneIds: ["Z2"] }).ok,
    false,
  );
  assert.equal(
    canReassign(order({ status: "dicuci" }), target).ok,
    false,
  );
});

test("session state and the demo clock follow the WIB day", () => {
  const [pickup, delivery] = sessions;
  assert.equal(sessionState(pickup, 7 * 60), "upcoming");
  assert.equal(sessionState(pickup, 14 * 60), "active");
  assert.equal(sessionState(pickup, 18 * 60), "ended");
  assert.equal(
    sessionState({ ...pickup, open: false }, 14 * 60),
    "closed",
  );
  assert.equal(sessionState(delivery, 18 * 60), "active");

  assert.equal(
    demoNowAt(DEMO_SESSION_MINUTES.delivery).getTime(),
    DEMO_NOW.getTime() + 4 * 60 * 60_000,
  );
});
