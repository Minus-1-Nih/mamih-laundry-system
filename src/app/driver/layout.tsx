"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  PackageCheck,
  MapPin,
  User,
  Bell,
  Power,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface DriverLayoutProps {
  children: React.ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  const navItems = [
    { label: "Tugas", href: "/driver", icon: Truck },
    { label: "Penjemputan", href: "/driver/pickup", icon: MapPin },
    { label: "Pengantaran", href: "/driver/delivery", icon: PackageCheck },
    { label: "Profil", href: "/driver/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col md:flex-row">
      {/* Desktop / Tablet Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-secondary-dark/30 bg-white shadow-sm">
        <div className="p-5 border-b border-secondary">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary tracking-tight">Laundria</h1>
              <p className="text-xs text-brand-text/60 font-medium">Driver Portal (EDM)</p>
            </div>
          </div>
        </div>

        {/* Driver Status Card */}
        <div className="p-4 m-4 rounded-xl bg-secondary/70 border border-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                }`}
              />
              <span className="text-xs font-semibold">
                {isOnline ? "Status: Aktif" : "Status: Istirahat"}
              </span>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-secondary text-brand-text hover:bg-secondary transition-colors"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-brand-text/80 hover:bg-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-secondary text-xs text-brand-text/60 text-center">
          Laundria EDM v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Mobile Header / Sticky Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-secondary/80 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white md:hidden shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-brand-text">Budi Santoso</span>
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-[11px] text-brand-text/60">ID Driver: DRV-082</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Toggle Button for Mobile */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isOnline
                  ? "bg-secondary text-primary border-primary/20"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300"
              }`}
            >
              <Power className={`w-3 h-3 ${isOnline ? "text-primary" : "text-neutral-400"}`} />
              <span>{isOnline ? "Online" : "Offline"}</span>
            </button>

            <button
              aria-label="Notifikasi"
              className="relative p-2 rounded-full hover:bg-secondary text-brand-text/70 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed on Mobile, Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-secondary/80 shadow-lg md:hidden">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-brand-text/50 hover:text-brand-text"
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    isActive ? "bg-secondary" : "bg-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
