"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export default function TrackingPage() {
  const [orderId, setOrderId] = useState("LND-8821");
  const [searched, setSearched] = useState(true);

  const trackingSteps = [
    { title: "Pesanan Diterima di Outlet", time: "11 Nov, 09:15", desc: "Barang telah ditimbang & diperiksa kelayakannya", done: true },
    { title: "Proses Pencucian Higienis", time: "11 Nov, 11:30", desc: "Menggunakan detergen ramah lingkungan & air tersaring", done: true },
    { title: "Pengeringan & Setrika Uap", time: "11 Nov, 14:00", desc: "Penyetrikaan presisi dan quality control aroma", done: true, current: true },
    { title: "Pengemasan & Siap Diantar", time: "Estimasi: 16:30", desc: "Driver akan segera menjadwalkan rute pengantaran", done: false },
    { title: "Selesai Diterima Pelanggan", time: "Estimasi: 17:30", desc: "Paket sampai dengan aman dan bersih", done: false },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-secondary sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <ArrowLeft className="w-4 h-4" />
            <span>Laundria</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary">
              Portal Pelanggan (EIM)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 border border-secondary shadow-sm text-center">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-brand-text">Lacak Status Laundry Anda</h1>
          <p className="text-xs text-brand-text/60 mt-1 max-w-sm mx-auto">
            Masukkan Nomor Resi / ID Order yang tercetak pada struk atau pesan WhatsApp Anda
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearched(true);
            }}
            className="mt-5 flex gap-2"
          >
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Contoh: LND-8821"
              className="flex-1 px-4 py-2.5 rounded-xl border border-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-xs"
            >
              Lacak
            </button>
          </form>
        </div>

        {/* Tracking Details */}
        {searched && (
          <div className="bg-white rounded-3xl p-6 border border-secondary shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-secondary">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">#{orderId}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Sedang Diproses
                  </span>
                </div>
                <h2 className="text-lg font-bold text-brand-text mt-1">Paket Komplit Cuci & Setrika (5.2 Kg)</h2>
              </div>

              <div className="text-right">
                <p className="text-xs text-brand-text/50">Estimasi Selesai</p>
                <p className="text-sm font-bold text-primary">Hari Ini, 17:30 WIB</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary">
              {trackingSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8">
                  <div
                    className={`absolute left-1 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center -translate-x-1/2 ${
                      step.current
                        ? "bg-primary text-white ring-4 ring-secondary"
                        : step.done
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-secondary-dark text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-sm font-semibold ${
                          step.current ? "text-primary" : step.done ? "text-brand-text" : "text-brand-text/40"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className="text-xs font-medium text-brand-text/50">{step.time}</span>
                    </div>
                    <p className="text-xs text-brand-text/60 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Guaranteed Badge */}
            <div className="p-3.5 rounded-2xl bg-secondary/60 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-brand-text/80">
                <strong>Garansi Higienis & Wangi 7 Hari:</strong> Cucian Anda diproses dengan standar higienis tersertifikasi Laundria.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
