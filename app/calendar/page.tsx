"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list"; // Plugin untuk tampilan List
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function CalendarPage() {
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA API (MULTI TAHUN) ---
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      
      // Ambil data 3 tahun sekaligus (Tahun lalu, Sekarang, Tahun depan)
      // Agar user bisa geser kalender ke belakang/depan tanpa kehilangan data
      const yearsToFetch = [currentYear - 1, currentYear, currentYear + 1];
      
      // Request Paralel ke API
      const responses = await Promise.all(
        yearsToFetch.map(year => axios.get(`https://libur.deno.dev/api?year=${year}`))
      );

      // Gabungkan semua data dari 3 tahun tersebut
      const allHolidays = responses.flatMap(response => response.data);
      
      const holidayEvents = allHolidays.map((item: any, index: number) => {
        // Logika Deteksi: Cuti Bersama vs Libur Nasional Biasa
        const isCutiBersama = item.name.toLowerCase().includes("cuti bersama");

        return {
            id: `hol-${index}-${item.date}`, // ID Unik
            title: item.name, 
            start: item.date, // YYYY-MM-DD
            allDay: true,
            
            // Pembedaan Warna
            // Merah (#FEF2F2) = Libur Nasional
            // Oranye (#FFF7ED) = Cuti Bersama
            backgroundColor: isCutiBersama ? '#FFF7ED' : '#FEF2F2', 
            borderColor: 'transparent',
            textColor: isCutiBersama ? '#9A3412' : '#991B1B',
            
            // Simpan tipe untuk keperluan lain jika butuh
            extendedProps: { 
                type: isCutiBersama ? 'cuti' : 'holiday' 
            }
        };
      });

      setEvents(holidayEvents);

    } catch (error) {
      console.error("Gagal mengambil data libur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="flex-1 p-6 font-['Inter'] min-h-screen bg-[#F3F5F6]">
      
      {/* HEADER & LEGEND */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-[#D8DDE1] mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Kalender Nasional</h1>
                <p className="text-gray-500 text-sm mt-1">Daftar Hari Libur Nasional & Cuti Bersama Indonesia.</p>
            </div>

            {/* LEGEND YANG LEBIH CLEAN */}
            <div className="flex gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span>
                    <span className="text-xs font-semibold text-gray-700">Libur Nasional</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-100 border border-orange-300"></span>
                    <span className="text-xs font-semibold text-gray-700">Cuti Bersama</span>
                </div>
            </div>
        </div>
      </div>

      {/* KALENDER CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D8DDE1] relative min-h-[600px]">
         
         {/* Loading Indicator Overlay */}
         {loading && (
            <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center rounded-xl">
                <Icon icon="eos-icons:loading" className="text-4xl text-[#1E3A5F]" />
                <span className="text-gray-600 font-medium text-sm mt-3">Sinkronisasi Data Pemerintah...</span>
            </div>
         )}

         {/* Custom CSS Global untuk Komponen Ini */}
         <style jsx global>{`
            /* Toolbar Header */
            .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 700; color: #1F2937; }
            .fc-button-primary { background-color: #1E3A5F !important; border-color: #1E3A5F !important; padding: 8px 16px !important; font-weight: 500; }
            .fc-button-primary:hover { background-color: #2b4c75 !important; }
            .fc-button-active { background-color: #0f2a4a !important; }
            
            /* Grid Hari */
            .fc-daygrid-day.fc-day-today { background-color: #F8FAFC !important; }
            .fc-col-header-cell-cushion { padding-top: 10px; padding-bottom: 10px; font-weight: 600; color: #4B5563; }
            .fc-daygrid-day-number { font-size: 0.9rem; font-weight: 500; color: #374151; padding: 8px !important; }

            /* Event Styling (Label Style) */
            .fc-event { 
                padding: 4px 8px; 
                margin-bottom: 2px !important;
                font-size: 0.7rem; 
                border-radius: 4px; 
                font-weight: 600; 
                white-space: normal; /* Text wrap aktif */
                border: none;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                cursor: default; /* Cursor biasa karena read-only */
                line-height: 1.3;
            }
            
            /* Hapus dot bawaan FullCalendar */
            .fc-daygrid-event-dot { display: none; } 
            
            /* List View Tweaks */
            .fc-list-event-dot { display: none; }
            .fc-list-day-cushion { background-color: #F3F5F6 !important; }
         `}</style>
         
         <FullCalendar
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listYear' // Tambah opsi List View (Daftar)
            }}
            
            // Settings
            editable={false}
            selectable={false}
            events={events}
            
            // Height config
            height="auto"
            contentHeight={800}
            
            // Lokalisasi (Opsional, agar nama hari/bulan Indonesia)
            // locale="id" 
         />
      </div>

    </div>
  );
}