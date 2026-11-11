import React from "react";
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const metrics = [
    { label: "Omset Hari Ini", value: "Rp 3.450.000", change: "+14.2%", icon: TrendingUp },
    { label: "Pesanan Aktif", value: "42 Order", change: "18 Dalam Proses", icon: Package },
    { label: "Antrean Cuci", value: "125 Kg", change: "4 Mesin Beroperasi", icon: Clock },
    { label: "Driver Aktif", value: "6 / 8 Personel", change: "Semua Terkoneksi", icon: Truck },
  ];

  const recentOrders = [
    { id: "ORD-9901", customer: "Anisa Putri", type: "Express Kiloan", weight: "4.5 Kg", total: "Rp 67.500", status: "Sedang Dicuci", badge: "bg-blue-50 text-blue-700" },
    { id: "ORD-9902", customer: "Bambang Wijaya", type: "Dry Clean Jas", weight: "2 Pcs", total: "Rp 120.000", status: "Penjemputan", badge: "bg-secondary text-primary" },
    { id: "ORD-9903", customer: "Clara S.", type: "Premium Bedding", weight: "7.0 Kg", total: "Rp 105.000", status: "Siap Antar", badge: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-5 rounded-2xl bg-white border border-secondary shadow-xs">
              <div className="flex items-center justify-between text-brand-text/60">
                <span className="text-xs font-medium">{m.label}</span>
                <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brand-text mt-2">{m.value}</p>
              <p className="text-xs text-primary font-medium mt-1">{m.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Live Orders & Machine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-secondary p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-brand-text">Pesanan Terbaru Masuk</h3>
              <p className="text-xs text-brand-text/50">Monitoring real-time alur cuci & logistik</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-secondary text-brand-text/60">
                  <th className="pb-2.5 font-semibold">No. Order</th>
                  <th className="pb-2.5 font-semibold">Pelanggan</th>
                  <th className="pb-2.5 font-semibold">Layanan</th>
                  <th className="pb-2.5 font-semibold">Total</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/60">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{ord.id}</td>
                    <td className="py-3 font-medium text-brand-text">{ord.customer}</td>
                    <td className="py-3 text-brand-text/70">{ord.type} ({ord.weight})</td>
                    <td className="py-3 font-semibold text-brand-text">{ord.total}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${ord.badge}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="bg-white rounded-2xl border border-secondary p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-brand-text">Aksi Cepat ERP</h3>
            <p className="text-xs text-brand-text/50 mb-4">Pintasan operasional harian</p>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-colors shadow-xs">
                <span>+ Buat Tiket Order Baru</span>
                <Package className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary text-primary font-semibold text-xs hover:bg-secondary-dark/60 transition-colors">
                <span>Tugaskan Driver Penjemputan</span>
                <Truck className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-secondary text-brand-text font-medium text-xs hover:bg-secondary/40 transition-colors">
                <span>Cetak Rekap Kasir Shift Ini</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Stok Detergen Cair:</strong> Tersisa 8 Liter. Jadwal restock otomatis aktif besok pagi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
