"use client";

// Jam WIB sungguhan untuk halaman Sesi operasional pelanggan (MNI-21).
// Halaman lain tetap memakai DEMO_NOW karena data contoh bergantung padanya.

import { useEffect, useState } from "react";

const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const clockParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export interface WibClock {
  /** "Kamis, 26 November 2026" */
  dateLong: string;
  /** "11.05 WIB" */
  time: string;
  /** Menit sejak 00.00 WIB, untuk status sesi. */
  minutes: number;
}

/** Tanggal dan jam WIB dari sebuah instan, apa pun zona waktu perangkatnya. */
export function wibClock(at: Date): WibClock {
  const parts = clockParts.formatToParts(at);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    dateLong: longDate.format(at),
    time: `${pad(hour)}.${pad(minute)} WIB`,
    minutes: hour * 60 + minute,
  };
}

/**
 * Jam WIB yang ikut berjalan. Bernilai null sampai komponen terpasang di
 * peramban, supaya HTML server dan klien tidak berbeda.
 */
export function useWibClock(intervalMs = 15_000): WibClock | null {
  const [clock, setClock] = useState<WibClock | null>(null);
  useEffect(() => {
    const tick = () => setClock(wibClock(new Date(Date.now())));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return clock;
}
