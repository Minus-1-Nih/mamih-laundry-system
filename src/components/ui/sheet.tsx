"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: "right" | "bottom";
  className?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  side = "right",
  className,
  children,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none border-0 bg-transparent p-0 text-ink",
        side === "right"
          ? "ml-auto h-dvh w-full max-w-md"
          : "mx-auto mt-auto h-auto max-h-[85dvh] w-full max-w-xl rounded-t-2xl",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col bg-surface",
          side === "right" ? "h-dvh" : "max-h-[85dvh] rounded-t-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </dialog>
  );
}
