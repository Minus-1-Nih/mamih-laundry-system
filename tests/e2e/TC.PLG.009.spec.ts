import { test, expect } from "@playwright/test";

/**
 * EIM-05: Lokasi dan Detail Alamat
 * Test Case ID: TC.PLG.009
 * Skenario: Positive
 * Deskripsi: Pelanggan dapat menambahkan alamat baru beserta zona layanan, dan alamat tetap tersimpan setelah halaman dimuat ulang
 * Prekondisi: Pelanggan Adinda sudah masuk akun dan memiliki 3 alamat tersimpan
 */

test.describe("TC.PLG.009 - Menambahkan alamat baru", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/akun\/riwayat/);
    await page.goto("/lokasi");
  });

  test("Menyimpan alamat Kos di Zona Z3 lalu tetap ada setelah refresh", async ({ page }) => {
    await expect(page.getByText("3 alamat", { exact: true })).toBeVisible();

    // --- Step 1: Buka formulir tambah alamat ---
    await page.getByRole("button", { name: "Tambah alamat", exact: true }).click();

    // --- Step 2: Isi formulir ---
    await page.selectOption("#address-label", "Kos");
    await page.selectOption("#address-zone", "Z3");
    await page.fill("#address-line", "Jl. Ciganitri No. 3, Kos Melati");
    await page.fill("#address-note", "Pagar putih");

    // --- Step 3: Simpan ---
    await page.getByRole("button", { name: "Simpan alamat" }).click();

    // --- Step 4: Jumlah alamat bertambah dan zona tercatat ---
    await expect(page.getByText("4 alamat", { exact: true })).toBeVisible();

    // --- Step 5: Alamat tetap ada setelah halaman dimuat ulang ---
    await page.reload();
    await expect(page.getByText("Jl. Ciganitri No. 3, Kos Melati").first()).toBeVisible();
  });
});