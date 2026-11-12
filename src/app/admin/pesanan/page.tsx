import { Suspense } from "react";
import { OrdersClient } from "@/components/admin/orders-client";

function OrdersFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat pesanan">
      <div className="h-16 rounded-xl bg-track" />
      <div className="h-14 rounded-xl bg-track" />
      <div className="h-96 rounded-xl bg-track" />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersClient />
    </Suspense>
  );
}
