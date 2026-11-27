import { test } from "node:test";
import assert from "node:assert/strict";

import { wibClock } from "@/lib/live-clock";

test("formats the WIB date and time", () => {
  const clock = wibClock(new Date("2026-11-26T11:05:00+07:00"));
  assert.equal(clock.dateLong, "Kamis, 26 November 2026");
  assert.equal(clock.time, "11.05 WIB");
  assert.equal(clock.minutes, 11 * 60 + 5);
});

test("uses WIB even when UTC is still the previous day", () => {
  // 17.30 UTC on the 25th is 00.30 WIB on the 26th.
  const clock = wibClock(new Date("2026-11-25T17:30:00Z"));
  assert.equal(clock.dateLong, "Kamis, 26 November 2026");
  assert.equal(clock.time, "00.30 WIB");
  assert.equal(clock.minutes, 30);
});
