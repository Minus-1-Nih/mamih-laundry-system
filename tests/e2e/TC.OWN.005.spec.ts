import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.005
 * Skenario: Positive
 * Deskripsi: Owner menambah akun Driver baru
 * Prekondisi: Owner sudah login dan berada di /admin/akun.
 *
 * Data: akun uji dengan username unik. Store tersimpan di localStorage konteks
 * browser Playwright yang selalu baru, jadi akun uji tidak tersisa setelah tes.
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

test.describe("TC.OWN.005 - Tambah akun Driver", () => {
  test("Owner membuka drawer Tambah akun, mengisi data Driver, dan menyimpan", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";
    const username = `drvuji${Date.now().toString(36)}`;
    const name = "Driver Uji 005";

    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(6);

    // Langkah 1: klik "Tambah akun" -> drawer form muncul
    await page.getByRole("button", { name: /Tambah akun/i }).click();
    const drawer = page.getByRole("dialog", { name: "Tambah akun" });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator("#account-name")).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.005-drawer-open${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: pilih role Driver, isi data, pilih zona Z1 & Z2, simpan
    await drawer.getByRole("button", { name: "Driver", exact: true }).click();
    await drawer.locator("#account-name").fill(name);
    await drawer.locator("#account-username").fill(username);
    await drawer.locator("#account-phone").fill("0812-9000-0005");
    await drawer.locator("#account-password").fill("uji12345");
    await drawer.getByRole("button", { name: /^Z1,/ }).click();
    await drawer.getByRole("button", { name: /^Z2,/ }).click();
    await expect(drawer.getByRole("button", { name: /^Z1,/ })).toHaveAttribute("aria-pressed", "true");
    await expect(drawer.getByRole("button", { name: /^Z2,/ })).toHaveAttribute("aria-pressed", "true");
    await drawer.getByRole("button", { name: "Buat akun" }).click();
    selisih('Tombol simpan bernama "Buat akun", bukan "Simpan".');

    // Verifikasi: drawer tertutup, toast muncul, akun baru ada di tabel
    await expect(drawer).toBeHidden();
    await expect(
      page.getByRole("status").filter({ hasText: `Akun ${name} dibuat.` }),
    ).toBeVisible();
    selisih(`Teks toast "Akun ${name} dibuat.", bukan "Akun berhasil dibuat".`);
    await expect(rows).toHaveCount(7);
    const newRow = rows.filter({ hasText: `@${username}` });
    await expect(newRow).toContainText(name);
    await expect(newRow.locator("td").nth(1)).toHaveText("Driver");
    await expect(newRow.locator("td").nth(2)).toHaveText("Z1, Z2");
    await expect(newRow.locator("td").nth(3)).toHaveText("0812-9000-0005");
    await expect(newRow.locator("td").nth(4)).toHaveText("Aktif");
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.005-create-success${suffix}.png`),
      fullPage: true,
    });
  });
});
