"use client";

import { useMemo, useState, type FormEvent } from "react";
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
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { ZoneId } from "@/lib/types";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  note: string;
  zoneId: ZoneId;
}

const coordinates: Record<ZoneId, string> = {
  Z1: "-6.9762, 107.6324",
  Z2: "-6.9901, 107.6240",
  Z3: "-6.9948, 107.6390",
};

const markerSpots = [
  { left: "43%", top: "52%" },
  { left: "65%", top: "61%" },
  { left: "54%", top: "37%" },
];

function addressLabel(landmark: string): string {
  return /kos/i.test(landmark) ? "Kos" : "Rumah";
}

function MapCanvas({
  addresses,
  selectedId,
  onSelect,
  ownerName,
}: {
  addresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  ownerName: string;
}) {
  const [zoom, setZoom] = useState(1);
  const selectedIndex = Math.max(
    0,
    addresses.findIndex((item) => item.id === selectedId),
  );
  const selected = addresses[selectedIndex];

  return (
    <div className="relative h-[540px] overflow-hidden rounded-xl border border-border bg-map-ground">
      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -left-10 top-[18%] h-3 w-[120%] -rotate-6 rounded-full bg-white/80" />
          <div className="absolute -left-10 top-[48%] h-4 w-[120%] rotate-3 rounded-full bg-white/90" />
          <div className="absolute left-[26%] top-[-10%] h-[130%] w-3 rotate-12 rounded-full bg-white/80" />
          <div className="absolute left-[62%] top-[-10%] h-[130%] w-2.5 -rotate-6 rounded-full bg-white/70" />
          <div className="absolute -right-8 top-0 h-full w-24 rotate-6 bg-map-water" />
          <div className="absolute left-[8%] top-[62%] h-32 w-40 rounded-[45%] bg-map-park" />
          <div className="absolute left-[40%] top-[6%] h-28 w-36 rounded-[45%] bg-map-park" />
          <div className="absolute left-[70%] top-[70%] h-24 w-28 rounded-[45%] bg-map-park-soft" />
          <div className="absolute left-[10%] top-[6%] h-[86%] w-[80%] rounded-[38%] border-2 border-dashed border-primary/25" />
        </div>

        <p className="absolute left-[34%] top-[34%] text-13 font-medium tracking-[0.14em] text-map-label">
          SUKABIRUS
        </p>
        <p className="absolute right-[6%] top-[46%] text-13 font-medium tracking-[0.14em] text-map-label">
          CITEUREUP
        </p>
        <p className="absolute left-[54%] top-[20%] text-13 text-map-label">
          Taman Telkom
        </p>
        <p className="absolute bottom-[22%] left-[38%] -rotate-3 text-13 text-map-label-soft">
          Jl. Terusan Buah Batu
        </p>
        <p className="absolute left-[10%] top-[46%] -rotate-90 text-13 text-map-label-soft">
          Jl. Sukabirus
        </p>

        <div className="absolute left-[22%] top-[30%] flex flex-col items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-primary shadow">
            <Store className="h-4 w-4" />
          </span>
          <span className="mt-1 rounded bg-surface/90 px-1.5 py-0.5 text-13 text-muted">
            Laundria Sukabirus
          </span>
        </div>

        {addresses.map((address, index) => {
          const spot = markerSpots[index % markerSpots.length];
          const active = address.id === selectedId;
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelect(address.id)}
              style={{ left: spot.left, top: spot.top }}
              aria-label={`Pilih ${address.label} ${address.address}`}
              aria-pressed={active}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  active
                    ? "h-12 w-12 bg-primary text-white shadow-lg ring-8 ring-primary/15"
                    : "h-9 w-9 bg-surface text-primary shadow ring-4 ring-white/70",
                )}
              >
                <Home className={active ? "h-5 w-5" : "h-4 w-4"} />
              </span>
            </button>
          );
        })}

        {selected ? (
          <div
            style={{
              left: markerSpots[selectedIndex % markerSpots.length].left,
              top: `calc(${markerSpots[selectedIndex % markerSpots.length].top} + 40px)`,
            }}
            className="absolute w-56 -translate-x-1/2 rounded-lg bg-surface p-3 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {selected.label} {ownerName}
              </p>
              <Check className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-0.5 text-13 leading-snug text-muted">
              {selected.address}
            </p>
          </div>
        ) : null}
      </div>

      <div className="absolute left-4 top-4 w-[260px] max-w-[calc(100%-2rem)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari jalan, area, atau alamat"
            className="h-11 bg-surface pl-9 shadow-sm"
            aria-label="Cari alamat"
          />
        </div>
      </div>

      <div className="absolute right-4 top-4 w-[120px]">
        <Select
          value={selected?.zoneId ?? "Z1"}
          onChange={(event) => {
            const match = addresses.find(
              (item) => item.zoneId === (event.target.value as ZoneId),
            );
            if (match) onSelect(match.id);
          }}
          aria-label="Filter zona peta"
          className="h-10 bg-surface shadow-sm"
        >
          {(["Z1", "Z2", "Z3"] as ZoneId[]).map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}
          aria-label="Perbesar peta"
          className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(0.9, value - 0.1))}
          aria-label="Perkecil peta"
          className="flex h-9 w-9 items-center justify-center border-t border-border text-ink transition-colors hover:bg-secondary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Kembalikan zoom peta"
          className="flex h-9 w-9 items-center justify-center border-t border-border text-primary transition-colors hover:bg-secondary"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-13 text-ink shadow-sm">
        <MapPin className="h-4 w-4 text-primary" />
        Alamat Anda
        <span className="text-muted">·</span>
        <Store className="h-3.5 w-3.5 text-muted" />
        Gerai Laundria
        <span className="font-medium">100 m</span>
      </div>
    </div>
  );
}

