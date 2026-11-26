import { test, expect } from "@playwright/test";

/**
 * EIM-03: Pelacakan Publik Status Pesanan
 * Test Case ID: TC.PLG.006
 * Skenario: Negative
 * Deskripsi: Kode unik yang tidak terdaftar menampilkan pesan informatif, bukan halaman kosong
 * Prekondisi: Pengguna belum masuk akun
 */

test.describe("TC.PLG.006 - Pelacakan dengan kode unik tidak terdaftar", () => {
  test("Menampilkan pesan kode pesanan tidak ditemukan", async ({ page }) => {
    await page.goto("/tracking?kode=Z9-000000-999");
    await expect(page.getByText("Kode pesanan tidak ditemukan.")).toBeVisible();
  });
});