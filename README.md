# Laundria — Mamih Laundry System

Prototipe capstone sistem informasi jemput-antar **Mamih Laundry** dengan tiga peran: **Admin**, **Driver**, dan **Pelanggan**. Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Zustand, dan Lucide.

> Prototipe ini memakai data mock dan `localStorage`. Tidak ada backend, autentikasi produksi, atau pengiriman WhatsApp otomatis.

## Peran dan rute

| Peran | Halaman masuk | Halaman utama |
| :--- | :--- | :--- |
| Pelanggan | `/masuk` | `/tracking`, `/akun/riwayat`, `/lokasi`, `/sesi` |
| Admin | `/masuk/admin` | `/admin`, `/admin/pesanan`, `/admin/pesanan/baru` |
| Owner | `/masuk/owner` | `/admin` + `/admin/akun` |
| Driver | `/masuk/driver` | `/driver` |
| Publik | — | `/public`, `/daftar` |

**Owner bukan aktor keempat.** Sistem tetap memiliki tiga peran. Owner adalah tingkat akses tertinggi dari peran Admin (`adminLevel: "owner"`), sehingga memakai aplikasi `/admin` yang sama dengan tambahan menu **Manajemen akun**.

Halaman admin yang belum termasuk cakupan prototipe — Zona & Driver, Pelanggan, Laporan, dan Pengaturan — memakai placeholder **Segera datang** yang sama.

## Akun demo

| Peran | Nama | Masuk | Kata sandi | Zona |
| :--- | :--- | :--- | :--- | :--- |
| Owner | Sari | `owner` | `owner123` | Semua |
| Admin | Nadia | `admin` | `admin123` | Semua |
| Driver | Rizky | `rizky` | `driver123` | Z1 |
| Driver | Fajar | `fajar` | `driver123` | Z1, Z2 |
| Driver | Dimas | `dimas` | `driver123` | Z2 |
| Driver | Bayu | `bayu` | `driver123` | Z3 |
| Pelanggan | Adinda Putri | `adinda.putri@gmail.com` | `customer123` | Z1 |

Kredensial sengaja tidak ditampilkan di layar masuk. Gunakan tabel ini untuk demo.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman akar diarahkan ke `/public`.

Pemeriksaan produksi:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run start
```

## Data demo

- Data awal: `src/lib/seed.ts` — 6 akun internal, 1 pelanggan, 3 zona, 18 pesanan pada 4 November 2026, dan riwayat pesanan Adinda.
- Jam demo dipatok pada **Rabu, 4 November 2026, 14.00 WIB** (`src/lib/demo-date.ts`).
- Perubahan disimpan di `localStorage` dengan kunci `laundria-demo-v2`.
- Untuk mengembalikan data awal, jalankan di konsol peramban:

```js
localStorage.removeItem("laundria-demo-v2");
location.reload();
```

- Kode pesanan memakai format `Z1-YYMMDD-NNN` dengan urutan harian global. Contoh: `Z1-261104-012`.

## Alur yang bisa dicoba

**Admin / Owner**

- Dashboard: ringkasan pesanan hari ini, pesanan yang perlu perhatian, dan antrean terbaru.
- Input pesanan: tempel pesan WhatsApp, periksa hasil parsing, lalu simpan dan buat pesan balasan berisi kode serta tautan pelacakan.
- Manajemen pesanan: filter zona/status/sesi, urutkan berdasarkan urutan harian, buka detail, ubah status, dan hapus pesanan.
- Manajemen akun (khusus Owner): tambah Admin atau Driver, ubah data, reset kata sandi, dan nonaktifkan akun. Owner tidak dapat menonaktifkan dirinya sendiri atau membuat Owner kedua.

**Driver**

- Tugas aktif dan riwayat sesuai zona driver.
- Aksi penyelesaian: penjemputan mengubah status `menunggu → dicuci`; pengantaran mengubah `siap → selesai`.
- Mode offline manual pada pil status: perubahan tetap tersimpan lokal dengan notifikasi berbeda.

**Pelanggan dan publik**

- `/public`: layanan, cara kerja, jangkauan, jadwal, dan formulir lacak pesanan.
- `/tracking`: pelacakan tanpa masuk akun, lengkap dengan hasil dan keadaan kode tidak ditemukan.
- `/akun/riwayat`: ringkasan dan riwayat pesanan; detail pesanan memakai `?kode=`.
- `/lokasi`: peta bergaya, daftar alamat, serta tambah/ubah alamat.
- `/sesi`: jadwal penjemputan dan pengantaran hari ini.
- `/daftar`: pendaftaran pelanggan baru.

## Catatan implementasi

- Desain mengikuti 24 frame Figma yang diekspor ke `design/reference/` (folder ini diabaikan Git). Driver memakai tab di dalam konten, bukan bottom navigation seperti scaffold awal.
- Halaman yang tidak memiliki frame — `/public` dan placeholder admin — disusun dengan design system yang sama; halaman hasil port tidak diubah temanya.
- Token warna, radius, dan tipografi berada di `src/app/globals.css`. Font dimuat melalui `next/font/google`: Inter, Plus Jakarta Sans (driver), dan JetBrains Mono (kode pesanan).
- Data disimpan melalui Zustand `persist`; tidak ada API route.

## Catatan untuk pembaruan laporan

Perbedaan berikut perlu diselaraskan saat laporan capstone direvisi:

1. Tambahkan catatan bahwa **Owner adalah tingkat akses tertinggi Admin**, bukan aktor keempat.
2. Tambahkan use case **“Mengelola Akun”** untuk Owner.
3. Tambahkan satu baris *functional requirement* untuk manajemen akun internal.
4. Tambahkan atribut `is_owner` (boolean) pada entitas `users` di ERD.
5. Tambahkan bullet UI **“Manajemen Akun (Owner)”** pada daftar halaman admin.
6. Tegaskan bahwa pelanggan **mendaftar sendiri** melalui `/daftar`.
7. Implementasi memakai kode `Z1-YYMMDD-NNN`; istilah `#ML-YYYYMMDD-XXX` tetap dipertahankan di laporan, tetapi tidak dipakai di aplikasi.

## Struktur singkat

```text
src/app/            route App Router (admin, driver, akun, tracking, publik)
src/components/     shell, primitives, dan komponen per peran
src/lib/            store, seed, selector, format, tipe, konstanta
src/app/globals.css token desain dan aturan dasar
design/reference/   24 frame Figma (lokal, tidak di-commit)
```
