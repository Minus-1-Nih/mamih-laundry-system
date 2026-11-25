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
  console.log("=== MEMULAI PENGUJIAN BLACKBOX PLAYWRIGHT / AUTOMATION TC.DRV.001 ===");

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
    await page.setViewport({ width: 412, height: 915 }); // mobile viewport

    console.log("[Langkah 1] Membuka halaman login kurir (/masuk/driver)...");
    await page.goto(`${BASE_URL}/masuk/driver`, { waitUntil: "networkidle0" });

    console.log("[Langkah 2] Mengisi form login dengan username 'rizky' dan password 'driver123'...");
    await page.type("#identifier", "rizky");
    await page.type("#password", "driver123");
    await page.click('button[type="submit"]');

    console.log("[Langkah 3] Menunggu navigasi ke /driver...");
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    const currentUrl = page.url();
    console.log("Halaman saat ini:", currentUrl);
    if (!currentUrl.includes("/driver")) {
      throw new Error(`Gagal diarahkan ke /driver, URL saat ini: ${currentUrl}`);
    }

    console.log("\n--- VERIFIKASI EKSPEKTASI TEST CASE TC.DRV.001 ---");

    // 1. Sapaan nama kurir
    const greetingText = await page.$eval("h1", (el) => el.innerText.trim());
    console.log(`1. Sapaan Kurir: "${greetingText}"`);
    if (!greetingText.includes("Halo, Rizky")) {
      throw new Error(`Ekspektasi sapaan "Halo, Rizky", namun didapat "${greetingText}"`);
    }
    console.log("   -> [PASS] Sapaan nama kurir terverifikasi.");

    // 2. Lencana wilayah zona aktif
    const zoneBadgeText = await page.evaluate(() => {
      const badge = Array.from(document.querySelectorAll("span")).find((el) =>
        el.innerText.includes("Zona Z1")
      );
      return badge ? badge.innerText.trim() : null;
    });
    console.log(`2. Lencana Zona: "${zoneBadgeText}"`);
    if (!zoneBadgeText || !zoneBadgeText.includes("Sukabirus")) {
      throw new Error(`Ekspektasi lencana zona Z1 Sukabirus, namun didapat "${zoneBadgeText}"`);
    }
    console.log("   -> [PASS] Lencana zona aktif terverifikasi.");

    // 3. Indikator titik status online hijau
    const isOnlineIndicatorPresent = await page.evaluate(() => {
      const dot = document.querySelector("span[title='Status: Online']");
      const hasGreenClass = dot && dot.classList.contains("bg-emerald-500");
      const btn = Array.from(document.querySelectorAll("button")).some(
        (b) => b.innerText.includes("Online") && b.querySelector(".bg-emerald-500")
      );
      return Boolean(hasGreenClass && btn);
    });
    console.log(`3. Indikator Status Online Hijau: ${isOnlineIndicatorPresent ? "Aktif" : "Tidak Aktif"}`);
    if (!isOnlineIndicatorPresent) {
      throw new Error("Indikator titik status online hijau tidak ditemukan.");
    }
    console.log("   -> [PASS] Indikator status online hijau terverifikasi.");

    // 4. Ringkasan jumlah tugas jemput/antar
    const summary = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasPickup = text.includes("Tugas Penjemputan");
      const hasDelivery = text.includes("Tugas Pengantaran");
      return { hasPickup, hasDelivery };
    });
    console.log(`4. Ringkasan Tugas Harian: Penjemputan = ${summary.hasPickup}, Pengantaran = ${summary.hasDelivery}`);
    if (!summary.hasPickup || !summary.hasDelivery) {
      throw new Error("Ringkasan tugas harian penjemputan/pengantaran tidak lengkap.");
    }
    console.log("   -> [PASS] Ringkasan jumlah tugas harian terverifikasi.");

    // 5. Daftar kartu tugas aktif
    const cardsInfo = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll("article"));
      return articles.map((card) => {
        const code = card.querySelector("span.font-mono")?.innerText.trim();
        const customerName = card.querySelector("h3")?.innerText.trim();
        const waLink = card.querySelector("a[href*='wa.me']")?.getAttribute("href");
        const actionBtn = Array.from(card.querySelectorAll("button")).find(
          (b) =>
            b.innerText.includes("Selesaikan Penjemputan") ||
            b.innerText.includes("Selesaikan Pengantaran")
        )?.innerText.trim();
        return { code, customerName, hasWa: Boolean(waLink), actionBtn };
      });
    });

    console.log(`5. Jumlah Kartu Tugas Aktif Ditemukan: ${cardsInfo.length}`);
    if (cardsInfo.length === 0) {
      throw new Error("Tidak ada kartu tugas aktif yang ditampilkan.");
    }
    console.log("   Contoh Kartu Pertama:", JSON.stringify(cardsInfo[0], null, 2));

    if (!cardsInfo[0].code.startsWith("Z1-")) {
      throw new Error(`Kode pesanan tidak sesuai Zona Z1: ${cardsInfo[0].code}`);
    }
    if (!cardsInfo[0].actionBtn) {
      throw new Error("Tombol aksi spesifik tidak ditemukan pada kartu tugas.");
    }
    console.log("   -> [PASS] Daftar kartu tugas aktif terverifikasi.");

    console.log("\n=======================================================");
    console.log("HASIL AKHIR BLACKBOX TESTING: ALL ASSERTIONS PASSED (100%)");
    console.log("STATUS TEST CASE TC.DRV.001: PASS");
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