export function LocationClient() {
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const user = useCurrentUser();
  const { toast } = useToast();

  const initial = useMemo<SavedAddress[]>(() => {
    if (!user) return [];
    const seen = new Set<string>();
    const fromOrders = orders
      .filter((order) => order.customerId === user.id && !order.deletedAt)
      .filter((order) => {
        const key = order.landmark.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 3)
      .map((order, index) => ({
        id: `addr-${index}`,
        label: index === 0 ? "Rumah" : addressLabel(order.landmark),
        address: order.landmark,
        note: "Patokan: dekat gerbang utama",
        zoneId: order.zoneId,
      }));

    return fromOrders.length
      ? fromOrders
      : [
          {
            id: "addr-0",
            label: "Rumah",
            address: "Jl. Sukabirus No. 12, Kos Mawar",
            note: "Patokan: gerbang biru dekat minimarket",
            zoneId: "Z1",
          },
        ];
  }, [orders, user]);

  const [saved, setSaved] = useState<SavedAddress[] | null>(null);
  const addresses = saved ?? initial;
  const [selectedIdState, setSelectedId] = useState<string | null>(null);
  const selectedId = selectedIdState ?? addresses[0]?.id ?? "";
  const [sheet, setSheet] = useState<"add" | "edit" | null>(null);
  const [draft, setDraft] = useState({ label: "Rumah", address: "", note: "" });

  const selected =
    addresses.find((item) => item.id === selectedId) ?? addresses[0];
  const zone = selected
    ? zones.find((item) => item.id === selected.zoneId)
    : undefined;

  function openAdd() {
    setDraft({ label: "Rumah", address: "", note: "" });
    setSheet("add");
  }

  function openEdit() {
    if (!selected) return;
    setDraft({
      label: selected.label,
      address: selected.address,
      note: selected.note,
    });
    setSheet("edit");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.address.trim()) {
      toast({ title: "Alamat lengkap wajib diisi.", tone: "error" });
      return;
    }

    if (sheet === "add") {
      const next: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: draft.label,
        address: draft.address.trim(),
        note: draft.note.trim(),
        zoneId: "Z1",
      };
      setSaved((current) => [...(current ?? initial), next]);
      setSelectedId(next.id);
      toast({ title: "Alamat baru ditambahkan." });
    } else if (selected) {
      setSaved((current) =>
        (current ?? initial).map((item) =>
          item.id === selected.id
            ? {
                ...item,
                label: draft.label,
                address: draft.address.trim(),
                note: draft.note.trim(),
              }
            : item,
        ),
      );
      toast({ title: "Alamat diperbarui." });
    }
    setSheet(null);
  }

  if (!user) {
    return (
      <div>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Lokasi dan alamat
          </h1>
          <p className="mt-1 text-sm text-muted">
            Laundria Sukabirus melayani antar jemput di tiga zona berikut.
          </p>
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <Card className="p-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">
                  Gerai Laundria Sukabirus
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Jl. Sukabirus, Bojongsoang, Kabupaten Bandung. Antar jemput
                  tersedia setiap hari pukul 12.00–22.00 WIB.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
              {zones.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-ink">
                    <MapPin className="h-4 w-4 text-primary" />
                    {item.id}, {item.name}
                  </span>
                  <span className="text-right text-13 text-muted">
                    {item.area}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-secondary p-6">
            <h2 className="text-lg font-semibold text-ink">
              Simpan alamat Anda.
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Masuk ke akun untuk menyimpan alamat penjemputan, menandai
              patokan, dan memakai alamat yang sama setiap kali memesan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/masuk"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Masuk akun
              </a>
              <a
                href="/daftar"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface/80"
              >
                Daftar
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Lokasi dan detail alamat
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pilih penanda di peta untuk melihat detail alamat penjemputan dan
            pengantaran.
          </p>
        </div>
        <Button onClick={openAdd}>
          Tambah alamat
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          {selected ? (
            <MapCanvas
              addresses={addresses}
              selectedId={selected.id}
              onSelect={setSelectedId}
              ownerName={user?.name.split(" ")[0] ?? ""}
            />
          ) : null}
          <p className="mt-3 flex items-center gap-2 text-13 text-muted">
            <Check className="h-4 w-4 text-primary" />
            Alamat {selected?.label ?? "Rumah"} termasuk jangkauan antar jemput{" "}
            {selected?.zoneId ?? "Z1"}, Rp5.000 per pesanan.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Titik yang tepat, penjemputan lebih cepat.
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Pastikan penanda berada di pintu masuk dan tambahkan patokan
                  yang mudah ditemukan.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
            >
              Bantuan alamat
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink">Alamat tersimpan</h2>
              <span className="text-13 text-muted">
                {addresses.length} alamat
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {addresses.map((address) => {
                const active = address.id === selected?.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedId(address.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-primary bg-secondary"
                        : "border-border bg-surface hover:border-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        active
                          ? "bg-surface text-primary"
                          : "bg-canvas text-muted",
                      )}
                    >
                      <Home className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">
                        {address.label}
                      </span>
                      <span className="mt-0.5 block text-13 text-muted">
                        {address.address}
                      </span>
                    </span>
                    {active ? (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {selected ? (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {selected.label}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {user?.name ?? "Pelanggan"}
                  </p>
                  <p className="text-13 text-muted">
                    {formatPhone(user?.phone ?? "")}
                  </p>
                </div>
                {selected.id === addresses[0]?.id ? (
                  <span className="rounded-pill bg-secondary px-2.5 py-1 text-13 font-medium text-primary">
                    Alamat utama
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink">
                {selected.address}
              </p>
              <p className="mt-1 text-13 text-muted">
                {zone?.area ?? "Area layanan Laundria"}
              </p>

              {selected.note ? (
                <p className="mt-3 flex gap-2 rounded-lg bg-canvas px-3 py-2.5 text-13 text-muted">
                  <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {selected.note}
                </p>
              ) : null}

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <dt className="text-13 text-muted">Zona layanan</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {selected.zoneId}, {zone?.name ?? "Zona"}
                  </dd>
                </div>
                <div>
                  <dt className="text-13 text-muted">Titik koordinat</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {coordinates[selected.zoneId]}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" className="flex-1" onClick={openEdit}>
                  <PencilLine className="h-4 w-4" />
                  Ubah alamat
                </Button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Petunjuk arah
                  <Navigation className="h-4 w-4" />
                </a>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === "edit" ? "Ubah alamat" : "Tambah alamat"}
        description="Alamat dipakai untuk penjemputan dan pengantaran."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setSheet(null)}>
              Batal
            </Button>
            <Button type="submit" form="address-form">
              Simpan alamat
            </Button>
          </div>
        }
      >
        <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Label alamat" htmlFor="address-label" required>
            <Select
              id="address-label"
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({ ...current, label: event.target.value }))
              }
            >
              <option value="Rumah">Rumah</option>
              <option value="Kos">Kos</option>
              <option value="Kantor">Kantor</option>
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
    </div>
  );
}
