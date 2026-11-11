import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Truck,
  Settings,
  BarChart3,
  Sparkles,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const adminNav = [
    { label: "Dashboard ERP", href: "/admin", icon: LayoutDashboard },
    { label: "Manajemen Pesanan", href: "/admin/orders", icon: ShoppingBag },
    { label: "Armada & Driver", href: "/admin/drivers", icon: Truck },
    { label: "Data Pelanggan", href: "/admin/customers", icon: Users },
    { label: "Laporan Finansial", href: "/admin/reports", icon: BarChart3 },
    { label: "Pengaturan Sistem", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-secondary flex flex-col shrink-0">
        <div className="p-6 border-b border-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-primary tracking-tight">Laundria</span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-text/50">
                ERP Core System
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-brand-text/80 hover:bg-secondary hover:text-primary transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile */}
        <div className="p-4 border-t border-secondary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold">Administrator</p>
              <p className="text-[10px] text-brand-text/50">admin@laundria.id</p>
            </div>
          </div>
          <Link
            href="/"
            className="p-1.5 text-brand-text/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Keluar ke Beranda"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-secondary px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-brand-text text-base">Pusat Kendali Operasional</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-primary">
              Live Outlet #01
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded-lg border border-secondary text-brand-text/80 hover:bg-secondary hover:text-primary transition-colors"
            >
              Ganti Role
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
