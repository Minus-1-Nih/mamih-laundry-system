"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PublicTrackingForm() {
  const router = useRouter();
  const errorId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim().toUpperCase();

    if (!value) {
      setError("Masukkan kode pesanan terlebih dahulu.");
      return;
    }

    setError("");
    router.push(`/tracking?kode=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label
        htmlFor="public-tracking-code"
        className="block text-sm font-medium text-ink"
      >
        Kode unik pesanan
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="public-tracking-code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            if (error) setError("");
          }}
          placeholder="Z1-261104-012"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="font-mono uppercase"
        />
        <Button type="submit" className="shrink-0">
          Lacak
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-danger-fg">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Tanpa masuk akun. Kode juga bisa dibuka lewat tautan WhatsApp.
        </p>
      )}
    </form>
  );
}
