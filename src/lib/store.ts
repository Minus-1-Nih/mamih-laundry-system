import { validateFullName, validatePassword } from "@/lib/register-validation";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEMO_NOW, DEMO_NOW_ISO } from "@/lib/demo-date";
import {
  deliveryDateFor,
  nextOrderCode,
  timeToMinutes,
  todayKey,
} from "@/lib/format";
import { seedOrders, seedSessions, seedUsers, seedZones } from "@/lib/seed";
import { bookable, planAllocation } from "@/lib/sessions";
import { canAdvance, statusNotes } from "@/lib/status-flow";
import type {
  AdminLevel,
  Order,
  OrderStatus,
  OperationalSession,
  Role,
  ServiceTier,
  SessionType,
  User,
  ZoneId,
} from "@/lib/types";

type Result<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; error: string };

export interface LoginInput {
  identifier: string;
  password: string;
  expectedRole?: Role;
  expectedLevel?: AdminLevel;
}

export interface CreateUserInput {
  name: string;
  username: string;
  phone: string;
  password: string;
  role: "admin" | "driver";
  zoneIds?: ZoneId[];
}

export interface RegisterCustomerInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateOrderInput {
  customerId?: string;
  customerName: string;
  phone: string;
  service: string;
  weight: string;
  total: number;
  zoneId: ZoneId;
  schedule: string;
  scheduleDate?: string;
  deliveryDate?: string;
  serviceId?: string;
  tier?: ServiceTier;
  landmark: string;
  note?: string;
  driverId?: string;
}

export interface AllocateOrderInput {
  pickupDate?: string;
  deliveryDate?: string;
}

export interface UserPatch {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  zoneIds?: ZoneId[];
  active?: boolean;
}

interface AppState {
  users: User[];
  zones: typeof seedZones;
  orders: Order[];
  sessions: OperationalSession[];
  currentUserId: string | null;
  hydrated: boolean;
  driverOnline: boolean;

  setHydrated: (value: boolean) => void;
  setDriverOnline: (value: boolean) => void;
  login: (input: LoginInput) => Result<{ user: User }>;
  logout: () => void;
  registerCustomer: (input: RegisterCustomerInput) => Result<{ user: User }>;
  createUser: (input: CreateUserInput) => Result<{ user: User }>;
  updateUser: (id: string, patch: UserPatch) => Result;
  deactivateUser: (id: string) => Result;
  activateUser: (id: string) => Result;
  resetPassword: (id: string, password: string) => Result;
  createOrder: (input: CreateOrderInput) => Result<{ order: Order }>;
  updateOrderStatus: (code: string, status: OrderStatus, note?: string) => Result;
  deleteOrder: (code: string) => Result;
  toggleSession: (type: SessionType) => void;
  updateSession: (
    type: SessionType,
    patch: Partial<Omit<OperationalSession, "type">>,
  ) => Result;
  allocateOrder: (code: string, input: AllocateOrderInput) => Result;
  resetDemo: () => void;
}

function actorName(users: User[], currentUserId: string | null): string {
  return users.find((user) => user.id === currentUserId)?.name ?? "Sistem";
}

function ownerGuard(users: User[], currentUserId: string | null): string | null {
  const actor = users.find((user) => user.id === currentUserId);
  if (!actor || actor.role !== "admin" || actor.adminLevel !== "owner") {
    return "Hanya Owner yang dapat mengelola akun Admin dan Driver.";
  }
  return null;
}

function usernameTaken(users: User[], username: string, exceptId?: string): boolean {
  return users.some(
    (user) =>
      user.id !== exceptId && user.username.toLowerCase() === username.toLowerCase(),
  );
}

