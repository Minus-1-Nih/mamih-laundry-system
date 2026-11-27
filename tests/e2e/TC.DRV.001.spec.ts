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
    // Memastikan sapaan nama kurir tampil dengan tepat (menggunakan role-based locator sesuai best practice)
    const greeting = page.getByRole("heading", { name: /Halo, Rizky/i });
    await expect(greeting).toBeVisible();

    // --- Step 2: Periksa Lencana Wilayah Zona Aktif ---
    // Memastikan lencana wilayah/zona aktif (Zona Z1 · Sukabirus) tampil
    const zoneBadge = page.locator("span", { hasText: /Zona Z1/i }).first();
    await expect(zoneBadge).toBeVisible();
    await expect(zoneBadge).toContainText("Sukabirus");

    // --- Step 3: Periksa Indikator Titik Status Online Hijau ---
    // Memastikan indikator status koneksi hijau (online) muncul pada avatar & bar atas
    const onlineAvatarDot = page.locator("span[title='Status: Online']");
    await expect(onlineAvatarDot).toBeVisible();
    await expect(onlineAvatarDot).toHaveClass(/bg-emerald-500/);

    const onlineButton = page.getByRole("button", { name: /Online/i });
    await expect(onlineButton).toBeVisible();
    await expect(onlineButton.locator(".bg-emerald-500")).toBeVisible();

    // --- Step 4: Periksa Ringkasan Jumlah Tugas Harian (Jemput & Antar) ---
    // Memastikan terdapat counter ringkasan Tugas Penjemputan dan Tugas Pengantaran ({ exact: true } untuk menghindari strict mode violation)
    const pickupSummary = page.getByText("Tugas Penjemputan", { exact: true });
    await expect(pickupSummary).toBeVisible();

    const deliverySummary = page.getByText("Tugas Pengantaran", { exact: true });
    await expect(deliverySummary).toBeVisible();

    // --- Step 5: Periksa Navigasi Tab & Daftar Kartu Tugas Aktif ---
    // Memastikan tab 'Daftar Tugas Aktif' terpilih secara default
    const activeTasksTab = page.getByRole("button", { name: /Daftar Tugas Aktif/i });
    await expect(activeTasksTab).toBeVisible();

    // Memastikan filter chips tersedia (menggunakan regex awalan agar tidak ambigu dengan tombol aksi di kartu)
    await expect(page.getByRole("button", { name: /^Semua/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Penjemputan \(/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Pengantaran \(/ })).toBeVisible();

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
    const waButton = firstCard.getByRole("link", { name: /WhatsApp/i });
    await expect(waButton).toBeVisible();
    await expect(waButton).toHaveAttribute("href", /https:\/\/wa\.me\//);

    // Tombol aksi spesifik kurir ("Selesaikan Penjemputan" atau "Selesaikan Pengantaran")
    const actionButton = firstCard.getByRole("button", {
      name: /Selesaikan (Penjemputan|Pengantaran)/,
    });
    await expect(actionButton).toBeVisible();
  });
});
