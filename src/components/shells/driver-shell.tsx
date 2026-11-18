import type { ReactNode } from "react";

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#FAF9F6] font-driver sm:py-6">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-[#FAF9F6] sm:min-h-0 sm:border sm:border-[#E2E8E4] sm:shadow-md sm:rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
