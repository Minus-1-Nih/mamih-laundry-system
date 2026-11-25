import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-01: Beranda & Manajemen Tugas Kurir
 * Test Case ID: TC.DRV.001
 * Skenario: Positive
 * Deskripsi: Kurir dapat melihat informasi profil, ringkasan harian, dan daftar tugas sesuai zona tugasnya
 */

test.describe("TC.DRV.001 - Tampilan beranda dan daftar tugas aktif kurir per zona", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Masuk ke halaman login driver
    await page.goto("/masuk/driver");

    // 2. Isi kredensial driver demo (Rizky - Zona Z1)
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");

    // 3. Klik tombol masuk
    await page.click('button[type="submit"]');

    // 4. Pastikan diarahkan ke halaman utama Role Driver (/driver)
    await expect(page).toHaveURL(/\/driver/);
  });

  test("Memverifikasi header profil, lencana zona, status online, ringkasan harian, dan daftar tugas aktif", async ({
    page,
  }) => {
    // --- Step 1: Buka & periksa Header Profil ---
    // Memastikan sapaan nama kurir tampil dengan tepat
    const greeting = page.locator("h1");
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText("Halo, Rizky");

    // --- Step 2: Periksa Lencana Wilayah Zona Aktif ---
    // Memastikan lencana wilayah/zona aktif (Zona Z1 · Sukabirus) tampil
    const zoneBadge = page.locator("section span:has-text('Zona Z1')");
    await expect(zoneBadge).toBeVisible();
    await expect(zoneBadge).toContainText("Sukabirus");

    // --- Step 3: Periksa Indikator Titik Status Online Hijau ---
    // Memastikan indikator status koneksi hijau (online) muncul pada avatar & bar atas
    const onlineAvatarDot = page.locator("span[title='Status: Online']");
    await expect(onlineAvatarDot).toBeVisible();
    await expect(onlineAvatarDot).toHaveClass(/bg-emerald-500/);

    const onlineButton = page.locator("button:has-text('Online')");
    await expect(onlineButton).toBeVisible();
    await expect(onlineButton.locator(".bg-emerald-500")).toBeVisible();

    // --- Step 4: Periksa Ringkasan Jumlah Tugas Harian (Jemput & Antar) ---
    // Memastikan terdapat counter ringkasan Tugas Penjemputan dan Tugas Pengantaran
    const pickupSummary = page.locator("text=Tugas Penjemputan");
    await expect(pickupSummary).toBeVisible();

    const deliverySummary = page.locator("text=Tugas Pengantaran");
    await expect(deliverySummary).toBeVisible();

    // --- Step 5: Periksa Navigasi Tab & Daftar Kartu Tugas Aktif ---
    // Memastikan tab 'Daftar Tugas Aktif' terpilih secara default
    const activeTasksTab = page.locator("button:has-text('Daftar Tugas Aktif')");
    await expect(activeTasksTab).toBeVisible();

    // Memastikan filter chips tersedia
    await expect(page.locator("button:has-text('Semua')")).toBeVisible();
    await expect(page.locator("button:has-text('Penjemputan')")).toBeVisible();
    await expect(page.locator("button:has-text('Pengantaran')")).toBeVisible();

    // Memastikan daftar kartu tugas aktif tampil sesuai zona kurir (Zona Z1)
    const taskCards = page.locator("article");
    const count = await taskCards.count();
    expect(count).toBeGreaterThan(0);

    // Memverifikasi elemen penting pada kartu tugas pertama
    const firstCard = taskCards.first();
    await expect(firstCard).toBeVisible();

    // Format kode pesanan (format: Z1-YYMMDD-NNN)
    const orderCode = firstCard.locator("span.font-mono");
    await expect(orderCode).toBeVisible();
    await expect(orderCode).toHaveText(/Z1-\d{6}-\d{3}/);

    // Elemen alamat & patokan
    await expect(firstCard.locator("svg.lucide-map-pin")).toBeVisible();

    // Tombol WhatsApp kurir
    const waButton = firstCard.locator("a:has-text('WhatsApp')");
    await expect(waButton).toBeVisible();
    await expect(waButton).toHaveAttribute("href", /https:\/\/wa\.me\//);

    // Tombol aksi spesifik kurir ("Selesaikan Penjemputan" atau "Selesaikan Pengantaran")
    const actionButton = firstCard.locator(
      "button:has-text('Selesaikan Penjemputan'), button:has-text('Selesaikan Pengantaran')",
    );
    await expect(actionButton).toBeVisible();
  });
});