function emailTaken(users: User[], email: string, exceptId?: string): boolean {
  return users.some(
    (user) => user.id !== exceptId && user.email.toLowerCase() === email.toLowerCase(),
  );
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      zones: seedZones,
      orders: seedOrders,
      sessions: seedSessions,
      currentUserId: null,
      hydrated: false,
      driverOnline: true,

      setHydrated: (value) => set({ hydrated: value }),
      setDriverOnline: (value) => set({ driverOnline: value }),

      login: ({ identifier, password, expectedRole, expectedLevel }) => {
        const needle = identifier.trim().toLowerCase();
        const user = get().users.find(
          (candidate) =>
            candidate.username.toLowerCase() === needle ||
            candidate.email.toLowerCase() === needle,
        );

        if (!user) return { ok: false, error: "Akun tidak ditemukan. Periksa kembali." };
        if (!user.active) return { ok: false, error: "Akun ini sedang nonaktif. Hubungi Owner." };
        if (user.password !== password) return { ok: false, error: "Kata sandi belum tepat." };
        if (expectedRole && user.role !== expectedRole) {
          const label =
            expectedRole === "admin"
              ? expectedLevel === "owner"
                ? "Owner"
                : "Admin"
              : expectedRole === "driver"
                ? "Driver"
                : "Pelanggan";
          return { ok: false, error: `Akun ini bukan akun ${label}.` };
        }
        if (
          expectedRole === "admin" &&
          expectedLevel &&
          user.adminLevel !== expectedLevel
        ) {
          return {
            ok: false,
            error:
              expectedLevel === "owner"
                ? "Akun ini bukan akun Owner."
                : "Akun Owner harus masuk melalui halaman Owner.",
          };
        }

        const updated: User = { ...user, lastLoginAt: DEMO_NOW_ISO };
        set((state) => ({
          users: state.users.map((item) => (item.id === user.id ? updated : item)),
          currentUserId: user.id,
        }));
        return { ok: true, user: updated };
      },

      logout: () => set({ currentUserId: null }),

      registerCustomer: ({ name, email, phone, password }) => {
        const cleanEmail = email.trim().toLowerCase();
        const nameError = validateFullName(name);
        if (nameError) return { ok: false, error: nameError };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return { ok: false, error: "Format email belum tepat." };
        }
        if (emailTaken(get().users, cleanEmail)) {
          return { ok: false, error: "Email sudah terdaftar. Coba masuk." };
        }
        const passwordError = validatePassword(password);
        if (passwordError) return { ok: false, error: passwordError };

        let username = cleanEmail.split("@")[0].replace(/[^a-z0-9._-]/g, "");
        if (!username) username = "pelanggan";
        while (usernameTaken(get().users, username)) username = `${username}1`;

        const user: User = {
          id: `u-${crypto.randomUUID()}`,
          name: name.trim(),
          username,
          email: cleanEmail,
          phone,
          password,
          role: "customer",
          active: true,
          createdAt: DEMO_NOW_ISO,
          lastLoginAt: DEMO_NOW_ISO,
        };

        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.id,
        }));
        return { ok: true, user };
      },

      createUser: ({ name, username, phone, password, role, zoneIds }) => {
        const guard = ownerGuard(get().users, get().currentUserId);
        if (guard) return { ok: false, error: guard };
        if (!name.trim()) return { ok: false, error: "Nama wajib diisi." };
        if (role !== "admin" && role !== "driver") {
          return { ok: false, error: "Akun baru hanya dapat berupa Admin atau Driver." };
        }
        if (!/^[a-z0-9._-]{3,}$/i.test(username)) {
          return {
            ok: false,
            error: "Username minimal 3 karakter, hanya huruf, angka, titik, garis bawah, atau strip.",
          };
        }
        if (usernameTaken(get().users, username)) {
          return { ok: false, error: "Username sudah dipakai." };
        }
        if (password.length < 6) {
          return { ok: false, error: "Kata sandi minimal 6 karakter." };
        }
        if (role === "driver" && (!zoneIds || zoneIds.length === 0)) {
          return { ok: false, error: "Pilih minimal satu zona untuk driver." };
        }

        const user: User = {
          id: `u-${crypto.randomUUID()}`,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: `${username.trim().toLowerCase()}@laundria.id`,
          phone,
          password,
          role,
          adminLevel: role === "admin" ? "store" : undefined,
          zoneIds: role === "driver" ? zoneIds : undefined,
          active: true,
          createdAt: DEMO_NOW_ISO,
        };

        set((state) => ({ users: [...state.users, user] }));
        return { ok: true, user };
      },

      updateUser: (id, patch) => {
        const target = get().users.find((user) => user.id === id);
        if (!target) return { ok: false, error: "Akun tidak ditemukan." };
        if (patch.username && usernameTaken(get().users, patch.username, id)) {
          return { ok: false, error: "Username sudah dipakai." };
        }
        if (patch.email && emailTaken(get().users, patch.email, id)) {
          return { ok: false, error: "Email sudah dipakai." };
        }
        if (target.adminLevel === "owner" && patch.active === false) {
          return { ok: false, error: "Akun Owner tidak dapat dinonaktifkan." };
        }

        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...patch } : user,
          ),
        }));
        return { ok: true };
      },

      deactivateUser: (id) => {
        const state = get();
        const guard = ownerGuard(state.users, state.currentUserId);
        if (guard) return { ok: false, error: guard };
        if (id === state.currentUserId) {
          return { ok: false, error: "Tidak dapat menonaktifkan akun yang sedang dipakai." };
        }
        const target = state.users.find((user) => user.id === id);
        if (!target) return { ok: false, error: "Akun tidak ditemukan." };
        if (target.adminLevel === "owner") {
          return { ok: false, error: "Akun Owner tidak dapat dinonaktifkan." };
        }
        if (target.role === "customer") {
          return { ok: false, error: "Akun Pelanggan dikelola dari halaman Pelanggan." };
        }
        set((current) => ({
          users: current.users.map((user) =>
            user.id === id ? { ...user, active: false } : user,
          ),
        }));
        return { ok: true };
      },

      activateUser: (id) => {
        const guard = ownerGuard(get().users, get().currentUserId);
        if (guard) return { ok: false, error: guard };
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, active: true } : user,
          ),
        }));
        return { ok: true };
      },

      resetPassword: (id, password) => {
        const guard = ownerGuard(get().users, get().currentUserId);
        if (guard) return { ok: false, error: guard };
        if (password.length < 6) {
          return { ok: false, error: "Kata sandi minimal 6 karakter." };
        }
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, password } : user,
          ),
        }));
        return { ok: true };
      },

      createOrder: (input) => {
        const state = get();
        const pickupDate = input.scheduleDate ?? todayKey();
        const pickupCheck = bookable(
          pickupDate,
          "pickup",
          state.sessions,
          state.orders,
          DEMO_NOW,
        );
        if (!pickupCheck.ok) {
          return { ok: false, error: `Penjemputan: ${pickupCheck.reason}` };
        }

        const deliveryDate =
          input.deliveryDate ?? deliveryDateFor(pickupDate, input.tier);
        const deliveryCheck = bookable(
          deliveryDate,
          "delivery",
          state.sessions,
          state.orders,
          DEMO_NOW,
        );
        if (!deliveryCheck.ok) {
          return { ok: false, error: `Pengantaran: ${deliveryCheck.reason}` };
        }

        const code = nextOrderCode(input.zoneId, state.orders);
        const order: Order = {
          ...input,
          code,
          scheduleDate: pickupDate,
          deliveryDate,
          weight: input.weight || "Belum ditimbang",
          status: "menunggu",
          createdAt: DEMO_NOW_ISO,
          history: [
            {
              status: "menunggu",
              at: DEMO_NOW_ISO,
              by: actorName(state.users, state.currentUserId),
              note: "Pesanan dibuat",
            },
          ],
        };
        set((current) => ({ orders: [order, ...current.orders] }));
        return { ok: true, order };
      },

      updateOrderStatus: (code, status, note) => {
        const state = get();
        const order = state.orders.find((item) => item.code === code);
        if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
        const actor = state.users.find((user) => user.id === state.currentUserId);
        if (!actor) {
          return { ok: false, error: "Sesi pengguna tidak ditemukan." };
        }

        const gate = canAdvance(actor.role, order.status, status);
        if (!gate.ok) return gate;

        const by = actor.name;

        set((current) => ({
          orders: current.orders.map((item) =>
            item.code === code
              ? {
                  ...item,
                  status,
                  driverId: actor.role === "driver" ? actor.id : item.driverId,
                  history: [
                    ...item.history,
                    {
                      status,
                      at: DEMO_NOW_ISO,
                      by,
                      note: note?.trim() || statusNotes[status],
                    },
                  ],
                }
              : item,
          ),
        }));
        return { ok: true };
      },

      deleteOrder: (code) => {
        const order = get().orders.find((item) => item.code === code);
        if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
        set((state) => ({
          orders: state.orders.map((item) =>
            item.code === code ? { ...item, deletedAt: DEMO_NOW_ISO } : item,
          ),
        }));
        return { ok: true };
      },

      toggleSession: (type) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.type === type ? { ...session, open: !session.open } : session,
          ),
        }));
      },

      updateSession: (type, patch) => {
        const session = get().sessions.find((item) => item.type === type);
        if (!session) return { ok: false, error: "Sesi tidak ditemukan." };

        const next = { ...session, ...patch };
        if (
          !Number.isFinite(timeToMinutes(next.start)) ||
          !Number.isFinite(timeToMinutes(next.end)) ||
          !Number.isFinite(timeToMinutes(next.cutoff))
        ) {
          return { ok: false, error: "Jam sesi belum lengkap." };
        }
        if (timeToMinutes(next.start) >= timeToMinutes(next.end)) {
          return { ok: false, error: "Jam mulai harus sebelum jam selesai." };
        }
        if (timeToMinutes(next.cutoff) > timeToMinutes(next.end)) {
          return {
            ok: false,
            error: "Batas konfirmasi tidak boleh melewati jam selesai.",
          };
        }
        if (next.capacity < 1) {
          return { ok: false, error: "Kapasitas minimal 1 pesanan." };
        }

        set((state) => ({
          sessions: state.sessions.map((item) =>
            item.type === type ? next : item,
          ),
        }));
        return { ok: true };
      },

      allocateOrder: (code, input) => {
        const state = get();
        const order = state.orders.find((item) => item.code === code);
        if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
        if (order.status === "selesai") {
          return { ok: false, error: "Pesanan sudah selesai dan tidak bisa dipindah." };
        }

        const allocation = planAllocation(
          order,
          input,
          state.sessions,
          state.orders,
          DEMO_NOW,
        );
        if (!allocation.ok) {
          return { ok: false, error: allocation.error };
        }

        set((current) => ({
          orders: current.orders.map((item) =>
            item.code === code
              ? {
                  ...item,
                  scheduleDate: allocation.pickupDate,
                  deliveryDate: allocation.deliveryDate,
                }
              : item,
          ),
        }));
        return { ok: true };
      },

      resetDemo: () =>
        set({
          users: seedUsers,
          zones: seedZones,
          orders: seedOrders,
          sessions: seedSessions,
          currentUserId: null,
          driverOnline: true,
          hydrated: true,
        }),
    }),
    {
      // MNI-7 changed the order shape (session -> deliveryDate). A v1 blob
      // cannot be read safely, so the key moves and the demo reseeds once.
      name: "laundria-demo-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        users: state.users,
        zones: state.zones,
        orders: state.orders,
        sessions: state.sessions,
        currentUserId: state.currentUserId,
        driverOnline: state.driverOnline,
      }),
    },
  ),
);

export function useCurrentUser(): User | null {
  const users = useAppStore((state) => state.users);
  const currentUserId = useAppStore((state) => state.currentUserId);
  return users.find((user) => user.id === currentUserId) ?? null;
}

export function useHydrated(): boolean {
  return useAppStore((state) => state.hydrated);
}
