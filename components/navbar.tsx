"use client";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  // Mapping judul berdasarkan route
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/employee": "Employee Database",
    "/reports": "Reports",
  };

  const title = titles[pathname] || "Admin Panel";

  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 shadow">
      {/* Bagian kiri: logo + title */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png" // letakkan file di folder public/logo.png
          alt="Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <h1 className="text-xl text-black font-semibold">{title}</h1>
      </div>

      {/* Search bar */}
      <div className="relative w-1/2 max-w-md">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-300 bg-gray-10 px-4 py-2 pl-10 text-base text-black placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <Icon
          icon="mdi:magnify"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-xl"
        />
      </div>

      {/* Bagian kanan: notif + profile */}
      <div className="flex items-center gap-4">
        {/* Notifikasi */}
        <button className="relative">
          <Icon icon="mdi:bell-outline" className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
            2
          </span>
        </button>

        {/* Profil */}
        <div className="flex items-center gap-2">
          <img
            src="/avatar.png"
            alt="Admin"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-black">Callysta</span>
            <span className="text-xs text-gray-500 -mt-0.5">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
