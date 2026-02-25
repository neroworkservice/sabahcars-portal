"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

const roleMenus: Record<string, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Leads", href: "/dashboard/admin/leads" },
    { label: "Pengguna", href: "/dashboard/admin/users" },
    { label: "Tempahan", href: "/dashboard/admin/bookings" },
    { label: "Laporan", href: "/dashboard/admin/reports" },
    { label: "Tetapan", href: "/dashboard/admin/settings" },
  ],
  sales: [
    { label: "Dashboard", href: "/dashboard/sales" },
    { label: "Leads", href: "/dashboard/sales/leads" },
    { label: "Sebut Harga", href: "/dashboard/sales/quotes" },
    { label: "Tempahan", href: "/dashboard/sales/bookings" },
    { label: "Pelanggan", href: "/dashboard/sales/customers" },
  ],
  agent: [
    { label: "Dashboard", href: "/dashboard/agent" },
    { label: "Tempahan Saya", href: "/dashboard/agent/bookings" },
    { label: "Komisen", href: "/dashboard/agent/commission" },
    { label: "Pelanggan", href: "/dashboard/agent/customers" },
  ],
  supplier: [
    { label: "Dashboard", href: "/dashboard/supplier" },
    { label: "Fleet", href: "/dashboard/supplier/fleet" },
    { label: "Tempahan", href: "/dashboard/supplier/bookings" },
    { label: "Ketersediaan", href: "/dashboard/supplier/availability" },
  ],
  runner: [
    { label: "Dashboard", href: "/dashboard/runner" },
    { label: "Tugasan", href: "/dashboard/runner/assignments" },
    { label: "Serah Terima", href: "/dashboard/runner/handovers" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard/customer" },
    { label: "Hantar Inquiry", href: "/dashboard/customer/inquiry" },
    { label: "Tempahan Saya", href: "/dashboard/customer/bookings" },
    { label: "Minta Sebut Harga", href: "/dashboard/customer/quote" },
    { label: "Profil", href: "/dashboard/customer/profile" },
  ],
};

const roleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: "bg-indigo-600", label: "Admin" },
  sales: { color: "bg-blue-600", label: "Sales" },
  agent: { color: "bg-green-600", label: "Agent" },
  supplier: { color: "bg-orange-600", label: "Supplier" },
  runner: { color: "bg-violet-600", label: "Runner" },
  customer: { color: "bg-teal-600", label: "Customer" },
};

interface SidebarProps {
  role: string;
  fullName: string;
  email: string;
}

export default function Sidebar({ role, fullName, email }: SidebarProps) {
  const pathname = usePathname();
  const menu = roleMenus[role] ?? roleMenus.customer;
  const config = roleConfig[role] ?? { color: "bg-gray-600", label: role };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Brand header */}
      <div className={`${config.color} px-5 py-5`}>
        <p className="text-white font-bold text-xl tracking-tight">SabahCar</p>
        <p className="text-white/70 text-xs mt-0.5">{config.label} Portal</p>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full ${config.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? `${config.color} text-white shadow-sm`
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
