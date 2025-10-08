"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { href: "/", icon: "mdi:view-dashboard" },
    { href: "/employee", icon: "mdi:account-group-outline" },
    { href: "/time", icon: "mdi:clock-outline" },
    { href: "/calendar", icon: "mdi:calendar-month-outline" },
    { href: "/reports", icon: "mdi:clipboard-text-outline" },
    { href: "/documents", icon: "mdi:file-document-outline" },

  ];

  return (
    <div className="h-screen w-16 bg-[#1E3A5F] flex flex-col items-center py-3 space-y-1">
      {menu.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`p-2 rounded-lg ${
            pathname === item.href ? "bg-[#112240] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Icon icon={item.icon} className="w-6 h-6" />
        </Link>
      ))}

      <div className="flex-1" />
      <button className="text-gray-400 hover:text-white">
        <Icon icon="mdi:headphones" className="w-6 h-6" />
      </button>

      <button className="text-gray-400 hover:text-white">
        <Icon icon="mdi:cog-outline" className="w-6 h-6" />
      </button>
    </div>
  );
}
