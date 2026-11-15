import { Suspense } from "react";
import { PublicShell } from "@/components/shells/public-shell";
import { TrackingClient } from "@/components/customer/tracking-client";

export default function TrackingPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <p className="py-16 text-center text-sm text-muted">
            Memuat pelacakan pesanan...
          </p>
        }
      >
        <TrackingClient />
      </Suspense>
    </PublicShell>
  );
}
