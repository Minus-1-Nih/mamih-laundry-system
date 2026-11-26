import { test, expect } from "@playwright/test";

/**
 * EIM-04: Riwayat dan Detail Pesanan
 * Test Case ID: TC.PLG.007
 * Skenario: Positive
 * Deskripsi: Pelanggan dapat melihat riwayat pesanan dan membuka detail status satu pesanan
 * Prekondisi: Pelanggan Adinda sudah masuk akun
 */

test.describe("TC.PLG.007 - Riwayat dan detail pesanan pelanggan", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/akun\/riwayat/);
  });

  test("Membuka detail pesanan dari daftar riwayat", async ({ page }) => {
    // --- Step 1: Riwayat berisi pesanan milik pelanggan ---
    await expect(page.getByText("Z1-261104-012").first()).toBeVisible();

    // --- Step 2: Buka detail pesanan pertama ---
    await page.getByRole("link", { name: "Detail" }).first().click();

    // --- Step 3: Detail pesanan tampil lengkap ---
    await expect(page).toHaveURL(/\/akun\/riwayat\/detail\?kode=Z1-/);
    await expect(page.getByRole("heading", { name: "Ringkasan biaya" })).toBeVisible();
  });
});