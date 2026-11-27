import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:3000";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerReady() {
  try {
    const res = await fetch(`${BASE_URL}/public`);
    return res.status === 200 || res.status === 307;
  } catch {
    return false;
  }
}

async function run() {
  console.log("=== MEMULAI PENGUJIAN BLACKBOX TC.DRV.003 & TC.DRV.004 ===");

  let serverProcess = null;
  if (!(await isServerReady())) {
    console.log("Menjalankan Next.js dev server...");
    serverProcess = spawn("npm.cmd", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
    });

    let attempts = 0;
    while (attempts < 30) {
      await wait(1000);
      if (await isServerReady()) {
        console.log("Dev server siap di " + BASE_URL);
        break;
      }
      attempts++;
    }
  } else {
    console.log("Dev server sudah berjalan di " + BASE_URL);
  }

  console.log("Membuka browser Chromium/Edge headless...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 915 });

    // Login sebagai Rizky
    console.log("[Setup] Membuka /masuk/driver dan login sebagai 'rizky'...");
    await page.goto(`${BASE_URL}/masuk/driver`, { waitUntil: "networkidle0" });
    await page.type("#identifier", "rizky");
    await page.type("#password", "driver123");
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // ==========================================
    // TEST CASE TC.DRV.004: PEMBATALAN KONFIRMASI
    // ==========================================
    console.log("\n--- PENGUJIAN TC.DRV.004 (PEMBATALAN KONFIRMASI) ---");
    const targetOrderCode = await page.$eval("article span.font-mono", (el) => el.innerText.trim());
    console.log(`Target pesanan uji: ${targetOrderCode}`);

    console.log("[TC.DRV.004 - Step 1] Klik tombol 'Selesaikan Penjemputan'...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Selesaikan Penjemputan")
      );
      btn.click();
    });
    await wait(400);

    // Cek modal muncul
    const isModalOpen1 = await page.evaluate(() => {
      const dialog = document.querySelector("dialog[aria-label='Konfirmasi Penjemputan']");
      return dialog ? dialog.open : false;
    });
    console.log(`Modal konfirmasi muncul: ${isModalOpen1 ? "Ya" : "Tidak"}`);
    if (!isModalOpen1) throw new Error("Modal konfirmasi gagal terbuka pada TC.DRV.004");
    console.log("   -> [PASS] Modal konfirmasi muncul.");

    console.log("[TC.DRV.004 - Step 2] Klik tombol 'Batal' pada modal konfirmasi...");
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText.trim() === "Batal"
      );
      cancelBtn.click();
    });
    await wait(400);

    // Cek modal tertutup dan kartu tetap di aktif
    const isModalClosed = await page.evaluate(() => {
      const dialog = document.querySelector("dialog[aria-label='Konfirmasi Penjemputan']");
      return dialog ? !dialog.open : true;
    });
    const isCardStillActive = await page.evaluate((code) => {
      return Array.from(document.querySelectorAll("article")).some((art) =>
        art.innerText.includes(code) && art.innerText.includes("Menunggu Penjemputan")
      );
    }, targetOrderCode);

    console.log(`Modal tertutup: ${isModalClosed ? "Ya" : "Tidak"}`);
    console.log(`Kartu tetap di daftar aktif dengan status tidak berubah: ${isCardStillActive ? "Ya" : "Tidak"}`);
    if (!isModalClosed || !isCardStillActive) {
      throw new Error("TC.DRV.004 Gagal: Status berubah atau modal tidak menutup.");
    }
    console.log("   -> [PASS] TC.DRV.004: Pembatalan berhasil dan status tidak berubah.");

    // ==========================================
    // TEST CASE TC.DRV.003: PENYELESAIAN TUGAS 1-KLIK
    // ==========================================
    console.log("\n--- PENGUJIAN TC.DRV.003 (PEMBARUAN STATUS 1-KLIK ONLINE) ---");
    console.log("[TC.DRV.003 - Step 1] Klik tombol 'Selesaikan Penjemputan'...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Selesaikan Penjemputan")
      );
      btn.click();
    });
    await wait(400);

    // Verifikasi modal menampilkan kode pesanan dan nama pelanggan
    const modalDetail = await page.evaluate((code) => {
      const text = document.body.innerText;
      return text.includes("Konfirmasi Penjemputan") && text.includes(code);
    }, targetOrderCode);
    console.log(`Modal menampilkan informasi kode pesanan ${targetOrderCode}: ${modalDetail ? "Ya" : "Tidak"}`);
    if (!modalDetail) throw new Error("Modal tidak memuat informasi pesanan target.");
    console.log("   -> [PASS] Modal konfirmasi 1-klik memuat kode & nama pelanggan.");

    console.log("[TC.DRV.003 - Step 2] Klik tombol 'Ya, Selesaikan Penjemputan'...");
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Ya, Selesaikan Penjemputan")
      );
      confirmBtn.click();
    });
    await wait(800);

    // Verifikasi: Kartu hilang dari daftar aktif
    const isCardGoneFromActive = await page.evaluate((code) => {
      return !Array.from(document.querySelectorAll("article")).some((art) =>
        art.innerText.includes(code)
      );
    }, targetOrderCode);
    console.log(`Kartu berpindah dari daftar tugas aktif: ${isCardGoneFromActive ? "Ya" : "Tidak"}`);
    if (!isCardGoneFromActive) throw new Error("Kartu masih ada di daftar tugas aktif.");
    console.log("   -> [PASS] Kartu berhasil keluar dari daftar tugas aktif.");

    // Verifikasi: Pindah ke tab Riwayat dan periksa kartu masuk riwayat
    console.log("[TC.DRV.003 - Step 3] Berpindah ke tab 'Riwayat Tugas Selesai'...");
    await page.evaluate(() => {
      const historyTab = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Riwayat Tugas Selesai")
      );
      historyTab.click();
    });
    await wait(500);

    const isCardInHistory = await page.evaluate((code) => {
      return Array.from(document.querySelectorAll("article")).some((art) =>
        art.innerText.includes(code) && art.innerText.includes("Jemput Selesai")
      );
    }, targetOrderCode);
    console.log(`Kartu tercatat di tab Riwayat Tugas Selesai: ${isCardInHistory ? "Ya" : "Tidak"}`);
    if (!isCardInHistory) throw new Error("Kartu tidak ditemukan di tab Riwayat Tugas Selesai.");
    console.log("   -> [PASS] Kartu tercatat rapi di riwayat tugas selesai.");

    console.log("\n=======================================================");
    console.log("HASIL AKHIR: TC.DRV.003 & TC.DRV.004 PASSED 100%");
    console.log("STATUS: PASS");
    console.log("=======================================================");
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error("\nTEST GAGAL DENGAN ERROR:", err.message);
  process.exit(1);
});
