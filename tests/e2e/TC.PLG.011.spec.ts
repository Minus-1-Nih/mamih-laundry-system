import { test, expect } from "@playwright/test";

/**
 * EIM-05: Lokasi dan Detail Alamat
 * Test Case ID: TC.PLG.011
 * Skenario: Positive
 * Deskripsi: Pelanggan dapat menyaring alamat per zona pada peta, lalu mengubah, menjadikan utama, dan menghapus alamat tersimpan
 * Prekondisi: Pelanggan Adinda sudah masuk akun; alamat Rumah & Kos di Z1, Kantor di Z2, belum ada di Z3
 */

test.describe("TC.PLG.011 - Penyaringan zona dan pengelolaan alamat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "customer123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/akun\/riwayat/);
    await page.goto("/lokasi");
  });

  test("Filter zona Z2 dan Z3 pada peta", async ({ page }) => {
    // Z2 hanya menampilkan alamat Kantor
    await page.getByLabel("Filter zona peta").selectOption("Z2");
    await expect(page.getByText("1 dari 3 alamat")).toBeVisible();
    await expect(page.getByText("Jl. Sukapura No. 8, Ruko Dayeuhkolot").first()).toBeVisible();

    // Z3 belum memiliki alamat: peta menawarkan tambah alamat di Z3
    await page.getByLabel("Filter zona peta").selectOption("Z3");
    await expect(page.getByText("Belum ada alamat di Z3, Ciganitri.")).toBeVisible();
    await page.getByRole("button", { name: "Tambah alamat di Z3" }).click();
    await expect(page.locator("#address-zone")).toHaveValue("Z3");
  });

  test("Ubah, jadikan utama, lalu hapus alamat Kos", async ({ page }) => {
    // --- Step 1: Pilih alamat Kos ---
    await page.getByRole("button", { name: /Jl\. Sukabirus No\. 24/ }).first().click();

    // --- Step 2: Jadikan alamat utama ---
    await page.getByRole("button", { name: "Jadikan utama" }).click();
    await expect(page.getByText("Alamat utama", { exact: true })).toBeVisible();

    // --- Step 3: Ubah patokan ---
    await page.getByRole("button", { name: "Ubah alamat" }).click();
    await page.fill("#address-note", "Pagar hijau baru");
    await page.getByRole("button", { name: "Simpan alamat" }).click();
    await expect(page.getByText("Pagar hijau baru")).toBeVisible();

    // --- Step 4: Hapus alamat dengan konfirmasi ---
    await page.getByRole("button", { name: "Hapus alamat" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Hapus alamat" }).click();
    await expect(page.getByText("2 alamat", { exact: true })).toBeVisible();
  });
});