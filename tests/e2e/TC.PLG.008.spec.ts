import { test, expect } from "@playwright/test";

/**
 * EIM-04: Riwayat dan Detail Pesanan
 * Test Case ID: TC.PLG.008
 * Skenario: Negative
 * Deskripsi: Pencarian kode pesanan yang tidak ada menampilkan keadaan kosong yang informatif
 * Prekondisi: Pelanggan Adinda sudah masuk akun
 */

test.describe("TC.PLG.008 - Pencarian riwayat tanpa hasil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/akun\/riwayat/);
  });

  test("Menampilkan pesan belum ada pesanan yang cocok", async ({ page }) => {
    await page.getByLabel("Cari kode pesanan").fill("Z9-999999-999");
    await expect(page.getByText("Belum ada pesanan yang cocok")).toBeVisible();
  });
});