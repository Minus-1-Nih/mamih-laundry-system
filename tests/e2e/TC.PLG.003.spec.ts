import { test, expect } from "@playwright/test";

/**
 * EIM-02: Autentikasi Pelanggan (Daftar & Masuk)
 * Test Case ID: TC.PLG.003
 * Skenario: Positive
 * Deskripsi: Pelanggan terdaftar dapat masuk dan mengakses riwayat pesanan pribadi
 * Prekondisi: Akun demo pelanggan Adinda (adinda / customer123) tersedia
 */

test.describe("TC.PLG.003 - Masuk akun pelanggan", () => {
  test("Masuk dengan kredensial valid lalu melihat riwayat pesanan pribadi", async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/akun\/riwayat/);
    await expect(page.getByRole("heading", { name: "Riwayat Pesanan" })).toBeVisible();
    // Pesanan milik Adinda tampil
    await expect(page.getByText("Z1-261104-012").first()).toBeVisible();
  });
});