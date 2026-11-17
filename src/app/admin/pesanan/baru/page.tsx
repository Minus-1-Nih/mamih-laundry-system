"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { statusLabels } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { appBaseUrl, trackingUrl, whatsappLinkTo } from "@/lib/constants";
import { DEMO_NOW, DEMO_NOW_ISO } from "@/lib/demo-date";
import {
  addDaysToKey,
  formatDateKey,
  formatDateKeyShort,
  formatTime,
  nextOrderCode,
  todayKey,
} from "@/lib/format";
import {
  countRequired,
  parseOrderMessage,
  parsedFieldLabels,
  sampleOrderMessage,
  validateParsedOrder,
  type ParsedOrder,
} from "@/lib/parse-order";
import { orderConfirmationMessage } from "@/lib/order-messages";
import { findSimilarOrder } from "@/lib/selectors";
import { findServiceByLabel, serviceCatalog } from "@/lib/service-catalog";
import { useAppStore } from "@/lib/store";
import type { Order, ServiceTier, SessionType, ZoneId } from "@/lib/types";

const blankMessage = `PESANAN LAUNDRY
Nama:
No HP:
Layanan:
Paket: Reguler / Express / Kilat
Zona:
Patokan:
Sesi: Penjemputan / Pengantaran
Jadwal: 4 Nov, 14:00
Catatan:`;

