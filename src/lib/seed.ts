import { isoAt } from "@/lib/demo-date";
import { dateKeyWib, deliveryDateFor } from "@/lib/format";
import type {
  CustomerAddress,
  Order,
  OrderStatus,
  OperationalSession,
  ServiceTier,
  StatusEvent,
  User,
  Zone,
  ZoneId,
} from "@/lib/types";

export const seedZones: Zone[] = [
  { id: "Z1", name: "Sukabirus", area: "Bojongsoang, Kabupaten Bandung" },
  { id: "Z2", name: "Sukapura", area: "Dayeuhkolot, Kabupaten Bandung" },
  { id: "Z3", name: "Ciganitri", area: "Bojongsoang, Kabupaten Bandung" },
];

export const seedAddresses: CustomerAddress[] = [
  {
    id: "addr-adinda-rumah",
    customerId: "u-adinda",
    label: "Rumah",
    address: "Jl. Sukabirus No. 12, Kos Mawar",
    note: "Patokan: dekat gerbang utama",
    zoneId: "Z1",
    primary: true,
  },
  {
    id: "addr-adinda-kos",
    customerId: "u-adinda",
    label: "Kos",
    address: "Jl. Sukabirus No. 24, Kos Anggrek",
    note: "Pagar hijau, sebelah warung kopi",
    zoneId: "Z1",
    primary: false,
  },
  {
    id: "addr-adinda-kantor",
    customerId: "u-adinda",
    label: "Kantor",
    address: "Jl. Sukapura No. 8, Ruko Dayeuhkolot",
    note: "Lantai 2, titip ke resepsionis",
    zoneId: "Z2",
    primary: false,
  },
];

export const seedSessions: OperationalSession[] = [
  { type: "pickup", start: "08.00", cutoff: "16.00", end: "17.00", capacity: 20, open: true },
  { type: "delivery", start: "17.00", cutoff: "16.00", end: "21.00", capacity: 12, open: true },
];

export const seedUsers: User[] = [
  {
    id: "u-owner",
    name: "Sari",
    username: "owner",
    email: "sari@laundria.id",
    phone: "0812-1000-0001",
    password: "owner123",
    role: "admin",
    adminLevel: "owner",
    active: true,
    createdAt: isoAt("2026-10-01", "09:00"),
    lastLoginAt: isoAt("2026-11-04", "13:30"),
  },
  {
    id: "u-admin",
    name: "Nadia",
    username: "admin",
    email: "nadia@laundria.id",
    phone: "0812-1000-0002",
    password: "admin123",
    role: "admin",
    adminLevel: "store",
    active: true,
    createdAt: isoAt("2026-10-01", "09:10"),
    lastLoginAt: isoAt("2026-11-04", "13:20"),
  },
  {
    id: "u-rizky",
    name: "Rizky",
    username: "rizky",
    email: "rizky@laundria.id",
    phone: "0812-2000-0001",
    password: "driver123",
    role: "driver",
    zoneIds: ["Z1"],
    active: true,
    createdAt: isoAt("2026-10-02", "09:00"),
    lastLoginAt: isoAt("2026-11-04", "12:55"),
  },
  {
    id: "u-fajar",
    name: "Fajar",
    username: "fajar",
    email: "fajar@laundria.id",
    phone: "0812-2000-0002",
    password: "driver123",
    role: "driver",
    zoneIds: ["Z1", "Z2"],
    active: true,
    createdAt: isoAt("2026-10-02", "09:10"),
    lastLoginAt: isoAt("2026-11-04", "13:05"),
  },
  {
    id: "u-dimas",
    name: "Dimas",
    username: "dimas",
    email: "dimas@laundria.id",
    phone: "0812-2000-0003",
    password: "driver123",
    role: "driver",
    zoneIds: ["Z2"],
    active: true,
    createdAt: isoAt("2026-10-02", "09:20"),
    lastLoginAt: isoAt("2026-11-04", "12:40"),
  },
  {
    id: "u-bayu",
    name: "Bayu",
    username: "bayu",
    email: "bayu@laundria.id",
    phone: "0812-2000-0004",
    password: "driver123",
    role: "driver",
    zoneIds: ["Z3"],
    active: true,
    createdAt: isoAt("2026-10-02", "09:30"),
    lastLoginAt: isoAt("2026-11-04", "12:30"),
  },
  {
    id: "u-adinda",
    name: "Adinda Putri",
    username: "adinda",
    email: "adinda.putri@gmail.com",
    phone: "0813-0000-0001",
    password: "customer123",
    role: "customer",
    active: true,
    createdAt: isoAt("2026-10-17", "10:00"),
    lastLoginAt: isoAt("2026-11-04", "13:45"),
  },
];

