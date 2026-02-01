"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MenuItem {
  href: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // 1. State untuk mencegah Error Hydration (Layar Merah)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Jika belum siap (server-side) atau path tidak ada, jangan render apa-apa
  if (!isMounted || !pathname) return null;

  // 3. Logic: Sembunyikan Sidebar di halaman Login/Register/Forgot Password
  if (
    pathname.startsWith("/payment") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/register") 
  ) {
    return null;
  }

  // --- MENU CONFIGURATION ---
  const adminMenu: MenuItem[] = [
    { href: "/", icon: "mdi:view-dashboard" },
    { href: "/employee", icon: "mdi:account-group-outline" },
    { href: "/time", icon: "mdi:clock-outline" },
    { href: "/calendar", icon: "mdi:calendar-month-outline" },
    { href: "/reports", icon: "mdi:clipboard-text-outline" },
    { href: "/documents", icon: "mdi:file-document-outline" },
  ];

  const employeeMenu: MenuItem[] = [
    { href: "/karyawan/dashboard", icon: "mdi:view-dashboard-outline" },
    { href: "/karyawan/time", icon: "mdi:clock-time-four-outline" },
  ];

  // Cek apakah user berada di halaman karyawan
  const isEmployeePage = pathname.startsWith("/karyawan");
  const menu = isEmployeePage ? employeeMenu : adminMenu;

  // --- LOGOUT LOGIC (Simple Confirm) ---
  const handleLogout = () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) return;

    // Hapus sesi
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect
    router.push("/login");
  };

  return (
    // Class 'h-full' digunakan agar mengikuti tinggi container parent di layout.tsx
    <div className="h-full w-16 bg-[#1E3A5F] flex flex-col items-center py-3 space-y-1 relative z-40 shrink-0">
      
      {/* Menu Items */}
      {menu.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`p-2 rounded-lg transition-colors ${
            pathname === item.href 
              ? "bg-[#112240] text-white" 
              : "text-gray-400 hover:text-white hover:bg-[#112240]/50"
          }`}
        >
          <Icon icon={item.icon} className="w-6 h-6" />
        </Link>
      ))}

      {/* Spacer agar icon bawah turun ke dasar */}
      <div className="flex-1" />

      {/* Support Icon */}
      <button className="text-gray-400 hover:text-white p-2 transition-colors">
        <Icon icon="mdi:headphones" className="w-6 h-6" />
      </button>

      {/* Settings Icon */}
      <button className="text-gray-400 hover:text-white p-2 transition-colors">
        <Icon icon="mdi:cog-outline" className="w-6 h-6" />
      </button>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="text-gray-400 hover:text-red-400 p-2 mb-2 transition-colors"
        title="Logout"
      >
        <Icon icon="mdi:logout" className="w-6 h-6" />
      </button>
    </div>
  );
}