const knownFields = [
  "Nama",
  "No HP",
  "Layanan",
  "Paket",
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

function toInputTime(value: string): string {
  const match = /^(\d{1,2})[.:](\d{2})$/.exec(value);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function fromInputTime(value: string): string {
  return value ? value.replace(":", ".") : "";
}

function dateChipLabel(key: string): string {
  const today = todayKey();
  if (key === today) return `Hari ini · ${formatDateKeyShort(key)}`;
  if (key === addDaysToKey(today, 1)) return `Besok · ${formatDateKeyShort(key)}`;
  return formatDateKey(key);
}

function PanelHead({
  index,
  title,
  note,
  aside,
}: {
  index: string;
  title: string;
  note: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink pb-3">
      <div className="min-w-0">
        <p className="small-print text-accent">{index}</p>
        <h2 className="mt-1.5">{title}</h2>
        <p className="mt-0.5 text-13 text-muted">{note}</p>
      </div>
      {aside}
    </div>
  );
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
  const [warnings, setWarnings] = useState<
    Partial<Record<keyof ParsedOrder, string>>
  >({});
  const [inferred, setInferred] = useState<(keyof ParsedOrder)[]>([]);
  const [unknownLines, setUnknownLines] = useState<string[]>([]);
  const [requiredFound, setRequiredFound] = useState(0);
  const [formError, setFormError] = useState("");
  const [parsedAt, setParsedAt] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [dirty, setDirty] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [dateFromMessage, setDateFromMessage] = useState(false);
  const [duplicate, setDuplicate] = useState<Order | null>(null);

  const missingFields = (
    Object.keys(errors) as (keyof ParsedOrder)[]
  ).filter((field) => errors[field]);

  const missingLabels = missingFields.map(
    (field) => parsedFieldLabels[field],
  );
  const displayCode = missingFields.length === 0 && !formError ? previewCode : "";
  const tiered = Boolean(findServiceByLabel(data?.service ?? "")?.tiered);
  const optionalMissing = data && !data.note ? ["Catatan"] : [];

  const subtitle =
    stage === "input"
      ? "Tempel pesan WhatsApp, parse otomatis, lalu periksa hasilnya sebelum disimpan"
      : formError
        ? "Pesan tidak mengikuti template, periksa kembali"
        : missingFields.length
          ? `${requiredFound} dari 7 field wajib terbaca, lengkapi kolom yang ditandai`
          : `${requiredFound} dari 7 field wajib terbaca, periksa lalu simpan pesanan`;

  function handleRawChange(value: string) {
    setRaw(value);
    if (stage === "parsed") setDirty(true);
  }

  function handleSample() {
    setRaw(sampleOrderMessage);
    document.getElementById("pesan-whatsapp")?.focus();
  }

  function parseText(text: string) {
    const result = parseOrderMessage(text, { today: DEMO_NOW });
    setData(result.data);
    setErrors(result.errors);
    setWarnings(result.warnings);
    setInferred(result.inferred);
    setUnknownLines(result.unknownLines);
    setRequiredFound(result.requiredFound);
    setFormError(result.formError ?? "");
    setParsedAt(formatTime(DEMO_NOW_ISO));
    setPreviewCode(
      result.data.zoneId
        ? nextOrderCode(result.data.zoneId, orders)
        : "",
    );
    setDirty(false);
    setStage("parsed");
    setShowDate(false);
    setDateFromMessage(!result.inferred.includes("scheduleDate"));
    setDuplicate(null);
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
    parseText(trimmed);
  }

  function handleUseSample() {
    setRaw(sampleOrderMessage);
    parseText(sampleOrderMessage);
  }

  function updateField<K extends keyof ParsedOrder>(
    field: K,
    value: ParsedOrder[K],
  ) {
    if (!data) return;
    const next = { ...data, [field]: value };

    if (field === "service") {
      const service = findServiceByLabel(String(value));
      if (!service?.tiered) {
        next.tier = "";
      } else if (!next.tier) {
        next.tier = "reguler";
      }
    }

    const validation = validateParsedOrder(next, { today: DEMO_NOW });
    setData(next);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    setRequiredFound(countRequired(next));
    setDuplicate(null);

    if (field === "zoneId") {
      setPreviewCode(value ? nextOrderCode(value as ZoneId, orders) : "");
    }
    if (field === "scheduleDate") {
      setDateFromMessage(false);
    }
    if (field === "scheduleDate" || field === "tier") {
      setInferred((current) => current.filter((item) => item !== field));
    }
  }

  function handleSave(force = false) {
    if (!data || formError) return;

    const validation = validateParsedOrder(data, { today: DEMO_NOW });
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    if (Object.keys(validation.errors).length > 0) {
      toast({
        title: "Lengkapi field bertanda * sebelum menyimpan.",
        tone: "error",
      });
      return;
    }

    const match = findSimilarOrder(orders, {
      phone: data.phone,
      scheduleDate: data.scheduleDate,
      schedule: data.schedule,
    });
    if (match && !force) {
      setDuplicate(match);
      return;
    }

    const service = findServiceByLabel(data.service);
    const result = createOrder({
      customerName: data.customerName.trim(),
      phone: data.phone,
      service: data.service.trim(),
      serviceId: service?.id,
      tier: data.tier || undefined,
      scheduleDate: data.scheduleDate,
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

    setDuplicate(null);
    setCreatedOrder(result.order);
    toast({ title: "Pesanan tersimpan dan kode dibuat." });
  }

  function resetForm() {
    setRaw("");
    setStage("input");
    setData(null);
    setErrors({});
    setWarnings({});
    setInferred([]);
    setUnknownLines([]);
    setRequiredFound(0);
    setFormError("");
    setParsedAt("");
    setPreviewCode("");
    setDirty(false);
    setCreatedOrder(null);
    setShowDate(false);
    setDateFromMessage(false);
    setDuplicate(null);
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} disalin.` });
    } catch {
      toast({
        title: `Gagal menyalin ${label.toLowerCase()}. Salin manual dari kotak di atas.`,
        tone: "error",
      });
    }
  }

  const baseUrl = createdOrder ? appBaseUrl() : "";
  const successMessage = createdOrder
    ? orderConfirmationMessage(createdOrder, baseUrl)
    : "";
  const successTrackingUrl = createdOrder
    ? trackingUrl(createdOrder.code, baseUrl)
    : "";

  return (
    <>
      <AdminPageHeader title="Input pesanan" subtitle={subtitle} />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="border border-rule bg-paper p-5">
          <PanelHead
            index="01"
            title={stage === "input" ? "Tempel pesan WhatsApp" : "Pesan WhatsApp"}
            note={
              stage === "input"
                ? "Salin template dari pelanggan, lalu tempel di bawah ini."
                : "Pesan asli dari pelanggan, tersimpan sebagai referensi."
            }
          />

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
                  "mt-3 flex items-start gap-1.5 border-l-2 px-3 py-2 text-13",
                  formError || missingFields.length
                    ? "border-waiting-fg bg-waiting-bg text-waiting-fg"
                    : "border-accent bg-accent-soft text-accent",
                )}
              >
                {formError || missingFields.length ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <p>
                  {formError
                    ? formError
                    : missingFields.length
                      ? `${joinLabels(missingLabels)} tidak ditemukan`
                      : `${requiredFound} dari 7 field wajib terbaca tanpa error`}
                  {formError ? "" : `, diparse ${parsedAt}`}
                </p>
              </div>
              {unknownLines.length ? (
                <p className="mt-2 text-13 text-muted">
                  {unknownLines.length} baris tidak dikenali:{" "}
                  {unknownLines.slice(0, 2).join(" · ")}
                  {unknownLines.length > 2 ? " …" : ""}
                </p>
              ) : null}
              {dirty ? (
                <p className="mt-2 text-13 text-waiting-fg">
                  Pesan berubah. Klik Parse ulang untuk memperbarui hasil.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-4">
            <Button
              variant={stage === "input" ? "primary" : "ghost"}
              className={
                stage === "parsed"
                  ? "border border-rule text-accent hover:bg-paper-2"
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
                  className="border border-rule text-accent hover:bg-paper-2"
                  onClick={handleSample}
                >
                  Muat contoh
                </Button>
                <span className="small-print text-muted">Ctrl + V</span>
              </>
            ) : (
              <span className="text-13 text-muted">
                Tempel pesan lain untuk mengganti
              </span>
            )}
          </div>
        </section>

        <section className="border border-rule bg-paper p-5">
          <PanelHead
            index="02"
            title="Hasil parsing"
            note="Periksa tiap field sebelum pesanan disimpan."
            aside={
              stage === "input" ? (
                <span className="small-print flex items-center gap-1.5 text-muted">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-muted/60"
                  />
                  Menunggu pesan
                </span>
              ) : (
                <span
                  className={cn(
                    "small-print flex items-center gap-1.5",
                    missingFields.length ? "text-waiting-fg" : "text-ink",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      missingFields.length ? "bg-waiting-fg" : "bg-done-fg",
                    )}
                  />
                  {formError
                    ? "Perlu template"
                    : missingFields.length
                      ? `${missingFields.length} field perlu dicek`
                      : `${requiredFound}/7 wajib`}
                </span>
              )
            }
          />

          {formError ? (
            <div className="mt-4 border border-danger-fg bg-danger-bg px-4 py-6">
              <p className="text-sm font-semibold text-danger-fg">
                Pesan tidak mengikuti template
              </p>
              <p className="mt-1 text-13 leading-relaxed text-danger-fg">
                Pastikan minimal Nama dan No HP ada, atau salin contoh di panel
                kiri.
              </p>
              <Button variant="secondary" className="mt-4" onClick={handleUseSample}>
                Pakai contoh
              </Button>
            </div>
          ) : stage === "input" || !data ? (
            <>
              <div className="mt-4 flex min-h-[260px] flex-col items-center justify-center border border-dashed border-rule bg-paper-2 px-6 py-10 text-center lg:min-h-[320px]">
                <span className="flex h-11 w-11 items-center justify-center border border-rule bg-paper text-accent">
                  <Check className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-ink">
                  Belum ada pesan yang diparse
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted">
                  Hasil ekstraksi nama, layanan, zona, dan jadwal akan muncul di
                  sini untuk diperiksa.
                </p>
              </div>

              <p className="mt-5 border-t border-rule pt-4 text-sm font-semibold text-ink">
                Field yang dikenali parser
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {knownFields.map((label, index) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 border border-rule bg-paper px-2.5 py-1 text-13 text-ink"
                  >
                    <span className="small-print text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </span>
                ))}
              </div>

              <p className="mt-5 border-t border-rule pt-4 text-sm font-semibold text-ink">
                Contoh format yang valid
              </p>
              <pre className="mt-2 whitespace-pre-wrap border border-rule bg-paper-2 p-4 text-13 leading-relaxed text-muted">
                {sampleOrderMessage}
              </pre>
              <p className="mt-4 text-13 leading-relaxed text-muted">
                Zona menerima kode (Z1) atau nama (Sukabirus).
                <br />
                Sesi menerima Penjemputan/Pickup dan Pengantaran/Delivery.
                <br />
                Jam mengikuti sesi: penjemputan 12.00–17.00, pengantaran
                17.00–22.00.
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
                  <Select
                    id="service"
                    value={data.service}
                    onChange={(event) =>
                      updateField("service", event.target.value)
                    }
                    className={cn(
                      errors.service &&
                        "border-waiting-fg ring-1 ring-waiting-fg",
                    )}
                  >
                    <option value="">Pilih layanan</option>
                    {data.service && !findServiceByLabel(data.service) ? (
                      <option value={data.service}>
                        {data.service} (tidak dikenali)
                      </option>
                    ) : null}
                    <optgroup label="Kiloan">
                      {serviceCatalog
                        .filter((service) => service.tiered)
                        .map((service) => (
                          <option key={service.id} value={service.label}>
                            {service.label}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Satuan">
                      {serviceCatalog
                        .filter((service) => !service.tiered)
                        .map((service) => (
                          <option key={service.id} value={service.label}>
                            {service.label}
                          </option>
                        ))}
                    </optgroup>
                  </Select>
                </Field>

                {tiered ? (
                  <Field
                    label="Paket"
                    htmlFor="paket"
                    error={errors.tier}
                    errorTone="warning"
                    hint={
                      inferred.includes("tier")
                        ? "Reguler (asumsi)"
                        : "Hanya untuk layanan kiloan."
                    }
                  >
                    <Select
                      id="paket"
                      value={data.tier}
                      onChange={(event) =>
                        updateField(
                          "tier",
                          event.target.value as ServiceTier | "",
                        )
                      }
                    >
                      <option value="reguler">Reguler (1–3 hari)</option>
                      <option value="express">Express (6 jam)</option>
                      <option value="kilat">Kilat (3 jam)</option>
                    </Select>
                  </Field>
                ) : null}

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
                  className="sm:col-span-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="jadwal"
                      type="time"
                      value={toInputTime(data.schedule)}
                      onChange={(event) =>
                        updateField("schedule", fromInputTime(event.target.value))
                      }
                      className={cn(
                        "w-32",
                        errors.schedule &&
                          "border-waiting-fg ring-1 ring-waiting-fg",
                      )}
                    />
                    <span
                      className={cn(
                        "text-13",
                        inferred.includes("scheduleDate")
                          ? "text-muted"
                          : "text-ink",
                      )}
                    >
                      {dateChipLabel(data.scheduleDate)}
                    </span>
                    <span className="text-13 text-muted">
                      {inferred.includes("scheduleDate")
                        ? "· asumsi"
                        : dateFromMessage
                          ? "· dari pesan"
                          : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDate((value) => !value)}
                      className="text-13 font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
                    >
                      {showDate ? "Tutup" : "Ganti"}
                    </button>
                  </div>

                  {showDate ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="border border-rule"
                        onClick={() =>
                          updateField("scheduleDate", todayKey())
                        }
                      >
                        Hari ini
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="border border-rule"
                        onClick={() =>
                          updateField(
                            "scheduleDate",
                            addDaysToKey(todayKey(), 1),
                          )
                        }
                      >
                        Besok
                      </Button>
                      <Input
                        type="date"
                        aria-label="Tanggal jadwal"
                        value={data.scheduleDate}
                        onChange={(event) =>
                          updateField(
                            "scheduleDate",
                            event.target.value || todayKey(),
                          )
                        }
                        className="h-9 w-auto text-13"
                      />
                    </div>
                  ) : null}
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

              {optionalMissing.length ? (
                <p className="mt-3 text-13 text-muted">
                  Opsional kosong: {optionalMissing.join(", ")}.
                </p>
              ) : null}

              <div className="mt-5 border border-rule bg-paper-2 px-4 py-3">
                <p className="small-print text-muted">Kode berikutnya</p>
                <p
                  className={cn(
                    "mt-1 font-outlier text-xl font-semibold tracking-[0.06em]",
                    displayCode ? "text-ink" : "text-muted",
                  )}
                >
                  {displayCode || "-"}
                </p>
              </div>
              <p className="mt-2 text-13 text-muted">
                Format kode: ZONA-YYMMDD-URUTAN, contoh Z2-261104-012.
              </p>

              {warnings.schedule ? (
                <div className="mt-4 border border-waiting-fg bg-waiting-bg px-3 py-2.5 text-13 leading-relaxed text-waiting-fg">
                  {warnings.schedule}
                </div>
              ) : null}

              {duplicate ? (
                <div className="mt-4 border border-waiting-fg bg-waiting-bg px-3 py-2.5 text-13 leading-relaxed text-waiting-fg">
                  <p>
                    Pesanan serupa sudah ada: {duplicate.code} ·{" "}
                    {statusLabels[duplicate.status]} · {duplicate.schedule}{" "}
                    WIB. Simpan tetap?
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSave(true)}
                    >
                      Tetap simpan
                    </Button>
                    <Link
                      href={`/admin/pesanan?detail=${duplicate.code}`}
                      className="text-13 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                    >
                      Periksa pesanan
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="border border-rule"
                      onClick={() => setDuplicate(null)}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : null}

              <Button
                className="mt-4 w-full"
                disabled={
                  Object.keys(errors).length > 0 || Boolean(formError)
                }
                onClick={() => handleSave()}
              >
                Simpan &amp; generate kode
              </Button>
              <p className="mt-2 text-13 text-muted">
                Kode siap dikirim ke pelanggan lewat WhatsApp setelah pesanan
                disimpan.
              </p>
            </>
          )}
        </section>
      </div>

      {createdOrder ? (
        <Sheet
          open
          onClose={resetForm}
          title="Pesanan tersimpan"
          description={`Kode ${createdOrder.code}`}
          size="lg"
          footer={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                className="flex-1 border border-rule"
                onClick={resetForm}
              >
                Input pesanan lain
              </Button>
              <a
                href={whatsappLinkTo(createdOrder.phone, successMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-control border border-accent bg-accent px-3.5 text-sm font-medium whitespace-nowrap text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
              >
                Kirim konfirmasi via WhatsApp
              </a>
            </div>
          }
        >
          <div className="flex h-11 w-11 items-center justify-center bg-accent text-accent-ink">
            <Check className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">
            Pesanan masuk antrean
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Kode sudah dibuat otomatis. Kirim pesan berikut ke pelanggan lewat
            WhatsApp; tautan pelacakan sudah ikut di dalamnya.
          </p>

          <div className="mt-4 border border-rule bg-paper-2 px-4 py-3">
            <p className="small-print text-muted">Kode pesanan</p>
            <p className="mt-1 font-outlier text-xl font-semibold tracking-[0.06em] text-ink">
              {createdOrder.code}
            </p>
          </div>

          <p className="mt-4 border-t-2 border-ink pt-3 text-sm font-semibold text-ink">
            Pesan konfirmasi
          </p>
          <pre className="mt-2 whitespace-pre-wrap border border-rule bg-paper-2 p-4 text-13 leading-relaxed text-ink">
            {successMessage}
          </pre>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              className="inline-flex items-center text-13 font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
              onClick={() => void copyText(successMessage, "Pesan konfirmasi")}
            >
              Salin pesan
            </button>
            <button
              type="button"
              className="inline-flex items-center text-13 font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
              onClick={() => void copyText(successTrackingUrl, "Tautan pelacakan")}
            >
              Salin tautan
            </button>
            <Link
              href="/admin/pesanan"
              className="inline-flex items-center text-13 font-medium text-muted underline decoration-rule underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-ink"
            >
              Lihat daftar pesanan
            </Link>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
