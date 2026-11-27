import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.007
 * Skenario: Positive
 * Deskripsi: Owner mengubah data akun Driver (nomor telepon dan zona tugas)
 * Prekondisi: Owner sudah login di /admin/akun. Akun Driver uji dibuat di
 *             dalam tes ini (akun seed tidak diubah).
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

async function createTestDriver(page: Page, name: string, username: string) {
  await page.getByRole("button", { name: /Tambah akun/i }).click();
  const drawer = page.getByRole("dialog", { name: "Tambah akun" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Driver", exact: true }).click();
  await drawer.locator("#account-name").fill(name);
  await drawer.locator("#account-username").fill(username);
  await drawer.locator("#account-phone").fill("0812-9000-0007");
  await drawer.locator("#account-password").fill("uji12345");
  await drawer.getByRole("button", { name: /^Z1,/ }).click();
  await drawer.getByRole("button", { name: "Buat akun" }).click();
  await expect(drawer).toBeHidden();
}

test.describe("TC.OWN.007 - Ubah akun Driver", () => {
  test("Owner membuka drawer Ubah akun, mengganti telepon dan zona, lalu menyimpan", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";
    const username = `drvuji${Date.now().toString(36)}`;
    const name = "Driver Uji 007";

    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    await createTestDriver(page, name, username);
    const row = page.locator("table tbody tr").filter({ hasText: `@${username}` });
    await expect(row.locator("td").nth(2)).toHaveText("Z1");

    // Langkah 1: klik ikon edit (pensil) -> drawer Ubah akun dengan data lama
    await row.getByRole("button", { name: `Ubah akun ${name}` }).click();
    const drawer = page.getByRole("dialog", { name: "Ubah akun" });
    await expect(drawer).toBeVisible();
    selisih('Judul drawer "Ubah akun", bukan "Edit Akun".');
    await expect(drawer.locator("#account-name")).toHaveValue(name);
    await expect(drawer.locator("#account-username")).toHaveValue(username);
    await expect(drawer.locator("#account-phone")).toHaveValue("0812-9000-0007");
    await expect(drawer.getByRole("button", { name: /^Z1,/ })).toHaveAttribute("aria-pressed", "true");
    await expect(drawer.getByRole("button", { name: /^Z2,/ })).toHaveAttribute("aria-pressed", "false");
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.007-edit-open${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: ubah telepon dan zona (Z1 -> Z2, Z3), klik Simpan perubahan
    await drawer.locator("#account-phone").fill("0812-9000-7777");
    await drawer.getByRole("button", { name: /^Z1,/ }).click();
    await drawer.getByRole("button", { name: /^Z2,/ }).click();
    await drawer.getByRole("button", { name: /^Z3,/ }).click();
    await drawer.getByRole("button", { name: "Simpan perubahan" }).click();

    // Verifikasi: drawer tertutup, toast, tabel terbarui
    await expect(drawer).toBeHidden();
    await expect(
      page.getByRole("status").filter({ hasText: "Perubahan akun disimpan." }),
    ).toBeVisible();
    selisih('Teks toast "Perubahan akun disimpan.", bukan "Perubahan berhasil disimpan".');
    await expect(row.locator("td").nth(2)).toHaveText("Z2, Z3");
    await expect(row.locator("td").nth(3)).toHaveText("0812-9000-7777");
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.007-edit-saved${suffix}.png`),
      fullPage: true,
    });
  });
});
