"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { sessionLabel } from "@/lib/format";
import {
  closedHours,
  serviceHours,
  sessionWindowLabel,
} from "@/lib/sessions";
import { useAppStore } from "@/lib/store";
import type { OperationalSession, SessionType } from "@/lib/types";

interface DraftSession {
  start: string;
  end: string;
  cutoff: string;
  capacity: string;
  open: boolean;
}

type Draft = Record<SessionType, DraftSession>;
type FieldErrors = Partial<Record<keyof DraftSession, string>>;
type FormErrors = Partial<Record<SessionType, FieldErrors>>;

function toInputTime(value: string): string {
  const match = /^(\d{1,2})[.:](\d{2})$/.exec(value);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function fromInputTime(value: string): string {
  return value ? value.replace(":", ".") : "";
}

function toDraft(sessions: OperationalSession[]): Draft {
  const draft = {} as Draft;
  for (const session of sessions) {
    draft[session.type] = {
      start: toInputTime(session.start),
      end: toInputTime(session.end),
      cutoff: toInputTime(session.cutoff),
      capacity: String(session.capacity),
      open: session.open,
    };
  }
  return draft;
}

function minutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + (minute || 0);
}

function validate(draft: Draft): FormErrors {
  const errors: FormErrors = {};
  for (const type of Object.keys(draft) as SessionType[]) {
    const session = draft[type];
    const fieldErrors: FieldErrors = {};

    if (!session.start) fieldErrors.start = "Jam mulai wajib diisi.";
    if (!session.end) fieldErrors.end = "Jam selesai wajib diisi.";
    if (!session.cutoff) fieldErrors.cutoff = "Batas konfirmasi wajib diisi.";

    if (session.start && session.end && minutes(session.start) >= minutes(session.end)) {
      fieldErrors.end = "Jam selesai harus setelah jam mulai.";
    }
    if (
      session.cutoff &&
      session.end &&
      minutes(session.cutoff) > minutes(session.end)
    ) {
      fieldErrors.cutoff = "Batas konfirmasi tidak boleh melewati jam selesai.";
    }

    const capacity = Number(session.capacity);
    if (!session.capacity || !Number.isInteger(capacity) || capacity < 1) {
      fieldErrors.capacity = "Kapasitas minimal 1 pesanan.";
    }

    if (Object.keys(fieldErrors).length > 0) errors[type] = fieldErrors;
  }
  return errors;
}

export default function AdminSettingsPage() {
  const sessions = useAppStore((state) => state.sessions);
  const updateSession = useAppStore((state) => state.updateSession);
  const { toast } = useToast();

  const [draft, setDraft] = useState<Draft>(() => toDraft(sessions));
  const [source, setSource] = useState(sessions);
  const [errors, setErrors] = useState<FormErrors>({});

  // The persisted store can hydrate after the first client render; follow it
  // so the form never shows seed defaults over a saved config.
  if (source !== sessions) {
    setSource(sessions);
    setDraft(toDraft(sessions));
  }

  function update(
    type: SessionType,
    field: keyof DraftSession,
    value: string | boolean,
  ) {
    setDraft((current) => ({
      ...current,
      [type]: { ...current[type], [field]: value },
    }));
    setErrors((current) => ({ ...current, [type]: undefined }));
  }

  function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({ title: "Periksa kembali pengaturan sesi.", tone: "error" });
      return;
    }

    for (const type of Object.keys(draft) as SessionType[]) {
      const session = draft[type];
      const result = updateSession(type, {
        start: fromInputTime(session.start),
        end: fromInputTime(session.end),
        cutoff: fromInputTime(session.cutoff),
        capacity: Number(session.capacity),
        open: session.open,
      });
      if (!result.ok) {
        toast({ title: result.error, tone: "error" });
        return;
      }
    }

    toast({ title: "Pengaturan sesi disimpan." });
  }

  return (
    <>
      <AdminPageHeader
        title="Pengaturan sesi operasional"
        subtitle="Atur jam, batas konfirmasi, kapasitas, dan status buka tiap sesi"
        action={
          <Button onClick={handleSave}>Simpan</Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(draft) as SessionType[]).map((type) => {
          const session = draft[type];
          const fieldErrors = errors[type] ?? {};
          return (
            <section key={type} className="border border-rule bg-paper">
              <header className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">
                    {sessionLabel(type)}
                  </h2>
                  <p className="mt-0.5 text-13 text-muted">
                    {sessionWindowLabel(type, [
                      {
                        type,
                        start: fromInputTime(session.start),
                        end: fromInputTime(session.end),
                        cutoff: fromInputTime(session.cutoff),
                        capacity: Number(session.capacity),
                        open: session.open,
                      },
                    ])}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-13 text-ink">
                  <input
                    type="checkbox"
                    checked={session.open}
                    onChange={(event) => update(type, "open", event.target.checked)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  {session.open ? "Buka" : "Tutup"}
                </label>
              </header>

              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <Field
                  label="Mulai"
                  htmlFor={`${type}-start`}
                  required
                  error={fieldErrors.start}
                >
                  <Input
                    id={`${type}-start`}
                    type="time"
                    value={session.start}
                    onChange={(event) =>
                      update(type, "start", event.target.value)
                    }
                    className={cn(
                      fieldErrors.start &&
                        "border-danger-fg ring-1 ring-danger-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Selesai"
                  htmlFor={`${type}-end`}
                  required
                  error={fieldErrors.end}
                >
                  <Input
                    id={`${type}-end`}
                    type="time"
                    value={session.end}
                    onChange={(event) => update(type, "end", event.target.value)}
                    className={cn(
                      fieldErrors.end &&
                        "border-danger-fg ring-1 ring-danger-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Batas konfirmasi"
                  htmlFor={`${type}-cutoff`}
                  required
                  error={fieldErrors.cutoff}
                  hint="Pesanan setelah jam ini masuk ke sesi berikutnya."
                >
                  <Input
                    id={`${type}-cutoff`}
                    type="time"
                    value={session.cutoff}
                    onChange={(event) =>
                      update(type, "cutoff", event.target.value)
                    }
                    className={cn(
                      fieldErrors.cutoff &&
                        "border-danger-fg ring-1 ring-danger-fg",
                    )}
                  />
                </Field>

                <Field
                  label="Kapasitas"
                  htmlFor={`${type}-capacity`}
                  required
                  error={fieldErrors.capacity}
                  hint="Jumlah pesanan per hari."
                >
                  <Input
                    id={`${type}-capacity`}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={session.capacity}
                    onChange={(event) =>
                      update(type, "capacity", event.target.value)
                    }
                    className={cn(
                      fieldErrors.capacity &&
                        "border-danger-fg ring-1 ring-danger-fg",
                    )}
                  />
                </Field>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border border-rule bg-paper-2 px-4 py-3 text-13 text-muted">
        <span>
          Jam operasional:{" "}
          <span className="text-ink">{serviceHours(sessions)}</span>
        </span>
        <span>
          Di luar jam: <span className="text-ink">{closedHours(sessions)}</span>
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-13 leading-relaxed text-muted">
        Perubahan jam dan kapasitas hanya berlaku untuk alokasi baru. Pesanan
        yang sudah dijadwalkan tidak dipindahkan otomatis, jadi periksa kembali
        lewat detail pesanan bila perlu.
      </p>
    </>
  );
}
