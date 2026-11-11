# Laundria (Mamih Laundry System)

Aplikasi web Capstone **"Laundria"** — Sistem Manajemen Laundry Terpadu Multi-Role berbasis **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Lucide Icons**.

---

## 🎨 Design System & Palette Warna

Aplikasi ini menggunakan palet warna kustom sesuai spesifikasi brand:

| Token | Hex Code | Tampilan | Deskripsi |
| :--- | :--- | :---: | :--- |
| **Primary** | `#2A6F56` | 🟩 | *Sage Green* — Warna utama, tombol aksi, status aktif |
| **Secondary** | `#E8F3EE` | ⬜ | *Soft Sage* — Background kartu, badge, aksen hover |
| **Background** | `#FAF9F6` | 📄 | *Off-White* — Latar belakang halaman aplikasi |
| **Text** | `#1E2421` | ⬛ | *Deep Charcoal* — Tipografi utama yang kontras & nyaman |

---

## 🚀 Arsitektur Multi-Role

Seluruh peran dikelola dalam satu codebase terintegrasi (`src/app`):

1. **Role Admin (ERP)** (`/admin`)
   - Pusat kendali operasional laundry.
   - Monitoring pesanan masuk, antrean mesin cuci, armada driver, dan omset real-time.

2. **Role Driver (EDM)** (`/driver`)
   - Sistem manajemen logistik & pengiriman (*Electronic Delivery Management*).
   - Antarmuka **Mobile-Responsive** dengan Bottom Navigation Bar, status Online/Offline, serta rute Penjemputan (*Pickup*) & Pengantaran (*Delivery*).

3. **Role Pelanggan (EIM)** (`/tracking`)
   - Portal pelacakan resi cucian (*Electronic Inquiry Management*).
   - Timeline progres cuci multi-tahap (Diterima ➔ Cuci ➔ Setrika Uap ➔ Siap Antar ➔ Selesai).

4. **Web Publik & Katalog** (`/public`)
   - Informasi harga layanan kiloan & satuan, kontak WhatsApp outlet, dan garansi higienis.

---

## 🛠️ Menjalankan Proyek Lokal

1. **Install dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```

3. Buka peramban di [http://localhost:3000](http://localhost:3000).

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```
