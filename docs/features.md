# Feature map — Laundria (as built)

What the app does today, verified 2026-11-16 by running the app and logging in as each role. Every row below rendered in the browser; nothing here is planned work. Routes are Next.js pages; drawers are URL state on an existing page. `npm run check` is the done signal; `npm run surfaces` re-verifies every row below in a real browser (start `npm run dev` first).

## Roles

| Role | Seed credentials | Login route | Lands on | Surfaces reachable |
|---|---|---|---|---|
| Guest | — | — | `/public` | Landing, Pelacakan, Lokasi, Sesi, Daftar, Masuk (all variants) |
| Admin (store) | `admin` / `admin123` | `/masuk/admin` | `/admin` | Dashboard, Kelola pesanan, Input pesanan, Zona & Driver, Pelanggan, Laporan, Pengaturan |
| Owner | `owner` / `owner123` | `/masuk/owner` | `/admin` | Every Admin surface, plus Manajemen akun |
| Driver | `rizky` / `driver123` (also `fajar`, `dimas`, `bayu`) | `/masuk/driver` | `/driver` | Tugas driver |
| Customer | `adinda` or `adinda.putri@gmail.com` / `customer123` | `/masuk` | `/akun/riwayat` | Riwayat pesanan, Detail pesanan |

## Surfaces

| Surface | Route | Guard | URL state | Proof it rendered |
|---|---|---|---|---|
| Landing | `/public` | none | — | "Cucian bersih, kembali tanpa repot" |
| Pelacakan publik | `/tracking` | none | `?kode=` | "Cucian Anda sampai di tahap mana?" |
| Lokasi & alamat | `/lokasi` | none | — | "Lokasi dan alamat"; "Laundria Sukabirus melayani antar jemput" |
| Sesi operasional | `/sesi` | none | — | "Informasi sesi operasional" |
| Daftar | `/daftar` | none | — | "Buat akun Laundria." |
| Masuk pelanggan | `/masuk` | none | `?next=` | "Senang melihat Anda lagi." |
| Lupa password | `/lupa-password` | none | — | "Lupa password?" |
| Masuk admin | `/masuk/admin` | none | `?next=` | "Masuk sebagai Admin." |
| Masuk owner | `/masuk/owner` | none | `?next=` | "Masuk sebagai Owner." |
| Masuk driver | `/masuk/driver` | none | `?next=` | "Masuk sebagai Driver." |
| Dashboard | `/admin` | `/admin` layout | — | "Dashboard operasional"; "Rabu, 4 November 2026" |
| Kelola pesanan | `/admin/pesanan` | `/admin` layout | `?detail=`, `?status=`, `?hapus=` | "Menampilkan 11 dari 20 pesanan" |
| Input pesanan | `/admin/pesanan/baru` | `/admin` layout | — | "Tempel pesan WhatsApp" |
| Zona & Driver | `/admin/zona-driver` | `/admin` layout | — | "Belum termasuk cakupan prototipe" |
| Pelanggan | `/admin/pelanggan` | `/admin` layout | — | "Belum termasuk cakupan prototipe" |
| Laporan | `/admin/laporan` | `/admin` layout | — | "Belum termasuk cakupan prototipe" |
| Pengaturan | `/admin/pengaturan` | `/admin` layout | — | "Pengaturan sesi operasional"; "Simpan" |
| Manajemen akun | `/admin/akun` | `/admin` layout + owner | — | "Manajemen akun"; "Tambah akun" |
| Riwayat pesanan | `/akun/riwayat` | `/akun` layout | — | "Riwayat Pesanan"; "Halo, Adinda." |
| Detail pesanan | `/akun/riwayat/detail` | `/akun` layout | `?kode=` | "Detail Pesanan"; "Perjalanan pesanan" |
| Tugas driver | `/driver` | `/driver` layout | — | "Halo, Rizky"; "Daftar Tugas Aktif (2)" |

## Gotchas

- Guards live in layouts, not pages: `/admin`, `/driver`, `/akun`. `/admin/akun` adds a nested owner-only guard (`RoleGuard role="admin" adminLevel="owner"`).
- An `adminLevel` mismatch redirects to `/admin`; a role mismatch redirects to that section's login with `?next=` the current path (e.g. a driver opening `/admin/akun` lands on `/masuk/admin?next=%2Fadmin%2Fakun`).
- State lives in `localStorage["laundria-demo-v2"]`; the profile is stored with it, so a stale profile shows stale data. Clearing site data is the only reset.
- The demo clock is frozen at 4 November 2026, 14.00 WIB (`src/lib/demo-date.ts`); seed dates and every "today" label derive from it.
- `?next=` is honoured only when it starts with `/` and not `//`; `//evil.example` falls back to the role's landing page.
- `/` redirects to `/public` (307), so the landing page is not at the root.
- Drawers are URL state on `/admin/pesanan` (`?detail=`, `?status=`, `?hapus=`) and `/akun/riwayat/detail` / `/tracking` (`?kode=`). Verification opened them by URL; destructive confirm buttons were not executed.
- Status moves forward one stage at a time: the outlet (admin/owner) records Sedang Dicuci and Siap Diantar, the driver records pickup and delivery, and `selesai` is terminal. The admin list also keeps unfinished orders from earlier days.
- Courier tasks are pushed to every driver in the order's zone, but only for the session that is currently running. A driver claims a task before executing it; claimed tasks leave the other drivers' lists, and an overdue task bypasses the session window.
- A claim is tracked by `assignedAt` plus `driverId`. A bare `driverId` on old rows is only the last actor, not a claim. Only the holder (or an admin) can complete a leg, and releasing is possible until the leg is done.
- Admin/owner can reassign or release a courier from the order detail drawer; every claim, release, and reassignment is recorded in the order's assignment log. Pickup and delivery credits are stored per leg (`pickupDriverId` / `deliveryDriverId`), so a different delivery courier does not erase the pickup credit.
- The driver tab badge counts tasks not yet seen in this browser (`seenTaskCodes`). The first `/driver` load seeds the list, so the badge only appears for tasks that arrive later.
- The driver profile sheet has a demo session switch (Penjemputan 14.00 / Pengantaran 18.00) because the demo clock is frozen mid-pickup; the switch only changes `demoMinutes`, not real time.
