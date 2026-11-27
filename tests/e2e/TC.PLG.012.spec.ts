import { test, expect } from "@playwright/test";

/**
 * EIM-06: Informasi Sesi Operasional Pelanggan
 * Test Case ID: TC.PLG.012
 * Skenario: Positive
 * Deskripsi: Halaman menampilkan jadwal sesi penjemputan/pengantaran serta tanggal & jam WIB saat halaman dibuka;
 *            status layanan buka pada jam operasional dan tutup di luar jam operasional
 * Prekondisi: Jam browser dikunci agar hasil uji konsisten
 */

test.describe("TC.PLG.012 - Informasi jadwal sesi operasional", () => {
  test("Jam operasional (10.00 WIB): tanggal, jam, dan status layanan buka", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-26T10:00:00+07:00"));
    await page.goto("/sesi");

    await expect(page.getByRole("heading", { name: "Informasi sesi operasional" })).toBeVisible();
    await expect(page.getByText("Kamis, 26 November 2026")).toBeVisible();
    await expect(page.getByText("10.00 WIB", { exact: true })).toBeVisible();
    await expect(page.getByText("Sesi penjemputan")).toBeVisible();
    await expect(page.getByText("Sesi pengantaran")).toBeVisible();
    await expect(page.getByText("Layanan buka")).toBeVisible();
  });

  test("Di luar jam operasional (22.30 WIB): status layanan tutup", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-26T22:30:00+07:00"));
    await page.goto("/sesi");

    await expect(page.getByText("22.30 WIB", { exact: true })).toBeVisible();
    await expect(page.getByText("Layanan tutup")).toBeVisible();
  });
});