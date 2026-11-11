"use client";

import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Rehydrates the persisted demo store after mount, then marks it ready.
 * Zustand's skipHydration keeps the server and first client render on the
 * same seed data, so hydration does not mismatch.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const result = useAppStore.persist.rehydrate();
    Promise.resolve(result).finally(() => {
      useAppStore.getState().setHydrated(true);
    });
  }, []);

  return <>{children}</>;
}
