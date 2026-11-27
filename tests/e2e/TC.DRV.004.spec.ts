import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-03: Eksekusi Tugas & Pembaruan Status 1-Klik
 * Test Case ID: TC.DRV.004
 * Skenario: Negative
 * Deskripsi: Status tugas tidak berubah apabila kurir membatalkan konfirmasi
 * Prekondisi: Kurir berada di halaman /driver dan jendela modal konfirmasi sedang terbuka.
 */

test.describe("TC.DRV.004 - Pembatalan pembaruan status pada modal konfirmasi", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Masuk ke halaman login driver
    await page.goto("/masuk/driver");

    // 2. Isi kredensial driver demo (Rizky - Zona Z1)
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');

    // 3. Pastikan berada di halaman /driver dan halaman sudah hydrated
    await expect(page).toHaveURL(/\/driver/);
    // Tunggu heading driver muncul sebagai sinyal halaman sudah render penuh
    await expect(page.getByRole("heading", { name: /Halo,/i })).toBeVisible({ timeout: 10000 });
  });

  test("Membatalkan pembaruan status pada modal konfirmasi tidak mengubah status tugas dan kartu tetap di tugas aktif", async ({
    page,
  }) => {
    // Temukan kartu tugas penjemputan pertama
    const firstPickupCard = page
      .locator("article")
      .filter({ hasText: "Menunggu Penjemputan" })
      .first();
    await expect(firstPickupCard).toBeVisible({ timeout: 10000 });

    const targetOrderCode = await firstPickupCard
      .locator("span.font-mono")
      .innerText();

    // --- Langkah 1: Klik tombol Selesaikan Penjemputan pada kartu tugas ---
    const actionButton = firstPickupCard.getByRole("button", {
      name: "Selesaikan Penjemputan",
    });
    await expect(actionButton).toBeVisible();
    await actionButton.click();

    // Verifikasi: Jendela modal konfirmasi muncul di layar
    const confirmModalHeading = page.getByRole("heading", {
      name: "Konfirmasi Penjemputan",
    });
    await expect(confirmModalHeading).toBeVisible();

    // --- Langkah 2: Klik tombol 'Batal' pada modal konfirmasi ---
    const cancelButton = page.getByRole("button", { name: "Batal" });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // --- Verifikasi Ekspektasi Hasil ---
    // a. Jendela modal konfirmasi tertutup
    await expect(confirmModalHeading).not.toBeVisible();

    // b. Kartu tugas tetap berada di daftar tugas aktif
    const cardStillInActive = page
      .locator("article")
      .filter({ hasText: targetOrderCode });
    await expect(cardStillInActive).toBeVisible();

    // c. Status tugas tidak berubah (tetap 'Menunggu Penjemputan' dan tombol 'Selesaikan Penjemputan' tetap ada)
    await expect(cardStillInActive.getByText("Menunggu Penjemputan")).toBeVisible();
    await expect(
      cardStillInActive.getByRole("button", { name: "Selesaikan Penjemputan" }),
    ).toBeVisible();
  });
});
