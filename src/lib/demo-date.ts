export const DEMO_NOW = new Date("2026-11-04T14:00:00+07:00");
export const DEMO_NOW_ISO = DEMO_NOW.toISOString();
export const DEMO_DATE_LONG = "Rabu, 4 November 2026";
export const DEMO_DATE_SHORT = "4 Nov 2026";
export const DEMO_TIME = "14.00 WIB";

/** ISO timestamp for a WIB wall-clock date/time, e.g. isoAt("2026-11-04", "12:05"). */
export function isoAt(date: string, time: string): string {
  return new Date(`${date}T${time}:00+07:00`).toISOString();
}
