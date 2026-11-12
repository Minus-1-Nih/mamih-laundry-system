"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { whatsappLinkTo } from "@/lib/constants";
import { DEMO_NOW_ISO } from "@/lib/demo-date";
import { formatTime, nextOrderCode } from "@/lib/format";
import {
  orderWhatsAppMessage,
  parseOrderMessage,
  parsedFieldLabels,
  sampleOrderMessage,
  validateParsedOrder,
  type ParsedOrder,
} from "@/lib/parse-order";
import { useAppStore } from "@/lib/store";
import type { Order, SessionType, ZoneId } from "@/lib/types";

const blankMessage = `PESANAN LAUNDRY
Nama:
No HP:
Layanan:
Zona:
Patokan:
Sesi: Penjemputan / Pengantaran
Jadwal:
Catatan:`;

const knownFields = [
  "Nama",
  "No HP",
  "Layanan",
  "Zona",
  "Patokan",
  "Sesi",
  "Jadwal",
  "Catatan",
];

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} dan ${labels.at(-1)}`;
}

export default function AdminNewOrderPage() {
  const orders = useAppStore((state) => state.orders);
  const createOrder = useAppStore((state) => state.createOrder);
  const { toast } = useToast();

  const [raw, setRaw] = useState("");
  const [stage, setStage] = useState<"input" | "parsed">("input");
  const [data, setData] = useState<ParsedOrder | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ParsedOrder, string>>
  >({});
  const [recognized, setRecognized] = useState(0);
  const [parsedAt, setParsedAt] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [dirty, setDirty] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const missingFields = (
    Object.keys(errors) as (keyof ParsedOrder)[]
  ).filter((field) => errors[field]);

  const missingLabels = missingFields.map(
    (field) => parsedFieldLabels[field],
  );
  const displayCode = missingFields.length === 0 ? previewCode : "";

  const subtitle =
    stage === "input"
      ? "Tempel pesan WhatsApp, parse otomatis, lalu periksa hasilnya sebelum disimpan"
      : missingFields.length
        ? `${recognized} dari 8 field terbaca — lengkapi kolom yang ditandai`
        : `${recognized} dari 8 field terbaca otomatis — periksa lalu simpan pesanan`;

  function handleRawChange(value: string) {
    setRaw(value);
    if (stage === "parsed") setDirty(true);
  }

  function handleSample() {
    setRaw(sampleOrderMessage);
    document.getElementById("pesan-whatsapp")?.focus();
  }

  function handleParse() {
    const trimmed = raw.trim();
    if (!trimmed) {
      toast({
        title: "Tempel pesan WhatsApp terlebih dahulu.",
        tone: "error",
      });
      document.getElementById("pesan-whatsapp")?.focus();
      return;
    }

    const result = parseOrderMessage(trimmed);
    setData(result.data);
    setErrors(result.errors);
    setRecognized(result.recognized);
    setParsedAt(formatTime(DEMO_NOW_ISO));
    setPreviewCode(
      result.data.zoneId
        ? nextOrderCode(result.data.zoneId, orders)
        : "",
    );
    setDirty(false);
    setStage("parsed");
  }

  function updateField<K extends keyof ParsedOrder>(
    field: K,
    value: ParsedOrder[K],
  ) {
    if (!data) return;
    const next = { ...data, [field]: value };
    setData(next);
    setErrors(validateParsedOrder(next));
    if (field === "zoneId") {
      setPreviewCode(value ? nextOrderCode(value as ZoneId, orders) : "");
    }
  }

  function handleSave() {
    if (!data) return;

    const nextErrors = validateParsedOrder(data);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast({
        title: "Lengkapi field bertanda * sebelum menyimpan.",
        tone: "error",
      });
      return;
    }

    const result = createOrder({
      customerName: data.customerName.trim(),
      phone: data.phone,
      service: data.service.trim(),
      weight: "Belum ditimbang",
      total: 0,
      zoneId: data.zoneId as ZoneId,
      session: data.session as SessionType,
      schedule: data.schedule,
      landmark: data.landmark.trim(),
      note: data.note.trim() || undefined,
    });

    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }

    setCreatedOrder(result.order);
    toast({ title: "Pesanan tersimpan dan kode dibuat." });
  }

  function resetForm() {
    setRaw("");
    setStage("input");
    setData(null);
    setErrors({});
    setRecognized(0);
    setParsedAt("");
    setPreviewCode("");
    setDirty(false);
    setCreatedOrder(null);
  }

  async function copyMessage(message: string) {
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: "Pesan WhatsApp disalin." });
    } catch {
      toast({ title: "Gagal menyalin. Salin manual dari kotak pesan.", tone: "error" });
    }
  }

  const successMessage = createdOrder
    ? orderWhatsAppMessage(createdOrder)
    : "";

  return (
    <>
      <AdminPageHeader title="Input pesanan" subtitle={subtitle} />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">
            {stage === "input" ? "Tempel pesan WhatsApp" : "Pesan WhatsApp"}
          </h2>
          <p className="mt-0.5 text-13 text-muted">
            {stage === "input"
              ? "Salin template dari pelanggan, lalu tempel di bawah ini."
              : "Pesan asli dari pelanggan, tersimpan sebagai referensi."}
          </p>

          <Textarea
            id="pesan-whatsapp"
            value={raw}
            onChange={(event) => handleRawChange(event.target.value)}
            placeholder={blankMessage}
            aria-label="Pesan WhatsApp pelanggan"
            className="mt-4 min-h-[340px] lg:min-h-[470px]"
          />

          {stage === "parsed" ? (
            <>
              <div
                className={cn(
                  "mt-3 flex items-start gap-1.5 text-13",
                  missingFields.length ? "text-waiting-fg" : "text-primary",
                )}
              >
                {missingFields.length ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <p>
                  {missingFields.length
                    ? `${joinLabels(missingLabels)} tidak ditemukan`
                    : `${recognized} dari 8 field terbaca tanpa error`}
                  , diparse {parsedAt}
                </p>
              </div>
              {dirty ? (
                <p className="mt-2 text-13 text-waiting-fg">
                  Pesan berubah. Klik Parse ulang untuk memperbarui hasil.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant={stage === "input" ? "primary" : "ghost"}
              className={
                stage === "parsed"
                  ? "border border-border text-primary hover:bg-secondary"
                  : undefined
              }
              onClick={handleParse}
            >
              {stage === "input" ? "Parse pesan" : "Parse ulang"}
            </Button>
            {stage === "input" ? (
              <>
                <Button
                  variant="ghost"
                  className="border border-border text-primary hover:bg-secondary"
                  onClick={handleSample}
                >
                  Muat contoh
                </Button>
                <span className="text-13 text-muted">Ctrl + V</span>
              </>
            ) : (
              <span className="text-13 text-muted">
                Tempel pesan lain untuk mengganti
              </span>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Hasil parsing</h2>
            {stage === "input" ? (
              <span className="rounded-pill bg-track px-2.5 py-1 text-13 font-medium text-muted">
                Menunggu pesan
              </span>
            ) : (
              <span
                className={cn(
                  "rounded-pill px-2.5 py-1 text-13 font-medium",
                  missingFields.length
                    ? "bg-waiting-bg text-waiting-fg"
                    : "bg-secondary text-primary",
                )}
              >
                {missingFields.length
                  ? `${missingFields.length} field hilang`
                  : `${recognized} field terbaca`}
              </span>
            )}
          </div>

          {stage === "input" || !data ? (
            <>
              <div className="mt-4 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-border bg-canvas px-6 py-10 text-center lg:min-h-[320px]">
                <p className="text-sm font-semibold text-ink">
                  Belum ada pesan yang diparse
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted">
                  Hasil ekstraksi nama, layanan, zona, dan jadwal akan muncul di
                  sini untuk diperiksa.
                </p>
              </div>

              <p className="mt-5 text-sm font-semibold text-ink">
                Field yang dikenali parser
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {knownFields.map((label) => (
                  <span
                    key={label}
                    className="rounded-pill bg-secondary px-2.5 py-1 text-13 font-medium text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm font-semibold text-ink">
                Contoh format yang valid
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-canvas p-4 text-13 leading-relaxed text-muted">
                {sampleOrderMessage}
              </pre>
              <p className="mt-4 text-13 leading-relaxed text-muted">
                Zona menerima kode (Z1) atau nama (Sukabirus).
                <br />
                Sesi menerima Penjemputan/Pickup dan Pengantaran/Delivery.
              </p>
            </>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nama pelanggan"
                  htmlFor="nama"
                  required
                  error={errors.customerName}
                  errorTone="warning"
                >
                  <Input
                    id="nama"
                    value={data.customerName}
                    onChange={(event) =>
                      updateField("customerName", event.target.value)
                    }
                    className={cn(
                      errors.customerName &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Nomor HP"
                  htmlFor="phone"
                  required
                  error={errors.phone}
                  errorTone="warning"
                >
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className={cn(
                      errors.phone &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Jenis layanan"
                  htmlFor="service"
                  required
                  error={errors.service}
                  errorTone="warning"
                >
                  <Input
                    id="service"
                    value={data.service}
                    onChange={(event) =>
                      updateField("service", event.target.value)
                    }
                    className={cn(
                      errors.service &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Zona"
                  htmlFor="zona"
                  required
                  error={errors.zoneId}
                  errorTone="warning"
                >
                  <Select
                    id="zona"
                    value={data.zoneId}
                    onChange={(event) =>
                      updateField(
                        "zoneId",
                        event.target.value as ZoneId | "",
                      )
                    }
                    className={cn(
                      errors.zoneId &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  >
                    <option value="">Pilih zona</option>
                    <option value="Z1">Z1, Sukabirus</option>
                    <option value="Z2">Z2, Sukapura</option>
                    <option value="Z3">Z3, Ciganitri</option>
                  </Select>
                </Field>

                <Field
                  label="Patokan alamat"
                  htmlFor="patokan"
                  required
                  error={errors.landmark}
                  errorTone="warning"
                  className="sm:col-span-2"
                >
                  <Input
                    id="patokan"
                    value={data.landmark}
                    onChange={(event) =>
                      updateField("landmark", event.target.value)
                    }
                    className={cn(
                      errors.landmark &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Sesi"
                  htmlFor="sesi"
                  required
                  error={errors.session}
                  errorTone="warning"
                >
                  <Select
                    id="sesi"
                    value={data.session}
                    onChange={(event) =>
                      updateField(
                        "session",
                        event.target.value as SessionType | "",
                      )
                    }
                    className={cn(
                      errors.session &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  >
                    <option value="">Pilih sesi</option>
                    <option value="pickup">Penjemputan</option>
                    <option value="delivery">Pengantaran</option>
                  </Select>
                </Field>

                <Field
                  label="Jadwal"
                  htmlFor="jadwal"
                  required
                  error={errors.schedule}
                  errorTone="warning"
                  hint="4 November 2026, format 24 jam."
                >
                  <Input
                    id="jadwal"
                    value={data.schedule}
                    onChange={(event) =>
                      updateField("schedule", event.target.value)
                    }
                    placeholder="14.00"
                    className={cn(
                      errors.schedule &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Catatan"
                  htmlFor="catatan"
                  error={errors.note}
                  errorTone="warning"
                  className="sm:col-span-2"
                >
                  <Input
                    id="catatan"
                    value={data.note}
                    onChange={(event) =>
                      updateField("note", event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="mt-5 rounded-xl bg-secondary px-4 py-3">
                <p className="text-13 text-muted">Kode pesanan otomatis</p>
                <p
                  className={cn(
                    "mt-0.5 font-mono text-xl font-bold",
                    displayCode ? "text-ink" : "text-muted",
                  )}
                >
                  {displayCode || "—"}
                </p>
              </div>
              <p className="mt-2 text-13 text-muted">
                Format kode: ZONA-YYMMDD-URUTAN, contoh Z2-261104-012.
              </p>

              <Button
                className="mt-4 w-full"
                disabled={missingFields.length > 0}
                onClick={handleSave}
              >
                Simpan &amp; generate kode
              </Button>
              <p className="mt-2 text-13 text-muted">
                Kode siap dikirim ke pelanggan lewat WhatsApp setelah pesanan
                disimpan.
              </p>
            </>
          )}
        </Card>
      </div>

      {createdOrder ? (
        <Sheet
          open
          onClose={resetForm}
          title="Pesanan tersimpan"
          description={`Kode ${createdOrder.code}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 border border-border"
                onClick={resetForm}
              >
                Input pesanan lain
              </Button>
              <Button
                className="flex-1"
                onClick={() => void copyMessage(successMessage)}
              >
                Salin pesan
              </Button>
            </div>
          }
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
            <Check className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">
            Pesanan masuk antrean
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Kode sudah dibuat otomatis. Salin pesan berikut dan kirim ke
            pelanggan lewat WhatsApp.
          </p>

          <div className="mt-4 rounded-xl bg-secondary px-4 py-3">
            <p className="text-13 text-muted">Kode pesanan</p>
            <p className="font-mono text-xl font-bold text-ink">
              {createdOrder.code}
            </p>
          </div>

          <p className="mt-4 text-sm font-semibold text-ink">
            Pesan WhatsApp
          </p>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-canvas p-4 text-13 leading-relaxed text-ink">
            {successMessage}
          </pre>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={whatsappLinkTo(createdOrder.phone, successMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-secondary"
            >
              Buka WhatsApp
            </a>
            <Link
              href="/admin/pesanan"
              className="inline-flex h-11 items-center justify-center rounded-lg px-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Lihat daftar pesanan
            </Link>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
