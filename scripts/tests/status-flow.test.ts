import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canAdvance,
  nextStatusFor,
  statusNotes,
} from "@/lib/status-flow";
import type { OrderStatus, Role } from "@/lib/types";

test("the outlet advances the internal stages and stops before delivery", () => {
  assert.equal(nextStatusFor("admin", "menunggu"), "dicuci");
  assert.equal(nextStatusFor("admin", "dicuci"), "siap");
  assert.equal(nextStatusFor("admin", "siap"), null);
  assert.equal(nextStatusFor("admin", "selesai"), null);
});

test("the driver records pickup and delivery, never the outlet's ready stage", () => {
  assert.equal(nextStatusFor("driver", "menunggu"), "dicuci");
  assert.equal(nextStatusFor("driver", "dicuci"), null);
  assert.equal(nextStatusFor("driver", "siap"), "selesai");
  assert.equal(nextStatusFor("driver", "selesai"), null);
});

test("customers cannot advance any stage", () => {
  for (const status of ["menunggu", "dicuci", "siap"] as OrderStatus[]) {
    assert.equal(nextStatusFor("customer", status), null);
  }
});

test("admin may advance one stage at a time", () => {
  assert.equal(canAdvance("admin", "menunggu", "dicuci").ok, true);
  assert.equal(canAdvance("admin", "dicuci", "siap").ok, true);
});

test("admin cannot complete the delivery", () => {
  const result = canAdvance("admin", "siap", "selesai");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /driver/);
});

test("driver cannot mark the order ready for delivery", () => {
  const result = canAdvance("driver", "dicuci", "siap");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /admin outlet/);
});

test("driver may record pickup and delivery", () => {
  assert.equal(canAdvance("driver", "menunggu", "dicuci").ok, true);
  assert.equal(canAdvance("driver", "siap", "selesai").ok, true);
});

test("no rewinds and no skipping", () => {
  const rewind = canAdvance("admin", "siap", "dicuci");
  const skip = canAdvance("admin", "menunggu", "siap");
  assert.equal(rewind.ok, false);
  assert.equal(skip.ok, false);
  if (!skip.ok) assert.match(skip.error, /satu tahap/);
});

test("selesai is terminal and a repeated status is rejected", () => {
  const locked = canAdvance("admin", "selesai", "selesai");
  const same = canAdvance("admin", "dicuci", "dicuci");
  assert.equal(locked.ok, false);
  assert.equal(same.ok, false);
});

test("customers are rejected before any transition", () => {
  const result = canAdvance("customer", "menunggu", "dicuci");
  assert.equal(result.ok, false);
});

test("history notes describe the stage that was recorded", () => {
  assert.equal(statusNotes.dicuci, "Mulai dicuci di outlet");
  assert.equal(statusNotes.siap, "Selesai dicuci, siap diantar");
  assert.notEqual(statusNotes.dicuci, statusNotes.siap);
});

test("every role and status pair is handled without throwing", () => {
  const roles: Role[] = ["admin", "driver", "customer"];
  const statuses: OrderStatus[] = ["menunggu", "dicuci", "siap", "selesai"];
  for (const role of roles) {
    for (const from of statuses) {
      for (const to of statuses) {
        assert.doesNotThrow(() => canAdvance(role, from, to));
      }
    }
  }
});
