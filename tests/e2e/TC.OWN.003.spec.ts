import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.003
 * Skenario: Positive
 * Deskripsi: Owner melihat daftar akun staf beserta atributnya
 * Prekondisi: Owner sudah login dan berada di /admin/akun.
 *
 * Catatan: assertion mengikuti teks UI nyata. Selisih dengan teks di test case
 * dicatat sebagai anotasi "selisih" di laporan Playwright.
 */

const selisih = (description: string) =>
  test.info().annotations.push({ type: "selisih", description });

async function loginOwner(page: Page) {
  await page.goto("/masuk/owner");
  await expect(page.getByRole("heading", { name: /Masuk sebagai Owner/i })).toBeVisible({
    timeout: 10000,
  });
  await page.fill("#identifier", "owner");
  await page.fill("#password", "owner123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 10000 });
}

test.describe("TC.OWN.003 - Daftar akun staf", () => {
  test("Tabel daftar akun menampilkan nama, username, peran, kontak, zona, status, dan aksi", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";

    // Prasyarat: Owner login
    await loginOwner(page);

    // 1. Buka /admin/akun
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });

    // 2. Verifikasi: kolom tabel. UI memakai label "Akun", "Peran", "Zona",
    //    "Kontak", "Status", "Akses terakhir", "Aksi".
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const headers = table.locator("thead th");
    await expect(headers).toHaveText([
      "Akun",
      "Peran",
      "Zona",
      "Kontak",
      "Status",
      "Akses terakhir",
      "Aksi",
    ]);
    selisih(
      'Label kolom berbeda: "Nama & Username" -> "Akun", "Role Badge" -> "Peran", "Nomor Telepon" -> "Kontak", "Zona Tugas" -> "Zona". Ada kolom tambahan "Akses terakhir".',
    );

    // 3. Verifikasi: 6 akun staf seed (1 Owner, 1 Admin, 4 Driver)
    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(6);

    // 4. Verifikasi: baris Admin -> nama, @username, lencana "Admin", kontak, "Semua zona", Aktif
    const adminRow = rows.filter({ hasText: "@admin" });
    await expect(adminRow).toContainText("Nadia");
    await expect(adminRow.locator("span", { hasText: /^Admin$/ })).toBeVisible();
    await expect(adminRow).toContainText("0812-1000-0002");
    await expect(adminRow).toContainText("Semua zona");
    await expect(adminRow).toContainText("Aktif");
    selisih('Lencana peran Admin bertuliskan "Admin", bukan "Admin Toko".');

    // 5. Verifikasi: baris Driver -> lencana "Driver" dan zona tugas
    const rizkyRow = rows.filter({ hasText: "@rizky" });
    await expect(rizkyRow).toContainText("Rizky");
    await expect(rizkyRow.locator("span", { hasText: /^Driver$/ })).toBeVisible();
    await expect(rizkyRow).toContainText("0812-2000-0001");
    await expect(rizkyRow.locator("td").nth(2)).toHaveText("Z1");
    await expect(rows.filter({ hasText: "@fajar" }).locator("td").nth(2)).toHaveText("Z1, Z2");
    selisih('Zona tugas juga ditampilkan untuk Admin/Owner sebagai "Semua zona" (bukan khusus driver).');

    // 6. Verifikasi: setiap baris punya status Aktif/Nonaktif dan tombol aksi
    for (let i = 0; i < 6; i++) {
      const row = rows.nth(i);
      await expect(row.locator("td").nth(4)).toHaveText(/^(Aktif|Nonaktif)$/);
      await expect(row.getByRole("button", { name: /^Ubah akun/ })).toHaveCount(1);
      await expect(row.getByRole("button", { name: /^Reset kata sandi/ })).toHaveCount(1);
    }
    // Driver/Admin punya tombol Nonaktifkan; Owner tidak
    await expect(rizkyRow.getByRole("button", { name: /^Nonaktifkan akun/ })).toHaveCount(1);
    await expect(
      rows.filter({ hasText: "@owner" }).getByRole("button", { name: /Nonaktifkan akun/ }),
    ).toHaveCount(0);

    // 7. Screenshot sebagai bukti (TC.OWN.003-list-akun.png)
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.003-list-akun${suffix}.png`),
      fullPage: true,
    });
  });
});
