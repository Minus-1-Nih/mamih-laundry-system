import type { ServiceTier } from "@/lib/types";

export type ServiceUnit = "kg" | "pcs" | "meter";

export interface CatalogService {
  id: string;
  label: string;
  unit: ServiceUnit;
  /** Only kiloan services carry a Paket (Reguler / Express / Kilat). */
  tiered: boolean;
  refPrice?: Partial<Record<ServiceTier, number>>;
  aliases: string[];
}

/**
 * PROVISIONAL. Labels and prices come from the shop's price list, but that
 * source is unverified reference data. MNI-5 never computes a total from these
 * prices — the weighing story owns money. Correct labels here, in one place.
 *
 * Kiloan: unit kg, minimum 3 kg (not enforced in this slice).
 * Satuan: unit pcs unless the unit is meter, no tier.
 * `refPrice` on a non-tiered service is stored under `reguler` as a single
 * reference number, not an implied tier.
 */
export const serviceCatalog: CatalogService[] = [
  {
    id: "cuci-setrika",
    label: "Cuci Setrika",
    unit: "kg",
    tiered: true,
    refPrice: { reguler: 7_000, express: 13_000, kilat: 19_000 },
    aliases: ["cuci setrika", "cuci kering setrika", "cuci setrika kering"],
  },
  {
    id: "cuci-kering-lipat",
    label: "Cuci Kering Lipat",
    unit: "kg",
    tiered: true,
    refPrice: { reguler: 6_000, express: 11_000, kilat: 16_000 },
    aliases: ["cuci kering lipat", "cuci kering", "lipat"],
  },
  {
    id: "setrika-saja",
    label: "Setrika Saja",
    unit: "kg",
    tiered: true,
    refPrice: { reguler: 5_000, express: 9_000, kilat: 13_000 },
    aliases: ["setrika saja", "setrika"],
  },
  {
    id: "bed-cover-kecil",
    label: "Bed Cover Kecil",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 27_000 },
    aliases: ["bed cover kecil", "bedcover kecil", "bc kecil"],
  },
  {
    id: "bed-cover-besar",
    label: "Bed Cover Besar",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 38_000 },
    aliases: ["bed cover besar", "bedcover besar", "bc besar"],
  },
  {
    id: "selimut-kecil",
    label: "Selimut Kecil",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 17_000 },
    aliases: ["selimut kecil"],
  },
  {
    id: "selimut-besar",
    label: "Selimut Besar",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 35_000 },
    aliases: ["selimut besar"],
  },
  {
    id: "sprei-set",
    label: "Sprei 1 Set",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 15_000 },
    aliases: ["sprei 1 set", "sprei set", "sprei"],
  },
  {
    id: "handuk",
    label: "Handuk",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 5_000 },
    aliases: ["handuk"],
  },
  {
    id: "sepatu",
    label: "Sepatu",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 30_000 },
    aliases: ["sepatu"],
  },
  {
    id: "jaket",
    label: "Jaket",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 25_000 },
    aliases: ["jaket"],
  },
  {
    id: "jas-blazer",
    label: "Jas / Blazer",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 45_000 },
    aliases: ["jas blazer", "jas", "blazer"],
  },
  {
    id: "dress",
    label: "Dress",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 30_000 },
    aliases: ["dress"],
  },
  {
    id: "sajadah-tipis",
    label: "Sajadah Tipis",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 5_000 },
    aliases: ["sajadah tipis"],
  },
  {
    id: "sajadah-tebal",
    label: "Sajadah Tebal",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 10_000 },
    aliases: ["sajadah tebal"],
  },
  {
    id: "mukena",
    label: "Mukena",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 10_000 },
    aliases: ["mukena"],
  },
  {
    id: "boneka-kecil",
    label: "Boneka Kecil",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 20_000 },
    aliases: ["boneka kecil", "boncka kecil", "boneka", "boncka"],
  },
  {
    id: "boneka-besar",
    label: "Boneka Besar",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 40_000 },
    aliases: ["boneka besar", "boncka besar"],
  },
  {
    id: "helm",
    label: "Helm",
    unit: "pcs",
    tiered: false,
    refPrice: { reguler: 27_000 },
    aliases: ["helm"],
  },
  {
    id: "gorden",
    label: "Gorden",
    unit: "meter",
    tiered: false,
    refPrice: { reguler: 15_000 },
    aliases: ["gorden", "gordyn"],
  },
  {
    id: "vitrase",
    label: "Vitrase",
    unit: "meter",
    tiered: false,
    refPrice: { reguler: 10_000 },
    aliases: ["vitrase"],
  },
  {
    id: "karpet-tipis",
    label: "Karpet Tipis",
    unit: "meter",
    tiered: false,
    refPrice: { reguler: 20_000 },
    aliases: ["karpet tipis"],
  },
  {
    id: "karpet-tebal",
    label: "Karpet Tebal",
    unit: "meter",
    tiered: false,
    refPrice: { reguler: 23_000 },
    aliases: ["karpet tebal"],
  },
];

export function normalizeServiceText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const aliasIndex = serviceCatalog
  .flatMap((service) =>
    service.aliases.map((alias) => ({
      service,
      alias: normalizeServiceText(alias),
    })),
  )
  .sort((a, b) => b.alias.length - a.alias.length);

/** Longest alias wins, so "cuci kering setrika" beats "setrika". */
export function matchService(
  text: string,
): { service: CatalogService; via: "exact" | "alias" } | null {
  const normalized = normalizeServiceText(text);
  if (!normalized) return null;

  const exact = serviceCatalog.find(
    (service) => normalizeServiceText(service.label) === normalized,
  );
  if (exact) return { service: exact, via: "exact" };

  const padded = ` ${normalized} `;
  for (const entry of aliasIndex) {
    if (padded.includes(` ${entry.alias} `)) {
      return { service: entry.service, via: "alias" };
    }
  }
  return null;
}

export function matchTier(text: string): ServiceTier | null {
  const normalized = normalizeServiceText(text);
  if (/\b(express|ekspres)\b/.test(normalized)) return "express";
  if (/\bkilat\b/.test(normalized)) return "kilat";
  if (/\b(reguler|regular)\b/.test(normalized)) return "reguler";
  return null;
}

export function findServiceByLabel(label: string): CatalogService | null {
  return serviceCatalog.find((service) => service.label === label) ?? null;
}

export function tierPrice(service: CatalogService, tier: ServiceTier): number | null {
  return service.refPrice?.[tier] ?? null;
}
