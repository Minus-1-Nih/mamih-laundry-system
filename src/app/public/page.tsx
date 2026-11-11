import React from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, MapPin, Clock, Phone } from "lucide-react";

export default function PublicPage() {
  const services = [
    { name: "Kiloan Reguler", price: "Rp 10.000 / Kg", time: "2 Hari Kerja", features: ["Cuci Bersih", "Setrika Uap", "Parfum Signature", "Plastik Pelindung"] },
    { name: "Kiloan Express", price: "Rp 16.000 / Kg", time: "24 Jam Selesai", features: ["Prioritas Mesin", "Setrika Uap", "Parfum Signature", "Antar Jemput Tersedia"] },
    { name: "Dry Cleaning Satuan", price: "Mulai Rp 25.000", time: "3 Hari Kerja", features: ["Jas, Gaun & Kebaya", "Perawatan Serat Kain", "Pembersih Noda Khusus", "Hanger Eksklusif"] },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-secondary sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-primary">Laundria</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tracking"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-secondary hover:bg-secondary text-primary transition-colors"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
            >
              Portal Role
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary text-primary">
          Layanan Laundry Modern Terpercaya
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-text mt-4 leading-tight">
          Pakaian Bersih, Rapi & Wangi Tanpa Ribet
        </h1>
        <p className="text-sm sm:text-base text-brand-text/70 mt-4 leading-relaxed">
          Sistem manajemen laundry terpadu dengan layanan antar-jemput cepat, pelacakan proses real-time, dan standar higienis terbaik.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/tracking"
            className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-2"
          >
            <span>Cek Status Cucian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-secondary text-primary font-semibold text-sm hover:bg-secondary-dark transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Pesan Antar-Jemput</span>
          </a>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <h2 className="text-xl font-bold text-center text-brand-text mb-8">Pilihan Paket & Tarif Layanan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.name} className="bg-white rounded-3xl p-6 border border-secondary shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-brand-text">{s.name}</h3>
                <p className="text-2xl font-extrabold text-primary mt-2">{s.price}</p>
                <div className="flex items-center gap-1.5 text-xs text-brand-text/60 mt-1 mb-5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{s.time}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-brand-text/80 border-t border-secondary pt-4">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="mt-6 w-full py-2.5 rounded-xl bg-secondary hover:bg-primary hover:text-white text-primary text-xs font-semibold transition-colors">
                Pilih Paket Ini
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-secondary py-8 text-center text-xs text-brand-text/50">
        <p>© 2026 Laundria Capstone Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
