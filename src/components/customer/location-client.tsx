"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Home,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  PencilLine,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import {
  ADDRESS_LABELS,
  ADDRESS_LIMIT,
  addressesFor,
  filterAddresses,
  type AddressDraft,
} from "@/lib/addresses";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/constants";
import { formatPhone } from "@/lib/format";
import { serviceHours } from "@/lib/sessions";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { AddressLabel, CustomerAddress, Zone, ZoneId } from "@/lib/types";

type ZoneView = ZoneId | "semua";

const ZONE_IDS: ZoneId[] = ["Z1", "Z2", "Z3"];

const coordinates: Record<ZoneId, string> = {
  Z1: "-6.9762, 107.6324",
  Z2: "-6.9901, 107.6240",
  Z3: "-6.9948, 107.6390",
};

// Area tiap zona di peta ilustrasi (persen dari kanvas).
const zoneRegions: Record<ZoneId, { left: number; top: number; width: number; height: number }> = {
  Z1: { left: 14, top: 20, width: 44, height: 44 },
  Z2: { left: 6, top: 68, width: 46, height: 26 },
  Z3: { left: 60, top: 16, width: 28, height: 64 },
};

// Titik penanda di dalam area zona, dipakai bergiliran.
const zoneSpots: [number, number][] = [
  [0.55, 0.6],
  [0.25, 0.35],
  [0.8, 0.3],
  [0.35, 0.8],
  [0.75, 0.75],
];

function markerPosition(address: CustomerAddress, list: CustomerAddress[]) {
  const region = zoneRegions[address.zoneId];
  const index = list.filter((item) => item.zoneId === address.zoneId).indexOf(address);
  const [x, y] = zoneSpots[Math.max(0, index) % zoneSpots.length];
  return {
    left: `${region.left + region.width * x}%`,
    top: `${region.top + region.height * y}%`,
  };
}

