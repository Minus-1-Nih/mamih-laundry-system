import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldAlert,
  Truck,
  Search,
  Globe,
  ArrowRight,
  Layers,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const roles = [
    {
      title: "1. Role Admin (ERP)",
      code: "Enterprise Resource Planning",
      route: "/admin",
      badge: "ERP Core",
      color: "border-primary/30 hover:border-primary",
      icon: Layers,
      description:
        "Pusat kendali operasional, manajemen mesin & antrean cuci, inventory bahan baku, serta laporan finansial real-time.",
      actionText: "Buka Dashboard Admin",
    },
    {
      title: "2. Role Driver (EDM)",
      code: "Electronic Delivery Management",
      route: "/driver",
      badge: "Mobile-First",
      color: "border-primary/30 hover:border-primary",
      icon: Truck,
      description:
        "Portal armada logistik dengan antarmuka mobile-responsive, daftar rute penjemputan & pengantaran cucian, dan status operasional.",
      actionText: "Buka Portal Driver",
    },
    {
      title: "3. Role Pelanggan (EIM)",
      code: "Electronic Inquiry Management",
      route: "/tracking",
      badge: "Customer Live",
      color: "border-primary/30 hover:border-primary",
      icon: Search,
      description:
        "Pelacakan resi cucian real-time dari tahap penimbangan, pencucian, setrika uap, hingga pengantaran ke depan pintu.",
      actionText: "Buka Tracking Resi",
    },
    {
      title: "4. Halaman Publik & Tarif",
      code: "Public Catalog & Landing",
      route: "/public",
      badge: "Public Access",
      color: "border-secondary-dark/60 hover:border-primary",
      icon: Globe,
      description:
        "Halaman katalog layanan, daftar harga laundry kiloan & satuan, kontak WhatsApp outlet, dan info garansi higienis.",
      actionText: "Lihat Web Publik",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-8 border-b border-secondary">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Laundria</h1>
            <p className="text-xs text-brand-text/60 font-medium">
              Sistem Manajemen Laundry Terintegrasi (Multi-Role)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-primary">
            <CheckCircle className="w-3.5 h-3.5" />
            Next.js App Router + Tailwind v4
          </span>
        </div>
      </header>

      {/* Hero Welcome */}
      <main className="max-w-5xl mx-auto w-full my-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-secondary px-3 py-1 rounded-full">
            Capstone Project Scaffolding
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-text mt-3">
            Pilih Portal Sesuai Peran (Role)
          </h2>
          <p className="text-sm text-brand-text/70 mt-2">
            Struktur codebase terpadu dalam satu repository dengan segmentasi rute yang modular dan siap dikembangkan.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.route}
                className={`bg-white rounded-3xl p-6 border ${r.color} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-primary">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-text">{r.title}</h3>
                  <p className="text-xs font-mono text-primary font-medium mt-0.5">{r.code}</p>
                  <p className="text-xs text-brand-text/70 mt-2 leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-secondary flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-brand-text/50">
                    Route: {r.route}
                  </span>
                  <Link
                    href={r.route}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
                  >
                    <span>{r.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Palette Display */}
        <div className="mt-10 bg-white border border-secondary rounded-3xl p-6 shadow-xs">
          <h4 className="text-sm font-bold text-brand-text mb-3">Palet Warna Resmi Design System Laundria:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#2A6F56] text-white">
              <p className="font-bold">Primary</p>
              <p className="text-[11px] opacity-80">#2A6F56 (Sage Green)</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#E8F3EE] text-[#2A6F56] border border-[#d2e4db]">
              <p className="font-bold">Secondary</p>
              <p className="text-[11px] opacity-80">#E8F3EE (Soft Sage)</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F6] text-[#1E2421] border border-secondary">
              <p className="font-bold">Background</p>
              <p className="text-[11px] opacity-80">#FAF9F6 (Off-White)</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#1E2421] text-white">
              <p className="font-bold">Text Color</p>
              <p className="text-[11px] opacity-80">#1E2421 (Deep Charcoal)</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-8 border-t border-secondary text-center text-xs text-brand-text/50">
        Capstone Laundria • Next.js App Router TypeScript • Lucide Icons • Tailwind CSS
      </footer>
    </div>
  );
}
