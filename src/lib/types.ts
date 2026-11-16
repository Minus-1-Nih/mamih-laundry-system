export type Role = "admin" | "driver" | "customer";
export type AdminLevel = "owner" | "store";
export type OrderStatus = "menunggu" | "dicuci" | "siap" | "selesai";
export type SessionType = "pickup" | "delivery";
export type ZoneId = "Z1" | "Z2" | "Z3";
export type ServiceTier = "reguler" | "express" | "kilat";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  adminLevel?: AdminLevel;
  zoneIds?: ZoneId[];
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Zone {
  id: ZoneId;
  name: string;
  area: string;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Order {
  code: string;
  customerId?: string;
  customerName: string;
  phone: string;
  service: string;
  weight: string;
  total: number;
  note?: string;
  zoneId: ZoneId;
  session: SessionType;
  schedule: string;
  /** YYYY-MM-DD. Absent on rows created before the date field existed. */
  scheduleDate?: string;
  serviceId?: string;
  tier?: ServiceTier;
  landmark: string;
  status: OrderStatus;
  createdAt: string;
  history: StatusEvent[];
  driverId?: string;
  deletedAt?: string;
}

export interface OperationalSession {
  type: SessionType;
  start: string;
  end: string;
  open: boolean;
}
