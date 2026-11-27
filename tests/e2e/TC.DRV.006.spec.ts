import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-05: Auto-Sync
 * Test Case ID: TC.DRV.006
 * Skenario: Positive
 * Deskripsi: Data transaksi offline terkirim otomatis ke server begitu sinyal kembali
 *            tanpa klik ulang.
 * Prekondisi: Terdapat antrean data perubahan status di LocalStorage akibat transaksi
 *             saat mode offline.
 */

test.describe("TC.DRV.006 - Sinkronisasi otomatis antrean data lokal saat kembali online", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk/driver");
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/driver/);
    await expect(page.getByRole("heading", { name: /Halo,/i })).toBeVisible({ timeout: 10000 });
  });

  test("Auto-sync: banner hilang, indikator hijau, dan toast sinkronisasi muncul saat kembali online", async ({
    page,
  }) => {
    const toggleBtn = page.getByRole("button", { name: /Online|Offline/i }).first();
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });

    // === SETUP: Buat antrean offline ===
    // 1. Matikan koneksi (klik toggle ke Offline)
    await toggleBtn.click();
    await expect(page.getByText(/Mode offline aktif/i)).toBeVisible({ timeout: 5000 });

    // 2. Selesaikan satu tugas penjemputan saat offline
    const firstPickupCard = page
      .locator("article")
      .filter({ hasText: "Menunggu Penjemputan" })
      .first();
    await expect(firstPickupCard).toBeVisible({ timeout: 10000 });

    await firstPickupCard.getByRole("button", { name: "Selesaikan Penjemputan" }).click();
    await expect(page.getByRole("dialog", { name: "Konfirmasi Penjemputan" })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Ya, Selesaikan Penjemputan" }).click();

    // Pastikan antrean lokal terisi
    await expect(
      page.getByText(/1 tugas tersimpan dalam antrean lokal/i)
    ).toBeVisible({ timeout: 5000 });

    // === Langkah 1: Aktifkan kembali koneksi (klik toggle ke Online) ===
    const offlineToggle = page.getByRole("button", { name: /Offline/i }).first();
    await offlineToggle.click();

    // Verifikasi 1a: Banner peringatan offline hilang
    await expect(page.getByText(/Mode offline aktif/i)).not.toBeVisible({ timeout: 5000 });

    // Verifikasi 1b: Indikator titik kembali hijau (title='Status: Online')
    await expect(
      page.locator("span[title='Status: Online']")
    ).toBeVisible({ timeout: 5000 });

    // === Langkah 2: Verifikasi sinkronisasi antrean lokal ===
    // Toast sinkronisasi otomatis muncul
    await expect(
      page.getByText(/berhasil disinkronkan|Sinkronisasi aktif/i)
    ).toBeVisible({ timeout: 5000 });

    // Toggle kembali ke Online dan kartu berpindah ke riwayat
    const historyTab = page.getByRole("button", { name: /Riwayat Tugas Selesai/i });
    await historyTab.click();

    // Verifikasi kartu tersinkronisasi — tidak ada badge "Menunggu Sinkronisasi" di riwayat
    const pendingSyncBadge = page.getByText("Menunggu Sinkronisasi");
    // Setelah sync, badge tidak boleh ada lagi (atau count = 0)
    await expect(pendingSyncBadge).not.toBeVisible({ timeout: 5000 });
  });
});
