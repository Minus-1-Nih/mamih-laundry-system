import { Suspense } from "react";
import { OrderDetailClient } from "@/components/customer/order-detail-client";

export default function CustomerOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted">
          Memuat detail pesanan...
        </p>
      }
    >
      <OrderDetailClient />
    </Suspense>
  );
}
