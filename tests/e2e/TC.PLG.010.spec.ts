import { test, expect } from "@playwright/test";

/**
 * EIM-05: Lokasi dan Detail Alamat
 * Test Case ID: TC.PLG.010
 * Skenario: Negative
 * Deskripsi: Sistem menolak penyimpanan alamat tanpa alamat lengkap
 * Prekondisi: Pelanggan Adinda sudah masuk akun dan berada di /lokasi
 */

test.describe("TC.PLG.010 - Validasi formulir alamat kosong", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/akun\/riwayat/);
    await page.goto("/lokasi");
  });

  test("Menampilkan galat dan jumlah alamat tidak bertambah", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah alamat", exact: true }).click();
    await page.getByRole("button", { name: "Simpan alamat" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "Alamat lengkap wajib diisi." })).toBeVisible();

    await page.getByRole("button", { name: "Batal" }).click();
    await expect(page.getByText("3 alamat", { exact: true })).toBeVisible();
  });
});