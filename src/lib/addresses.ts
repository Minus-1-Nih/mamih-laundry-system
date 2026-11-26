// Alamat tersimpan pelanggan (EIM-05). Fungsi murni: dipakai store dan diuji
// di scripts/tests/addresses.test.ts.

import type { AddressLabel, CustomerAddress, ZoneId } from "@/lib/types";

export const ADDRESS_LABELS: AddressLabel[] = ["Rumah", "Kos", "Kantor"];
export const ADDRESS_LIMIT = 5;

export interface AddressDraft {
  label: AddressLabel;
  address: string;
  note: string;
  zoneId: ZoneId;
}

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

export function validateAddressDraft(draft: AddressDraft): string | null {
  const address = draft.address.trim();
  if (!address) return "Alamat lengkap wajib diisi.";
  if (address.length < 8) return "Alamat terlalu singkat. Sertakan nama jalan dan nomor.";
  if (!ADDRESS_LABELS.includes(draft.label)) return "Label alamat belum dipilih.";
  return null;
}

/** Alamat milik satu pelanggan, alamat utama paling atas. */
export function addressesFor(all: CustomerAddress[], customerId: string): CustomerAddress[] {
  return all
    .filter((item) => item.customerId === customerId)
    .sort((a, b) => Number(b.primary) - Number(a.primary));
}

export function addAddress(
  all: CustomerAddress[],
  customerId: string,
  draft: AddressDraft,
  id: string,
): Result<{ addresses: CustomerAddress[]; address: CustomerAddress }> {
  const error = validateAddressDraft(draft);
  if (error) return { ok: false, error };
  const own = addressesFor(all, customerId);
  if (own.length >= ADDRESS_LIMIT) {
    return { ok: false, error: `Maksimal ${ADDRESS_LIMIT} alamat. Hapus salah satu dulu.` };
  }
  const address: CustomerAddress = {
    id,
    customerId,
    label: draft.label,
    address: draft.address.trim(),
    note: draft.note.trim(),
    zoneId: draft.zoneId,
    primary: own.length === 0,
  };
  return { ok: true, addresses: [...all, address], address };
}

export function updateAddress(
  all: CustomerAddress[],
  customerId: string,
  id: string,
  draft: AddressDraft,
): Result<{ addresses: CustomerAddress[] }> {
  const target = all.find((item) => item.id === id && item.customerId === customerId);
  if (!target) return { ok: false, error: "Alamat tidak ditemukan." };
  const error = validateAddressDraft(draft);
  if (error) return { ok: false, error };
  return {
    ok: true,
    addresses: all.map((item) =>
      item.id === id
        ? {
            ...item,
            label: draft.label,
            address: draft.address.trim(),
            note: draft.note.trim(),
            zoneId: draft.zoneId,
          }
        : item,
    ),
  };
}

/** Menghapus alamat. Jika alamat utama dihapus, alamat berikutnya menjadi utama. */
export function removeAddress(
  all: CustomerAddress[],
  customerId: string,
  id: string,
): Result<{ addresses: CustomerAddress[] }> {
  const target = all.find((item) => item.id === id && item.customerId === customerId);
  if (!target) return { ok: false, error: "Alamat tidak ditemukan." };
  const rest = all.filter((item) => item.id !== id);
  if (!target.primary) return { ok: true, addresses: rest };
  const heir = rest.find((item) => item.customerId === customerId);
  return {
    ok: true,
    addresses: heir
      ? rest.map((item) => (item.id === heir.id ? { ...item, primary: true } : item))
      : rest,
  };
}

export function setPrimaryAddress(
  all: CustomerAddress[],
  customerId: string,
  id: string,
): Result<{ addresses: CustomerAddress[] }> {
  if (!all.some((item) => item.id === id && item.customerId === customerId)) {
    return { ok: false, error: "Alamat tidak ditemukan." };
  }
  return {
    ok: true,
    addresses: all.map((item) =>
      item.customerId === customerId ? { ...item, primary: item.id === id } : item,
    ),
  };
}

/** Penyaring peta dan daftar: zona ("semua" untuk tanpa filter) dan kata kunci. */
export function filterAddresses(
  list: CustomerAddress[],
  zone: ZoneId | "semua",
  query: string,
): CustomerAddress[] {
  const needle = query.trim().toLowerCase();
  return list.filter(
    (item) =>
      (zone === "semua" || item.zoneId === zone) &&
      (!needle ||
        `${item.label} ${item.address} ${item.note}`.toLowerCase().includes(needle)),
  );
}
