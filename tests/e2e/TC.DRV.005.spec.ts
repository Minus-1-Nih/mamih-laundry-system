import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-04: Offline Mode
 * Test Case ID: TC.DRV.005
 * Skenario: Positive
 * Deskripsi: Aplikasi tetap dapat memproses pembaruan status dan menyimpannya ke
 *            LocalStorage saat offline
 * Prekondisi: Kurir berada di halaman /driver dengan minimal satu tugas aktif.
 */

test.describe("TC.DRV.005 - Penyimpanan status tugas secara lokal saat offline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk/driver");
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/driver/);
    await expect(page.getByRole("heading", { name: /Halo,/i })).toBeVisible({ timeout: 10000 });
  });

  test("Langkah 1: Banner offline muncul dan indikator avatar berubah merah saat mode offline diaktifkan", async ({
    page,
  }) => {
    // Simulasi offline via klik tombol toggle Online/Offline di header
    // (Playwright context.setOffline tidak bisa mengubah state React — kita gunakan toggle button)
    const toggleBtn = page.getByRole("button", { name: /Online|Offline/i }).first();
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    await toggleBtn.click();

    // Verifikasi 1a: Banner peringatan mode offline muncul (bg-amber-50)
    await expect(
      page.getByText(/Mode offline aktif/i)
    ).toBeVisible({ timeout: 5000 });

    // Verifikasi 1b: Indikator titik pada avatar berubah merah (title='Status: Offline')
    await expect(
      page.locator("span[title='Status: Offline']")
    ).toBeVisible({ timeout: 5000 });

    // Verifikasi 1c: Toggle button sekarang menampilkan "Offline"
    await expect(
      page.getByRole("button", { name: /Offline/i }).first()
    ).toBeVisible();
  });

  test("Langkah 2: Pembaruan status tersimpan ke antrean lokal saat offline", async ({
    page,
  }) => {
    // Aktifkan mode offline via toggle
    const toggleBtn = page.getByRole("button", { name: /Online|Offline/i }).first();
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    await toggleBtn.click();
    await expect(page.getByText(/Mode offline aktif/i)).toBeVisible({ timeout: 5000 });

    // Pastikan ada kartu penjemputan
    const firstPickupCard = page
      .locator("article")
      .filter({ hasText: "Menunggu Penjemputan" })
      .first();
    await expect(firstPickupCard).toBeVisible({ timeout: 10000 });

    // Klik tombol Selesaikan Penjemputan
    const actionBtn = firstPickupCard.getByRole("button", {
      name: "Selesaikan Penjemputan",
    });
    await actionBtn.click();

    // Modal konfirmasi muncul
    const modal = page.getByRole("dialog", { name: "Konfirmasi Penjemputan" });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Klik Ya, Selesaikan
    await page.getByRole("button", { name: "Ya, Selesaikan Penjemputan" }).click();

    // Verifikasi 2a: Tidak ada error — modal tertutup
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verifikasi 2b: Toast "Tersimpan di antrean offline" muncul
    await expect(
      page.getByText(/Tersimpan di antrean offline/i)
    ).toBeVisible({ timeout: 5000 });

    // Verifikasi 2c: Banner sekarang menampilkan jumlah antrean lokal (1 tugas)
    await expect(
      page.getByText(/1 tugas tersimpan dalam antrean lokal/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
