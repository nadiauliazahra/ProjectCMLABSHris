"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function EmployeeTimePage() {
  // --- STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("Default");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- MOCK DATA ---
  const [myAttendance, setMyAttendance] = useState([
    { id: 1, date: "2025-03-01", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 2, date: "2025-03-02", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Annual Leave" },
    { id: 3, date: "2025-03-03", clockIn: "08:15", clockOut: "16:45", workHours: "10h 5m", status: "Late" },
    { id: 4, date: "2025-03-04", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 5, date: "2025-03-05", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 6, date: "2025-03-06", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Annual Leave" },
    { id: 7, date: "2025-03-07", clockIn: "08:10", clockOut: "16:40", workHours: "10h 5m", status: "Late" },
    { id: 8, date: "2025-03-08", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 9, date: "2025-03-09", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 10, date: "2025-03-10", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Annual Leave" },
    { id: 11, date: "2025-03-11", clockIn: "08:20", clockOut: "16:50", workHours: "10h 5m", status: "Late" },
    { id: 12, date: "2025-03-12", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 13, date: "2025-03-13", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 14, date: "2025-03-14", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Annual Leave" },
    { id: 15, date: "2025-03-15", clockIn: "08:05", clockOut: "16:35", workHours: "10h 5m", status: "Late" },
    { id: 16, date: "2025-03-16", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 17, date: "2025-03-17", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
    { id: 18, date: "2025-03-18", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Annual Leave" },
    { id: 19, date: "2025-03-19", clockIn: "08:12", clockOut: "16:42", workHours: "10h 5m", status: "Late" },
    { id: 20, date: "2025-03-20", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "On Time" },
  ]);

  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const parseDuration = (str: string) => {
    const hours = parseInt(str.match(/(\d+)h/)?.[1] || "0");
    const minutes = parseInt(str.match(/(\d+)m/)?.[1] || "0");
    return hours * 60 + minutes;
  };

  // --- FILTER & SORT LOGIC ---
  const filteredData = myAttendance.filter((item) => {
    // 1. Search (By Date or Status)
    const matchesSearch = 
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;

    // 3. Date Range Filter
    let matchesDate = true;
    if (startDate && item.date) {
      matchesDate = matchesDate && new Date(item.date) >= new Date(startDate);
    }
    if (endDate && item.date) {
      matchesDate = matchesDate && new Date(item.date) <= new Date(endDate);
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    // 4. Sorting
    switch (sortOption) {
      case "Date Newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "Date Oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "Clock In Earliest": return a.clockIn.localeCompare(b.clockIn);
      case "Clock In Latest": return b.clockIn.localeCompare(a.clockIn);
      case "Work Hours High": return parseDuration(b.workHours) - parseDuration(a.workHours);
      case "Work Hours Low": return parseDuration(a.workHours) - parseDuration(b.workHours);
      default: return 0;
    }
  });

  // --- PAGINATION LOGIC ---
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  // Auto-reset page if filter reduces results
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "On Time": return "bg-green-50 text-green-700 border-green-200";
      case "Late": return "bg-red-50 text-red-700 border-red-200";
      case "Annual Leave": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Reset filters function
  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("All");
    setSortOption("Default");
    setStartDate("");
    setEndDate("");
    setShowFilter(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 bg-[#F3F5F6] min-h-screen font-sans p-0">
      
      {/* --- MAIN CARD --- */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE1] p-6">
        
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <h2 className="font-bold text-black text-2xl flex-1">Checkclock Overview</h2>
          <div className="flex gap-3 w-full md:w-auto relative">
            
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Data" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-[#D8DDE1] rounded-lg text-sm focus:outline-none focus:border-[#1E3A5F] w-64 text-black" 
              />
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            {/* Filter Button & Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-black hover:bg-gray-50 text-sm font-medium transition-colors ${showFilter ? 'bg-gray-100 border-gray-400' : 'border-[#D8DDE1] hover:bg-gray-50'}`}
                >
                    <Icon icon="material-symbols:tune" className="text-lg" /> Filter
                </button>
                
                {/* Filter Menu */}
                {showFilter && (
                    <div className="absolute right-0 top-12 w-72 bg-white border border-[#D8DDE1] rounded-lg shadow-xl z-20 p-4 text-black">
                        <div className="space-y-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Date Range</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                                  />
                                  <span className="text-gray-400 self-center">-</span>
                                  <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                                  />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Status</label>
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="On Time">On Time</option>
                                    <option value="Late">Late</option>
                                    <option value="Annual Leave">Annual Leave</option>
                                </select>
                            </div>
                            
                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Sort By</label>
                                <select 
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    <option value="Default">Default</option>
                                    <optgroup label="Date">
                                      <option value="Date Newest">Date (Newest)</option>
                                      <option value="Date Oldest">Date (Oldest)</option>
                                    </optgroup>
                                    <optgroup label="Time">
                                      <option value="Clock In Earliest">Clock In (Earliest)</option>
                                      <option value="Clock In Latest">Clock In (Latest)</option>
                                      <option value="Work Hours High">Work Hours (Highest)</option>
                                      <option value="Work Hours Low">Work Hours (Lowest)</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-black underline">Reset</button>
                                <button onClick={() => setShowFilter(false)} className="bg-[#1E3A5F] text-white px-3 py-1 rounded text-xs hover:bg-[#2b4c75]">Apply</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2b4c75] text-sm font-medium"
            >
              <Icon icon="mdi:plus" className="text-lg" /> Tambah Data
            </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="text-[#596171] text-sm">
                <th className="p-4 font-medium bg-[#F3F5F6] rounded-l-[5px] border-y border-l border-[#F3F5F6]">Date</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6]">Clock In</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6]">Clock Out</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6]">Work Hours</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] rounded-r-[5px] border-y border-r border-[#F3F5F6]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-4"></tr>
              
              {currentData.length > 0 ? (
                  currentData.map((data, index) => (
                    <tr key={`${data.id}-${index}`} className="border-b border-[#EEF2F5] hover:bg-gray-50 text-black text-sm">
                      <td className="p-4 border-b border-[#EEF2F5] font-medium">
                        {formatDate(data.date)}
                      </td>
                      <td className="p-4 text-center border-b border-[#EEF2F5]">{data.clockIn}</td>
                      <td className="p-4 text-center border-b border-[#EEF2F5]">{data.clockOut}</td>
                      <td className="p-4 text-center font-medium border-b border-[#EEF2F5]">{data.workHours}</td>
                      <td className="p-4 text-center border-b border-[#EEF2F5]">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.status)}`}>
                          {data.status}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                  /* --- EMPTY STATE --- */
                  <tr>
                      <td colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <Icon icon="mdi:file-search-outline" className="text-4xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Data Found</h3>
                          <p className="text-gray-500 text-sm mb-6 max-w-xs text-center">
                            We couldn't find any records matching your current filters or search.
                          </p>
                          <button 
                            onClick={clearFilters}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 font-medium flex items-center gap-2"
                          >
                            <Icon icon="mdi:refresh" className="text-lg" />
                            Clear Filters
                          </button>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="grid grid-cols-3 items-center mt-6 pt-4">
          <div className="flex items-center gap-2 justify-start">
            <span className="text-sm text-gray-500">Showing</span>
            <div className="relative">
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="appearance-none border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:border-[#1E3A5F] cursor-pointer pr-8 bg-white">
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base" />
            </div>
          </div>
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">
                {totalRecords > 0 ? `Showing ${startRecord} to ${endRecord} out of ${totalRecords} records` : ''}
            </p>
          </div>
          <div className="flex justify-end gap-1">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1} 
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Icon icon="mdi:chevron-left" className="text-2xl" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum} 
                onClick={() => setCurrentPage(pageNum)} 
                className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-all ${currentPage === pageNum ? "border border-gray-400 text-black bg-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {pageNum}
              </button>
            ))}

            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Icon icon="mdi:chevron-right" className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* --- EMPLOYEE ADD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white w-full max-w-6xl rounded-[10px] shadow-2xl flex flex-col h-[95vh] max-h-[1024px]">
            <div className="px-8 py-6"><h2 className="text-2xl font-bold text-black">Add Checkclock</h2></div>
            <div className="flex-1 px-8 pb-8 overflow-hidden">
              <div className="w-full h-full border-2 border-[#D8DDE1] rounded-[10px] flex flex-col overflow-hidden relative bg-white">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-lg font-medium text-black mb-2">Tipe Absensi</label>
                        <div className="relative">
                          <select className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"><option>Pilih Tipe Absensi</option><option>Clock In</option><option>Clock Out</option><option>Sick Leave</option><option>Annual Leave</option></select>
                          <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Start Date</label>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                <div className="bg-[#F3F5F6] px-3 py-2 border-r border-gray-300 flex items-center justify-center"><Icon icon="mdi:calendar-blank" className="text-gray-600 text-xl" /></div>
                                <input type="date" className="w-full p-3 text-gray-700 bg-white focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">End Date</label>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                <div className="bg-[#F3F5F6] px-3 py-2 border-r border-gray-300 flex items-center justify-center"><Icon icon="mdi:calendar-blank" className="text-gray-600 text-xl" /></div>
                                <input type="date" className="w-full p-3 text-gray-700 bg-white focus:outline-none" />
                            </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-black mb-2">Upload Bukti Pendukung</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-white h-64"><div className="bg-gray-200 p-4 rounded-full mb-3"><Icon icon="mdi:image-outline" className="text-4xl text-gray-500" /></div><p className="text-gray-500">Drag and drop here <br /> or <span className="font-bold text-gray-700 cursor-pointer">Browse</span></p></div>
                        <button className="w-full bg-[#1E3A5F] text-white font-semibold py-3 rounded-lg mt-4 hover:bg-[#2b4c75]">Upload</button>
                      </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-lg font-medium text-black mb-2">Lokasi</label>
                        <div className="relative">
                          <select className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"><option>Pilih Lokasi</option><option>Head Office (Malang)</option><option>Branch Office (Jakarta)</option></select>
                          <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                        </div>
                      </div>
                      <div className="w-full h-64 bg-gray-200 rounded-lg border border-gray-300 relative overflow-hidden group">
                        <img src="https://placehold.co/600x400/png?text=Map+Preview" alt="Map" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2"><button className="bg-white p-1 rounded shadow hover:bg-gray-100"><Icon icon="mdi:plus" className="text-black"/></button><button className="bg-white p-1 rounded shadow hover:bg-gray-100"><Icon icon="mdi:minus" className="text-black"/></button></div>
                      </div>
                      <div><label className="block text-lg font-medium text-black mb-2">Detail Alamat</label><textarea className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 h-24 resize-none" defaultValue="Kota Malang, Jawa Timur"></textarea></div>
                      <div className="grid grid-cols-2 gap-4"><div><label className="block text-lg font-medium text-black mb-2">Lat</label><input type="text" placeholder="Lat Lokasi" className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" /></div><div><label className="block text-lg font-medium text-black mb-2">Long</label><input type="text" placeholder="Long Lokasi" className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" /></div></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white flex justify-end gap-4 sticky bottom-0 z-10">
                  <button onClick={() => setShowAddModal(false)} className="px-8 py-2 border-2 border-[#D8DDE1] rounded-[5px] text-[#666666] hover:bg-gray-50 font-medium">Cancel</button>
                  <button className="px-8 py-2 bg-[#BA3C54] text-white rounded-[5px] hover:bg-[#a03045] font-medium">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}