const driverNames: Record<string, string> = {
  "u-rizky": "Rizky",
  "u-fajar": "Fajar",
  "u-dimas": "Dimas",
  "u-bayu": "Bayu",
};

interface OrderSeed {
  code: string;
  customerId?: string;
  customerName: string;
  phone: string;
  service: string;
  tier?: ServiceTier;
  weight: string;
  total: number;
  zoneId: ZoneId;
  schedule: string;
  scheduleDate?: string;
  deliveryDate?: string;
  status: OrderStatus;
  createdAt: string;
  landmark: string;
  driverId?: string;
  note?: string;
  history?: StatusEvent[];
}

function makeOrder(seed: OrderSeed): Order {
  const pickupDate = seed.scheduleDate ?? dateKeyWib(seed.createdAt);
  const deliveryDate = seed.deliveryDate ?? deliveryDateFor(pickupDate, seed.tier);
  const base = { ...seed, scheduleDate: pickupDate, deliveryDate };

  if (seed.history) return { ...base, history: seed.history };

  const baseTime = new Date(seed.createdAt).getTime();
  const at = (hours: number) => new Date(baseTime + hours * 3_600_000).toISOString();
  const actor = seed.driverId ? driverNames[seed.driverId] ?? "Driver" : "Admin";
  const history: StatusEvent[] = [
    { status: "menunggu", at: seed.createdAt, by: "Admin Sari", note: "Pesanan dibuat" },
  ];

  if (seed.status !== "menunggu") {
    history.push({
      status: "dicuci",
      at: at(1),
      by: actor,
      note: "Penjemputan selesai",
    });
  }

  if (seed.status === "dicuci") {
    history.push({ status: "dicuci", at: at(2), by: "Outlet", note: "Sedang dicuci" });
  }

  if (seed.status === "siap" || seed.status === "selesai") {
    history.push({ status: "dicuci", at: at(2), by: "Outlet", note: "Selesai dicuci" });
    history.push({ status: "siap", at: at(3), by: "Admin Nadia", note: "Siap diantar" });
  }

  if (seed.status === "selesai") {
    history.push({
      status: "selesai",
      at: at(5),
      by: actor,
      note: "Diterima pelanggan",
    });
  }

  return { ...base, history };
}

const today = "2026-11-04";

