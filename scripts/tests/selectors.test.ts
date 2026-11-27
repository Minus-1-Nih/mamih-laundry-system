import { test } from "node:test";
import assert from "node:assert/strict";

import { readyWithoutDriver, workingOrders } from "@/lib/selectors";
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

test("the admin list keeps today's orders and every unfinished older order", () => {
  const rows = workingOrders([
    order({ code: "Z1-261104-001", status: "selesai" }),
    order({ code: "Z1-261104-002", status: "dicuci" }),
    order({ code: "Z1-261103-003", status: "dicuci", createdAt: "2026-11-03T07:00:00.000Z" }),
    order({ code: "Z1-261103-004", status: "siap", createdAt: "2026-11-03T08:00:00.000Z" }),
    order({ code: "Z1-261030-005", status: "selesai", createdAt: "2026-10-30T08:00:00.000Z" }),
    order({
      code: "Z1-261102-006",
      status: "dicuci",
      createdAt: "2026-11-02T08:00:00.000Z",
      deletedAt: "2026-11-03T08:00:00.000Z",
    }),
  ]);

  assert.deepEqual(
    rows.map((item) => item.code),
    ["Z1-261104-001", "Z1-261104-002", "Z1-261103-003", "Z1-261103-004"],
  );
});

test("ready orders count as unclaimed only until a courier takes them", () => {
  const rows = readyWithoutDriver([
    order({ code: "Z1-261104-001", status: "siap" }),
    order({
      code: "Z1-261104-002",
      status: "siap",
      driverId: "u-rizky",
      assignedAt: "2026-11-04T11:00:00.000Z",
    }),
    // A bare legacy driverId is not a claim.
    order({ code: "Z1-261104-003", status: "siap", driverId: "u-fajar" }),
    order({ code: "Z1-261104-004", status: "menunggu" }),
  ]);

  assert.deepEqual(
    rows.map((item) => item.code),
    ["Z1-261104-001", "Z1-261104-003"],
  );
});
