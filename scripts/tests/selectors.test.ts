import { test } from "node:test";
import assert from "node:assert/strict";

import { driverActiveTasks } from "@/lib/selectors";
import type { Order } from "@/lib/types";

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
    deliveryDate: "2026-11-06",
    tier: "reguler",
    landmark: "Kos Mawar",
    status: "menunggu",
    createdAt: "2026-11-04T07:00:00.000Z",
    history: [],
    ...overrides,
  };
}

test("a driver sees today's pickup and today's delivery, nothing later", () => {
  const tasks = driverActiveTasks(
    [
      order({ code: "Z1-261104-001" }),
      order({ code: "Z1-261104-002", status: "siap", deliveryDate: "2026-11-04" }),
      order({ code: "Z1-261104-003", status: "siap", deliveryDate: "2026-11-06" }),
      order({ code: "Z1-261104-004", scheduleDate: "2026-11-06" }),
    ],
    ["Z1"],
  );
  assert.deepEqual(
    tasks.map((item) => item.code),
    ["Z1-261104-001", "Z1-261104-002"],
  );
});

test("driver queue respects zones and ignores deleted orders", () => {
  const tasks = driverActiveTasks(
    [
      order({ code: "Z1-261104-001" }),
      order({ code: "Z2-261104-002", zoneId: "Z2" }),
      order({
        code: "Z1-261104-003",
        deletedAt: "2026-11-04T08:00:00.000Z",
      }),
    ],
    ["Z1"],
  );
  assert.deepEqual(
    tasks.map((item) => item.code),
    ["Z1-261104-001"],
  );
});