function MapCanvas({
  addresses,
  visible,
  selected,
  onSelect,
  zoneView,
  onZoneView,
  query,
  onQuery,
  zones,
  ownerName,
  onAddInZone,
}: {
  addresses: CustomerAddress[];
  visible: CustomerAddress[];
  selected: CustomerAddress | undefined;
  onSelect: (id: string) => void;
  zoneView: ZoneView;
  onZoneView: (zone: ZoneView) => void;
  query: string;
  onQuery: (value: string) => void;
  zones: Zone[];
  ownerName: string;
  onAddInZone: (zone: ZoneId) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const emptyZone = zoneView !== "semua" && visible.length === 0 && !query.trim();
  const emptyZoneInfo = zones.find((zone) => zone.id === zoneView);

  return (
    <div className="relative h-[540px] overflow-hidden border border-rule bg-map-ground">
      <div
        className="absolute inset-0 transition-transform duration-[var(--dur-short)]"
        style={{ transform: `scale(${zoom})` }}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -left-10 top-[18%] h-3 w-[120%] -rotate-6 bg-paper-hi" />
          <div className="absolute -left-10 top-[48%] h-4 w-[120%] rotate-3 bg-paper-hi" />
          <div className="absolute left-[26%] top-[-10%] h-[130%] w-3 rotate-12 bg-paper-hi" />
          <div className="absolute left-[62%] top-[-10%] h-[130%] w-2.5 -rotate-6 bg-paper-hi/80" />
          <div className="absolute -right-8 top-0 h-full w-24 rotate-6 bg-map-water" />
          <div className="absolute left-[8%] top-[62%] h-32 w-40 rounded-[45%] bg-map-park" />
          <div className="absolute left-[40%] top-[6%] h-28 w-36 rounded-[45%] bg-map-park" />
          <div className="absolute left-[70%] top-[70%] h-24 w-28 rounded-[45%] bg-map-park-soft" />
        </div>

        {ZONE_IDS.map((zoneId) => {
          const region = zoneRegions[zoneId];
          const active = zoneView === zoneId;
          const dimmed = zoneView !== "semua" && !active;
          const info = zones.find((zone) => zone.id === zoneId);
          return (
            <button
              key={zoneId}
              type="button"
              onClick={() => onZoneView(active ? "semua" : zoneId)}
              aria-pressed={active}
              aria-label={`Tampilkan zona ${zoneId}, ${info?.name ?? ""}`}
              style={{
                left: `${region.left}%`,
                top: `${region.top}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              className={cn(
                "absolute rounded-[38%] border-2 border-dashed transition-[background-color,border-color,opacity] duration-[var(--dur-micro)]",
                active
                  ? "border-accent bg-accent/10"
                  : "border-ink/20 hover:border-accent/60 hover:bg-accent/5",
                dimmed && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "small-print absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap border px-1.5 py-0.5",
                  active
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-rule bg-paper text-muted",
                )}
              >
                {zoneId}, {info?.name}
              </span>
            </button>
          );
        })}

        <p className="small-print pointer-events-none absolute left-[54%] top-[8%] text-map-label">
          Taman Telkom
        </p>
        <p className="small-print pointer-events-none absolute bottom-[30%] left-[38%] -rotate-3 text-map-label-soft">
          Jl. Terusan Buah Batu
        </p>
        <p className="small-print pointer-events-none absolute left-[8%] top-[40%] -rotate-90 text-map-label-soft">
          Jl. Sukabirus
        </p>

        <div className="pointer-events-none absolute left-[22%] top-[30%] flex flex-col items-center">
          <span className="flex h-9 w-9 items-center justify-center border border-ink bg-paper text-ink">
            <Store className="h-4 w-4" />
          </span>
          <span className="small-print mt-1 border border-rule bg-paper px-1.5 py-0.5 text-muted">
            Laundria Sukabirus
          </span>
        </div>

        {visible.map((address) => {
          const spot = markerPosition(address, addresses);
          const active = address.id === selected?.id;
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelect(address.id)}
              style={spot}
              aria-label={`Pilih ${address.label} ${address.address}`}
              aria-pressed={active}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <span
                className={cn(
                  "flex items-center justify-center border-2 transition-colors duration-[var(--dur-micro)]",
                  active
                    ? "h-12 w-12 border-accent bg-accent text-accent-ink"
                    : "h-9 w-9 border-ink bg-paper text-ink hover:border-accent hover:text-accent",
                )}
              >
                <Home className={active ? "h-5 w-5" : "h-4 w-4"} />
              </span>
            </button>
          );
        })}

        {selected && visible.includes(selected) ? (
          <div
            style={{
              left: markerPosition(selected, addresses).left,
              top: `calc(${markerPosition(selected, addresses).top} + 34px)`,
            }}
            className="pointer-events-none absolute z-20 w-56 -translate-x-1/2 border-2 border-ink bg-paper p-3 shadow-[6px_6px_0_var(--color-paper-3)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {selected.label} {ownerName}
              </p>
              <Check className="h-4 w-4 shrink-0 text-accent" />
            </div>
            <p className="mt-0.5 text-13 leading-snug text-muted">{selected.address}</p>
          </div>
        ) : null}
      </div>

      {emptyZone ? (
        <div className="absolute left-1/2 top-1/2 z-30 w-72 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-paper p-4 text-center">
          <p className="text-sm font-semibold text-ink">
            Belum ada alamat di {zoneView}
            {emptyZoneInfo ? `, ${emptyZoneInfo.name}` : ""}.
          </p>
          <p className="mt-1 text-13 text-muted">{emptyZoneInfo?.area}</p>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => onAddInZone(zoneView as ZoneId)}
          >
            <Plus className="h-4 w-4" />
            Tambah alamat di {zoneView}
          </Button>
        </div>
      ) : null}

      <div className="absolute left-4 top-4 z-30 w-[260px] max-w-[calc(100%-10rem)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Cari jalan, area, atau alamat"
            className="h-11 border-ink bg-paper pl-9"
            aria-label="Cari alamat"
          />
        </div>
      </div>

      <div className="absolute right-4 top-4 z-30 w-[140px]">
        <Select
          value={zoneView}
          onChange={(event) => onZoneView(event.target.value as ZoneView)}
          aria-label="Filter zona peta"
          className="h-10 border-ink bg-paper"
        >
          <option value="semua">Semua zona</option>
          {ZONE_IDS.map((zone) => (
            <option key={zone} value={zone}>
              {zone}, {zones.find((item) => item.id === zone)?.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="absolute bottom-4 right-4 z-30 flex flex-col border border-ink bg-paper">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}
          aria-label="Perbesar peta"
          className="flex h-9 w-9 items-center justify-center text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(0.9, value - 0.1))}
          aria-label="Perkecil peta"
          className="flex h-9 w-9 items-center justify-center border-t border-rule text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            onZoneView("semua");
          }}
          aria-label="Tampilkan seluruh peta"
          className="flex h-9 w-9 items-center justify-center border-t border-rule text-accent transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-30 inline-flex flex-wrap items-center gap-2 border border-rule bg-paper px-3 py-2 text-13 text-ink">
        <MapPin className="h-4 w-4 text-accent" />
        Alamat Anda
        <span aria-hidden="true" className="h-3 w-px bg-rule" />
        <Store className="h-3.5 w-3.5 text-muted" />
        Gerai Laundria
      </div>
    </div>
  );
}

function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5">
      <div className="min-w-0">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function GuestLocation() {
  const zones = useAppStore((state) => state.zones);
  const sessions = useAppStore((state) => state.sessions);
  return (
    <div>
      <PageHead
        title="Lokasi dan alamat"
        subtitle="Laundria Sukabirus melayani antar jemput di tiga zona berikut."
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="border border-rule bg-paper p-6">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-accent-ink">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p className="section-heading">Gerai Laundria Sukabirus</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Jl. Sukabirus, Bojongsoang, Kabupaten Bandung. Antar jemput
                tersedia setiap hari pukul {serviceHours(sessions)}.
              </p>
            </div>
          </div>

          <ul className="mt-6 border-t border-ink">
            {zones.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 border-b border-rule py-3 text-sm"
              >
                <span className="flex items-center gap-2 text-ink">
                  <MapPin className="h-4 w-4 text-accent" />
                  {item.id}, {item.name}
                </span>
                <span className="text-right text-13 text-muted">{item.area}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-rule bg-paper-2 p-6">
          <h2>Simpan alamat Anda.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Masuk ke akun untuk menyimpan alamat penjemputan, menandai patokan,
            dan memakai alamat yang sama setiap kali memesan.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="/masuk"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-accent bg-accent px-4 text-sm font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
            >
              Masuk akun
            </a>
            <a
              href="/daftar"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-ink bg-paper px-4 text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
            >
              Daftar
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

const emptyDraft: AddressDraft = { label: "Rumah", address: "", note: "", zoneId: "Z1" };

export function LocationClient() {
  const user = useCurrentUser();
  if (!user) return <GuestLocation />;
  return <CustomerLocation userId={user.id} name={user.name} phone={user.phone} />;
}

function CustomerLocation({
  userId,
  name,
  phone,
}: {
  userId: string;
  name: string;
  phone: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const zones = useAppStore((state) => state.zones);
  const allAddresses = useAppStore((state) => state.addresses);
  const addAddress = useAppStore((state) => state.addAddress);
  const updateAddress = useAppStore((state) => state.updateAddress);
  const removeAddress = useAppStore((state) => state.removeAddress);
  const setPrimaryAddress = useAppStore((state) => state.setPrimaryAddress);

  const addresses = addressesFor(allAddresses, userId);
  const [zoneView, setZoneView] = useState<ZoneView>("semua");
  const [query, setQuery] = useState("");
  const [selectedIdState, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const visible = filterAddresses(addresses, zoneView, query);
  const selected =
    visible.find((item) => item.id === selectedIdState) ?? visible[0];
  const zone = selected ? zones.find((item) => item.id === selected.zoneId) : undefined;

  // Drawer adalah state URL: ?alamat=baru, ?alamat=<id> (ubah), ?hapus=<id>.
  const alamatParam = searchParams.get("alamat");
  const hapusParam = searchParams.get("hapus");
  const editing = alamatParam && alamatParam !== "baru"
    ? addresses.find((item) => item.id === alamatParam)
    : undefined;
  const formOpen = alamatParam === "baru" || Boolean(editing);
  const deleting = hapusParam ? addresses.find((item) => item.id === hapusParam) : undefined;

  function setParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function closeDrawers() {
    setFormError(null);
    setParams({ alamat: null, hapus: null });
  }

  function changeZone(next: ZoneView) {
    setZoneView(next);
    setSelectedId(null);
  }

  function openAdd(zoneId?: ZoneId) {
    if (addresses.length >= ADDRESS_LIMIT) {
      toast({
        title: `Maksimal ${ADDRESS_LIMIT} alamat. Hapus salah satu dulu.`,
        tone: "error",
      });
      return;
    }
    setFormError(null);
    setDraft({
      ...emptyDraft,
      zoneId: zoneId ?? (zoneView === "semua" ? "Z1" : zoneView),
    });
    setParams({ alamat: "baru", hapus: null });
  }

  function openEdit(address: CustomerAddress) {
    setFormError(null);
    setDraft({
      label: address.label,
      address: address.address,
      note: address.note,
      zoneId: address.zoneId,
    });
    setParams({ alamat: address.id, hapus: null });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing) {
      const result = updateAddress(editing.id, draft);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast({ title: "Alamat diperbarui." });
      if (zoneView !== "semua" && zoneView !== draft.zoneId) setZoneView(draft.zoneId);
      setSelectedId(editing.id);
    } else {
      const result = addAddress(draft);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast({ title: `Alamat baru ditambahkan di ${draft.zoneId}.` });
      setQuery("");
      if (zoneView !== "semua") setZoneView(draft.zoneId);
      setSelectedId(result.address.id);
    }
    closeDrawers();
  }

  function handleDelete() {
    if (!deleting) return;
    const result = removeAddress(deleting.id);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: `Alamat ${deleting.label} dihapus.` });
    setSelectedId(null);
    closeDrawers();
  }

  function handlePrimary(address: CustomerAddress) {
    const result = setPrimaryAddress(address.id);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: `${address.label} menjadi alamat utama.` });
  }

  const zoneNote =
    zoneView === "semua"
      ? `${addresses.length} alamat di ${new Set(addresses.map((item) => item.zoneId)).size} zona.`
      : `${visible.length} alamat di ${zoneView}, ${zones.find((item) => item.id === zoneView)?.name}.`;

  return (
    <div>
      <PageHead
        title="Lokasi dan detail alamat"
        subtitle="Pilih zona atau penanda di peta untuk melihat detail alamat penjemputan dan pengantaran."
        action={
          <Button onClick={() => openAdd()}>
            Tambah alamat
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <MapCanvas
            addresses={addresses}
            visible={visible}
            selected={selected}
            onSelect={setSelectedId}
            zoneView={zoneView}
            onZoneView={changeZone}
            query={query}
            onQuery={(value) => {
              setQuery(value);
              setSelectedId(null);
            }}
            zones={zones}
            ownerName={name.split(" ")[0] ?? ""}
            onAddInZone={openAdd}
          />
          <p className="mt-3 flex items-center gap-2 text-13 text-muted">
            <Check className="h-4 w-4 text-accent" />
            {selected
              ? `Alamat ${selected.label} termasuk jangkauan antar jemput ${selected.zoneId}, Rp5.000 per pesanan.`
              : zoneNote}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-rule bg-paper-2 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper text-accent">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Titik yang tepat, penjemputan lebih cepat.
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Pilih zona yang sesuai dan tambahkan patokan yang mudah ditemukan.
                </p>
              </div>
            </div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Bantuan alamat
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <section className="border border-rule bg-paper p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2>Alamat tersimpan</h2>
              <span className="small-print text-muted">
                {visible.length === addresses.length
                  ? `${addresses.length} alamat`
                  : `${visible.length} dari ${addresses.length} alamat`}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {visible.length === 0 ? (
                <p className="border border-dashed border-rule px-3 py-4 text-center text-13 text-muted">
                  {addresses.length === 0
                    ? "Belum ada alamat tersimpan."
                    : query.trim()
                      ? `Tidak ada alamat yang cocok dengan "${query.trim()}".`
                      : `Belum ada alamat di ${zoneView}.`}
                </p>
              ) : null}
              {visible.map((address) => {
                const active = address.id === selected?.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedId(address.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-start gap-3 border p-3 text-left transition-[background-color,border-color] duration-[var(--dur-micro)]",
                      active
                        ? "border-accent bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]"
                        : "border-rule bg-paper hover:border-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center",
                        active ? "bg-paper text-accent" : "bg-paper-2 text-muted",
                      )}
                    >
                      <Home className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        {address.label}
                        <span className="small-print border border-rule px-1 text-muted">
                          {address.zoneId}
                        </span>
                        {address.primary ? (
                          <span className="small-print text-accent">Utama</span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-13 text-muted">{address.address}</span>
                    </span>
                    {active ? (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {selected ? (
            <section className="border border-rule bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2>{selected.label}</h2>
                  <p className="mt-1 text-sm font-medium text-ink">{name}</p>
                  <p className="text-13 text-muted">{formatPhone(phone)}</p>
                </div>
                {selected.primary ? (
                  <span className="small-print shrink-0 border border-rule px-2 py-1 text-accent">
                    Alamat utama
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePrimary(selected)}
                    className="small-print inline-flex shrink-0 items-center gap-1 border border-rule px-2 py-1 text-muted transition-colors duration-[var(--dur-micro)] hover:border-accent hover:text-accent"
                  >
                    <Star className="h-3 w-3" />
                    Jadikan utama
                  </button>
                )}
              </div>

              <p className="mt-4 border-t border-rule pt-4 text-sm leading-relaxed text-ink">
                {selected.address}
              </p>
              <p className="mt-1 text-13 text-muted">{zone?.area ?? "Area layanan Laundria"}</p>

              {selected.note ? (
                <p className="mt-3 flex gap-2 border-l-2 border-gold bg-paper-2 px-3 py-2.5 text-13 text-muted">
                  <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {selected.note}
                </p>
              ) : null}

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4">
                <div>
                  <dt className="small-print text-muted">Zona layanan</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {selected.zoneId}, {zone?.name ?? "Zona"}
                  </dd>
                </div>
                <div>
                  <dt className="small-print text-muted">Titik koordinat</dt>
                  <dd className="mt-1 font-outlier text-13 text-ink">
                    {coordinates[selected.zoneId]}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => openEdit(selected)}>
                  <PencilLine className="h-4 w-4" />
                  Ubah alamat
                </Button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-control border border-ink bg-paper px-4 text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
                >
                  Petunjuk arah
                  <Navigation className="h-4 w-4" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => setParams({ hapus: selected.id, alamat: null })}
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-danger-fg hover:underline"
              >
                <Trash2 className="h-4 w-4" />
                Hapus alamat
              </button>
            </section>
          ) : null}
        </div>
      </div>

      <Sheet
        open={formOpen}
        onClose={closeDrawers}
        title={editing ? "Ubah alamat" : "Tambah alamat"}
        description="Alamat dipakai untuk penjemputan dan pengantaran."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={closeDrawers}>
              Batal
            </Button>
            <Button type="submit" form="address-form">
              Simpan alamat
            </Button>
          </div>
        }
      >
        <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="border border-danger-fg bg-danger-bg px-3 py-2.5 text-sm text-danger-fg">
              {formError}
            </p>
          ) : null}
          <Field label="Label alamat" htmlFor="address-label" required>
            <Select
              id="address-label"
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({ ...current, label: event.target.value as AddressLabel }))
              }
            >
              {ADDRESS_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Zona layanan"
            htmlFor="address-zone"
            hint={zones.find((item) => item.id === draft.zoneId)?.area}
            required
          >
            <Select
              id="address-zone"
              value={draft.zoneId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, zoneId: event.target.value as ZoneId }))
              }
            >
              {zones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}, {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Alamat lengkap"
            htmlFor="address-line"
            hint="Sertakan nama jalan, nomor, dan nama kos atau gedung."
            required
          >
            <Input
              id="address-line"
              value={draft.address}
              onChange={(event) =>
                setDraft((current) => ({ ...current, address: event.target.value }))
              }
              placeholder="Jl. Sukabirus No. 18, Kos Melati"
            />
          </Field>
          <Field label="Patokan" htmlFor="address-note">
            <Input
              id="address-note"
              value={draft.note}
              onChange={(event) =>
                setDraft((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="Pagar putih, sebelah warung Bu Rini"
            />
          </Field>
        </form>
      </Sheet>

      <Sheet
        open={Boolean(deleting)}
        onClose={closeDrawers}
        title="Hapus alamat"
        description="Alamat yang dihapus tidak bisa dikembalikan."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={closeDrawers}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Hapus alamat
            </Button>
          </div>
        }
      >
        {deleting ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-ink">
              {deleting.label}, {deleting.zoneId}
            </p>
            <p className="text-muted">{deleting.address}</p>
            {deleting.primary && addresses.length > 1 ? (
              <p className="text-13 text-muted">
                Ini alamat utama. Alamat berikutnya akan menjadi alamat utama.
              </p>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
