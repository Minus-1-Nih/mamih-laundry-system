import React from "react";
import {
  MapPin,
  Clock,
  Phone,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DriverDashboardPage() {
  const tasks = [
    {
      id: "TSK-1024",
      customer: "Siti Rahma",
      address: "Jl. Melati No. 12, Kebayoran Baru",
      type: "PICKUP",
      time: "15:30 - 16:30",
      items: "2 Kantong (Estimasi 8 Kg)",
      status: "Menunggu Penjemputan",
      urgent: true,
    },
    {
      id: "TSK-1025",
      customer: "Ahmad Fauzi",
      address: "Apartemen Sudirman Tower A #14B",
      type: "DELIVERY",
      time: "16:45 - 17:30",
      items: "Bed Cover + 5 Kemeja",
      status: "Siap Diantar",
      urgent: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-secondary shadow-xs">
          <p className="text-xs text-brand-text/60">Tugas Hari Ini</p>
          <p className="text-2xl font-bold text-primary mt-1">8</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-secondary shadow-xs">
          <p className="text-xs text-brand-text/60">Selesai</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">5</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-secondary shadow-xs">
          <p className="text-xs text-brand-text/60">Tertunda</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
        </div>
        <div className="p-4 rounded-2xl bg-secondary/80 border border-secondary shadow-xs">
          <p className="text-xs text-primary font-medium">Performa Minggu Ini</p>
          <p className="text-2xl font-bold text-primary mt-1">98%</p>
        </div>
      </div>

      {/* Task List Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-brand-text">Tugas Aktif</h2>
          <span className="text-xs font-medium text-primary">Perbarui Otomatis</span>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-secondary rounded-2xl p-4 shadow-xs hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        task.type === "PICKUP"
                          ? "bg-secondary text-primary"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {task.type}
                    </span>
                    <span className="text-xs font-mono text-brand-text/50">
                      #{task.id}
                    </span>
                    {task.urgent && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Prioritas
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-brand-text mt-1.5 text-base">
                    {task.customer}
                  </h3>
                </div>

                <a
                  href={`tel:08123456789`}
                  className="p-2 rounded-xl bg-secondary text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Hubungi Pelanggan"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-brand-text/80">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{task.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-text/40 shrink-0" />
                  <span>Jadwal: {task.time}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-secondary/60 flex items-center justify-between">
                <span className="text-xs text-brand-text/60 font-medium">
                  {task.items}
                </span>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mulai Navigasi</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
