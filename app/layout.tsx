import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/navbar"; 
import Sidebar from "@/components/sidebar";
import { Icon } from "@iconify/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRIS",
  description: "Project HRIS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
     <html lang="en">
      <body>
          <div className="flex flex-col flex">
            {/* Navbar selalu ada */}
            <Navbar />
            <div className="flex h-screen">
          {/* Sidebar selalu ada */}
          <Sidebar />

            {/* Konten halaman berubah sesuai route */}
            <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