export const seedOrders: Order[] = [
  makeOrder({
    code: "Z1-261104-001",
    customerName: "Nadia Putri",
    phone: "0813-7788-1201",
    service: "Cuci Kering Setrika",
    tier: "reguler",
    weight: "3 kg",
    total: 29_000,
    zoneId: "Z1",
    schedule: "14.00",
    status: "menunggu",
    createdAt: isoAt(today, "13:40"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar, patokan gerbang biru dekat minimarket.",
    driverId: "u-rizky",
  }),
  makeOrder({
    code: "Z1-261104-002",
    customerName: "Rina Lestari",
    phone: "0812-9100-4452",
    service: "Cuci Kering Setrika",
    tier: "express",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z1",
    schedule: "14.20",
    status: "dicuci",
    createdAt: isoAt(today, "10:00"),
    landmark: "Jl. Sukabirus No. 24, Kos Anggrek, patokan seberang warung Bu Tini.",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z2-261104-003",
    customerName: "Andi Pratama",
    phone: "0857-2200-3816",
    service: "Express",
    weight: "5 kg",
    total: 45_000,
    zoneId: "Z2",
    schedule: "15.00",
    status: "siap",
    createdAt: isoAt(today, "08:00"),
    landmark: "Kos Biru, Jl. Sukapura No. 42",
    driverId: "u-dimas",
    note: "Ambil setelah jam 15.00",
  }),
  makeOrder({
    code: "Z3-261104-004",
    customerName: "Dewi Anggraini",
    phone: "0821-5010-7723",
    service: "Setrika",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z3",
    schedule: "15.15",
    deliveryDate: "2026-11-04",
    status: "selesai",
    createdAt: isoAt(today, "07:00"),
    landmark: "Jl. Ciganitri No. 8, Kos Melati",
    driverId: "u-bayu",
  }),
  makeOrder({
    code: "Z2-261104-005",
    customerName: "Siti Rahma",
    phone: "0812-3456-7820",
    service: "Cuci Kering Setrika",
    tier: "reguler",
    weight: "3,5 kg",
    total: 32_000,
    zoneId: "Z2",
    schedule: "12.00",
    status: "menunggu",
    createdAt: isoAt(today, "11:49"),
    landmark: "Jl. Sukapura No. 18, Kos Melati, pagar putih",
    driverId: "u-fajar",
    note: "Pagar putih, dekat warung Bu Tini.",
  }),
  makeOrder({
    code: "Z1-261104-006",
    customerName: "Fajar Nugroho",
    phone: "0813-2211-9087",
    service: "Cuci Kering Setrika",
    weight: "6 kg",
    total: 53_000,
    zoneId: "Z1",
    schedule: "16.30",
    status: "dicuci",
    createdAt: isoAt(today, "09:30"),
    landmark: "Jl. Sukabirus No. 30, Kos Bunga",
    driverId: "u-rizky",
  }),
  makeOrder({
    code: "Z3-261104-007",
    customerName: "Ayu Lestari",
    phone: "0821-7788-3344",
    service: "Express",
    weight: "2,5 kg",
    total: 25_000,
    zoneId: "Z3",
    schedule: "17.00",
    status: "menunggu",
    createdAt: isoAt(today, "13:20"),
    landmark: "Jl. Ciganitri No. 21, Kos Anggrek",
    driverId: "u-bayu",
  }),
  makeOrder({
    code: "Z2-261104-008",
    customerName: "Bagas Pratama",
    phone: "0857-1122-5566",
    service: "Setrika",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z2",
    schedule: "17.30",
    deliveryDate: "2026-11-04",
    status: "siap",
    createdAt: isoAt(today, "08:20"),
    landmark: "Jl. Sukapura No. 7, Kos Biru",
  }),
  makeOrder({
    code: "Z1-261104-009",
    customerName: "Intan Permata",
    phone: "0813-5566-1122",
    service: "Cuci Kering Setrika",
    tier: "express",
    weight: "5 kg",
    total: 45_000,
    zoneId: "Z1",
    schedule: "18.00",
    status: "dicuci",
    createdAt: isoAt(today, "09:10"),
    landmark: "Jl. Sukabirus No. 44, Kos Putri",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z3-261104-010",
    customerName: "Rizky Hidayat",
    phone: "0821-3344-7788",
    service: "Setrika",
    weight: "3 kg",
    total: 29_000,
    zoneId: "Z3",
    schedule: "13.00",
    status: "menunggu",
    createdAt: isoAt(today, "12:40"),
    landmark: "Jl. Ciganitri No. 15, Kos Putra",
    driverId: "u-bayu",
  }),
  makeOrder({
    code: "Z2-261104-011",
    customerName: "Melati Kusuma",
    phone: "0857-8899-1122",
    service: "Cuci Kering Setrika",
    weight: "4,5 kg",
    total: 41_000,
    zoneId: "Z2",
    schedule: "19.00",
    status: "menunggu",
    createdAt: isoAt(today, "13:30"),
    landmark: "Jl. Sukapura No. 33, Kos Melati",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z1-261104-012",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    tier: "reguler",
    weight: "3 kg",
    total: 29_000,
    zoneId: "Z1",
    schedule: "14.00",
    status: "menunggu",
    createdAt: isoAt(today, "13:50"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar",
    driverId: "u-rizky",
    note: "Pisahkan pakaian putih",
  }),
  makeOrder({
    code: "Z3-261104-013",
    customerName: "Lestari Wijaya",
    phone: "0815-4400-1188",
    service: "Cuci Kering Setrika",
    tier: "kilat",
    weight: "5 kg",
    total: 45_000,
    zoneId: "Z3",
    schedule: "16.00",
    status: "dicuci",
    createdAt: isoAt(today, "09:20"),
    landmark: "Jl. Ciganitri No. 42, Kos Bunga, dekat toko sembako, pagar hijau.",
    driverId: "u-bayu",
  }),
  makeOrder({
    code: "Z1-261104-014",
    customerName: "Ahmad Fauzi",
    phone: "0813-9090-1212",
    service: "Express",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z1",
    schedule: "15.30",
    status: "dicuci",
    createdAt: isoAt(today, "09:40"),
    landmark: "Jl. Sukabirus No. 9, Kos Melati",
    driverId: "u-rizky",
  }),
  makeOrder({
    code: "Z2-261104-015",
    customerName: "Sri Wahyuni",
    phone: "0857-3030-4040",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 29_000,
    zoneId: "Z2",
    schedule: "16.00",
    deliveryDate: "2026-11-04",
    status: "siap",
    createdAt: isoAt(today, "08:30"),
    landmark: "Jl. Sukapura No. 11, Kos Anggrek",
  }),
  makeOrder({
    code: "Z3-261104-016",
    customerName: "Bayu Setiawan",
    phone: "0821-6060-7070",
    service: "Setrika",
    weight: "2 kg",
    total: 25_000,
    zoneId: "Z3",
    schedule: "18.30",
    deliveryDate: "2026-11-04",
    status: "siap",
    createdAt: isoAt(today, "08:40"),
    landmark: "Jl. Ciganitri No. 5, Kos Biru",
  }),
  makeOrder({
    code: "Z1-261104-017",
    customerName: "Putri Amelia",
    phone: "0813-8080-9090",
    service: "Cuci Kering Setrika",
    tier: "reguler",
    weight: "5,5 kg",
    total: 49_000,
    zoneId: "Z1",
    schedule: "19.30",
    deliveryDate: "2026-11-04",
    status: "selesai",
    createdAt: isoAt(today, "07:20"),
    landmark: "Jl. Sukabirus No. 18, Kos Putri",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z2-261104-018",
    customerName: "Hendra Gunawan",
    phone: "0857-7070-8080",
    service: "Express",
    tier: "express",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z2",
    schedule: "20.00",
    deliveryDate: "2026-11-04",
    status: "selesai",
    createdAt: isoAt(today, "07:30"),
    landmark: "Jl. Sukapura No. 25, Kos Putra",
    driverId: "u-dimas",
  }),
  makeOrder({
    code: "Z1-261103-011",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    weight: "4,5 kg",
    total: 41_000,
    zoneId: "Z1",
    schedule: "12.00",
    status: "dicuci",
    createdAt: isoAt("2026-11-03", "12:05"),
    landmark: "Jl. Sukabirus No. 24, Kos Anggrek",
    driverId: "u-rizky",
    note: "Pisahkan pakaian putih",
    history: [
      { status: "menunggu", at: isoAt("2026-11-03", "12:05"), by: "Admin Sari", note: "Pesanan diterima" },
      { status: "dicuci", at: isoAt("2026-11-03", "13:05"), by: "Rizky", note: "Penjemputan selesai" },
      { status: "dicuci", at: isoAt("2026-11-04", "13:10"), by: "Outlet", note: "Sedang dicuci" },
    ],
  }),
  makeOrder({
    code: "Z1-261102-009",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    weight: "5 kg",
    total: 45_000,
    zoneId: "Z1",
    schedule: "17.00",
    status: "siap",
    createdAt: isoAt("2026-11-02", "08:00"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z1-261030-007",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    weight: "4 kg",
    total: 37_000,
    zoneId: "Z1",
    schedule: "17.00",
    status: "selesai",
    createdAt: isoAt("2026-10-30", "08:00"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar",
    driverId: "u-rizky",
  }),
  makeOrder({
    code: "Z1-261024-006",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    weight: "6 kg",
    total: 53_000,
    zoneId: "Z1",
    schedule: "17.00",
    status: "selesai",
    createdAt: isoAt("2026-10-24", "08:00"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar",
    driverId: "u-fajar",
  }),
  makeOrder({
    code: "Z1-261017-005",
    customerId: "u-adinda",
    customerName: "Adinda Putri",
    phone: "0813-0000-0001",
    service: "Cuci Kering Setrika",
    weight: "2,5 kg",
    total: 25_000,
    zoneId: "Z1",
    schedule: "17.00",
    status: "selesai",
    createdAt: isoAt("2026-10-17", "08:00"),
    landmark: "Jl. Sukabirus No. 12, Kos Mawar",
    driverId: "u-dimas",
  }),
];
