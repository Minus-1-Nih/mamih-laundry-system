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

export type AddressLabel = "Rumah" | "Kos" | "Kantor";

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: AddressLabel;
  address: string;
  note: string;
  zoneId: ZoneId;
  primary: boolean;
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

export interface OfflineSyncItem {
  id: string;
  orderCode: string;
  status: OrderStatus;
  note?: string;
  timestamp: string;
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
  schedule: string;
  /** YYYY-MM-DD pickup date. Absent on rows created before the date field existed. */
  scheduleDate?: string;
  /** YYYY-MM-DD delivery date. Derived from the pickup date and the tier. */
  deliveryDate?: string;
  serviceId?: string;
  tier?: ServiceTier;
  landmark: string;
  status: OrderStatus;
  createdAt: string;
  history: StatusEvent[];
  /** Driver who holds the current leg, set when the task is claimed or assigned. */
  driverId?: string;
  /** Claim marker. `driverId` alone is a legacy "last actor" value, not a claim. */
  assignedAt?: string;
  assignedBy?: string;
  /** Per-leg attribution, so a delivery by another driver keeps the pickup credit. */
  pickupDriverId?: string;
  deliveryDriverId?: string;
  assignments?: AssignmentEvent[];
  deletedAt?: string;
}

export interface OperationalSession {
  type: SessionType;
  start: string;
  /** Latest time an order can be confirmed into this day's session. */
  cutoff: string;
  end: string;
  /** Orders this session can carry in one day. */
  capacity: number;
  open: boolean;
}
