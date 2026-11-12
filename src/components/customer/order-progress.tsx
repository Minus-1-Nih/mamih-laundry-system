import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateLong, formatDateTime } from "@/lib/format";
import type { Order, StatusEvent } from "@/lib/types";

function findEvent(order: Order, notes: string[]): StatusEvent | undefined {
  return [...order.history]
    .reverse()
    .find((event) =>
      notes.some((note) => event.note?.toLowerCase().includes(note)),
    );
}

function stamp(event?: StatusEvent): string | undefined {
  return event ? `${formatDateTime(event.at)} WIB` : undefined;
}

export function orderArrivalLabel(order: Order): string {
  const arrival = new Date(new Date(order.createdAt).getTime() + 2 * 86_400_000);
  return formatDateLong(arrival.toISOString());
}

export interface CustomerOrderProgressProps {
  order: Order;
  className?: string;
  showStage?: boolean;
}

export function CustomerOrderProgress({
  order,
  className,
  showStage = true,
}: CustomerOrderProgressProps) {
  const created =
    order.history.find(
      (event) =>
        event.note === "Pesanan dibuat" || event.note === "Pesanan diterima",
    ) ?? order.history[0];
  const pickup = findEvent(order, ["penjemputan selesai"]);
  const washing = findEvent(order, ["sedang dicuci", "selesai dicuci"]);
  const ready = findEvent(order, ["siap diantar"]);
  const delivered = findEvent(order, ["diterima pelanggan"]);

  const reachedPickup = order.status !== "menunggu";
  const reachedWash = order.status === "siap" || order.status === "selesai";
  const reachedReady = order.status === "siap" || order.status === "selesai";
  const reachedDone = order.status === "selesai";

  const stage =
    order.status === "menunggu"
      ? 2
      : order.status === "dicuci"
        ? 3
        : order.status === "siap"
          ? 4
          : 5;

  const steps = [
    {
      label: "Pesanan diterima",
      description: "Pesanan Anda terdaftar di Laundria.",
      time: stamp(created),
      state: "done" as const,
    },
    {
      label: "Penjemputan selesai",
      description: pickup
        ? `Dijemput oleh ${pickup.by}, ${order.zoneId}.`
        : "Kurir akan menjemput cucian di alamat Anda.",
      time: stamp(pickup) ?? "Menunggu penjemputan",
      state: reachedPickup ? ("done" as const) : ("current" as const),
    },
    {
      label: "Sedang dicuci",
      description: "Cucian sedang dicuci, dikeringkan, dan disetrika.",
      time:
        stamp(washing) ??
        (order.status === "menunggu"
          ? "Setelah penjemputan"
          : "Sedang berjalan"),
      state: reachedWash
        ? ("done" as const)
        : order.status === "dicuci"
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      label: "Siap diantar",
      description: reachedReady
        ? "Cucian siap diantar ke alamat Anda."
        : "Kami akan menginformasikan saat cucian siap diantar.",
      time:
        stamp(ready) ??
        (reachedWash
          ? "Menunggu penjadwalan"
          : `Estimasi ${orderArrivalLabel(order)}, 17.00–22.00 WIB`),
      state: reachedDone
        ? ("done" as const)
        : order.status === "siap"
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      label: "Selesai",
      description: "Cucian bersih tiba di alamat Anda.",
      time: stamp(delivered) ?? "Menunggu pengantaran",
      state: reachedDone ? ("done" as const) : ("pending" as const),
    },
  ];

  return (
    <div className={cn("relative", className)}>
      {showStage ? (
        <p className="mb-4 text-right text-13 text-muted">
          Tahap {stage} dari 5
        </p>
      ) : null}

      <div
        aria-hidden="true"
        className="absolute bottom-5 left-[15px] top-[calc(1rem+1.25rem)] w-px bg-border"
      />
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const done = step.state === "done";
          const current = step.state === "current";
          return (
            <li key={step.label} className="relative flex gap-4 pb-5 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-13 font-semibold",
                  done && "border-primary bg-primary text-white",
                  current && "border-primary bg-surface text-primary",
                  step.state === "pending" &&
                    "border-border bg-surface text-muted",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : current ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      current
                        ? "text-primary"
                        : done
                          ? "text-ink"
                          : "text-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-13 text-muted">{step.time}</p>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
