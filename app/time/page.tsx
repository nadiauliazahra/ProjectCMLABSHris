"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function TimePage() {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Controls whether the "Add New Data" popup is visible or hidden.
  const [showAddModal, setShowAddModal] = useState(false);

  // Stores the specific employee object when you click "View". If null, the side drawer is closed.
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Stores whatever the user types in the search bar.
  const [searchQuery, setSearchQuery] = useState("");

  // Controls the Filter Dropdown menu visibility and the selected values.
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All"); // Default shows everyone
  const [sortOption, setSortOption] = useState("Default"); // Default sorting order
  
  // Stores the Start and End dates for the Date Range filter.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Controls the "Are you sure?" popup. 
  // Store 'employeeId' so we know WHO we are approving/rejecting.
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "approve", // Can be 'approve' or 'reject' to change the text color/label
    employeeId: 0,
    employeeName: "",
  });

  // Pagination: Which page are we on? How many rows to show?
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // ==========================================================================
  // MOCK DATA
  // ==========================================================================
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, name: "Faiza", role: "Employee", date: "2025-10-26", clockIn: "08:00", clockOut: "16:30", workHours: "10h 5m", status: "Waiting Approval", avatar: "https://placehold.co/40x40" },
    { id: 2, name: "Nadia", role: "Employee", date: "2025-10-25", clockIn: "08:15", clockOut: "17:00", workHours: "8h 45m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 3, name: "Riyanti", role: "Manager", date: "2025-10-24", clockIn: "07:50", clockOut: "16:00", workHours: "8h 10m", status: "Rejected", avatar: "https://placehold.co/40x40" },
    { id: 4, name: "Fawaz", role: "Employee", date: "2025-10-26", clockIn: "08:05", clockOut: "17:05", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 5, name: "Naila", role: "Employee", date: "2025-10-26", clockIn: "08:30", clockOut: "17:30", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 6, name: "Callysta", role: "Employee", date: "2025-10-25", clockIn: "07:45", clockOut: "16:45", workHours: "9h 0m", status: "Waiting Approval", avatar: "https://placehold.co/40x40" },
    { id: 7, name: "Dewi Lestari", role: "HR", date: "2025-10-24", clockIn: "09:00", clockOut: "18:00", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 8, name: "Eko Prasetyo", role: "IT", date: "2025-10-23", clockIn: "08:00", clockOut: "17:00", workHours: "9h 0m", status: "Rejected", avatar: "https://placehold.co/40x40" },
    { id: 9, name: "Fajar Nugraha", role: "Marketing", date: "2025-10-22", clockIn: "08:10", clockOut: "17:10", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 10, name: "Gita Savitri", role: "Finance", date: "2025-10-26", clockIn: "08:20", clockOut: "17:20", workHours: "9h 0m", status: "Waiting Approval", avatar: "https://placehold.co/40x40" },
    { id: 11, name: "Hendra Gunawan", role: "Sales", clockIn: "08:00", clockOut: "17:00", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
    { id: 12, name: "Indah Permata", role: "Support", clockIn: "08:15", clockOut: "17:15", workHours: "9h 0m", status: "Approved", avatar: "https://placehold.co/40x40" },
  ]);

  // --- HELPER 1: Get Unique Names for Dropdown ---
  // To scan the 'attendanceData', extract names, remove duplicates (Set), and sort them A-Z.
  const uniqueEmployees = Array.from(new Set(attendanceData.map(item => item.name)))
    .sort(); 

  // --- HELPER 2: Time Converter ---
  // Turns "10h 5m" into "605" (minutes) so we can sort "Work Hours" mathematically.
  const parseDuration = (str: string) => {
    const hours = parseInt(str.match(/(\d+)h/)?.[1] || "0");
    const minutes = parseInt(str.match(/(\d+)m/)?.[1] || "0");
    return hours * 60 + minutes;
  };

  // ==========================================================================
  // FILTER ENGINE
  // Running automatically every time the data or a filter changes.
  // ==========================================================================
  const filteredData = attendanceData.filter((item) => {
    // 1. Check Search Input (Name OR Role)
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Check Dropdown Status (Approved, Waiting, etc.)
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;

    // 3. Check Date Range
    let matchesDate = true;
    if (startDate && item.date) {
      matchesDate = matchesDate && new Date(item.date) >= new Date(startDate);
    }
    if (endDate && item.date) {
      matchesDate = matchesDate && new Date(item.date) <= new Date(endDate);
    }

    // Only keep item if ALL 3 checks pass
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    // 4. Sort the remaining items based on the dropdown selection
    switch (sortOption) {
      case "Name A-Z": return a.name.localeCompare(b.name);
      case "Name Z-A": return b.name.localeCompare(a.name);
      case "Date Newest": return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      case "Date Oldest": return new Date(a.date || "").getTime() - new Date(b.date || "").getTime();
      case "Jabatan A-Z": return a.role.localeCompare(b.role);
      case "Jabatan Z-A": return b.role.localeCompare(a.role);
      case "Clock In Earliest": return a.clockIn.localeCompare(b.clockIn);
      case "Clock In Latest": return b.clockIn.localeCompare(a.clockIn);
      case "Work Hours High": return parseDuration(b.workHours) - parseDuration(a.workHours);
      case "Work Hours Low": return parseDuration(a.workHours) - parseDuration(b.workHours);
      default: return 0; // No sorting
    }
  });

  // ==========================================================================
  // PAGINATION LOGIC
  // Decides which chunk of the filtered data to show right now.
  // ==========================================================================
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  // Safety: If you filter and results shrink to 1 page, but you were on page 5, go back to page 1.
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  // Cut the array: e.g., showing items 10 to 20
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  // Opens the "Are you sure?" modal
  const handleActionClick = (type: "approve" | "reject", emp: any) => {
    setConfirmModal({
      isOpen: true,
      type: type,
      employeeId: emp.id,
      employeeName: emp.name,
    });
  };

  // Runs when you click "Approve/Reject" inside the Confirmation Modal
  const executeAction = () => {
    const newStatus = confirmModal.type === "approve" ? "Approved" : "Rejected";
    
    // Update the master list
    setAttendanceData((prevData) =>
      prevData.map((item) =>
        item.id === confirmModal.employeeId ? { ...item, status: newStatus } : item
      )
    );
    
    // If the side drawer is open for this person, update that status too
    if (selectedEmployee && selectedEmployee.id === confirmModal.employeeId) {
        setSelectedEmployee((prev: any) => ({ ...prev, status: newStatus }));
    }

    // Close the modal
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Opens the Side Drawer
  const handleViewDetail = (emp: any) => {
    setSelectedEmployee(emp);
  };

  // Resets all search/filter inputs
  const clearFilters = () => {
    setFilterStatus("All");
    setSortOption("Default");
    setStartDate("");
    setEndDate("");
    setSearchQuery(""); 
    setShowFilter(false);
  };

  // ==========================================================================
  // UI RENDERING
  // ==========================================================================
  return (
    <div className="flex-1 bg-[#F3F5F6] min-h-screen font-sans relative overflow-x-hidden">
      
      {/* MAIN CARD */}
      <div className={`bg-white rounded-xl shadow-sm border border-[#D8DDE1] p-6 transition-all duration-300 ${selectedEmployee ? 'mr-[500px]' : ''}`}>

        {/* TOP TOOLBAR: Search, Filter, Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <h2 className="font-bold text-black text-2xl flex-1">All Employees Information</h2>
          <div className="flex gap-3 w-full md:w-auto relative">
            
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Employee" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#D8DDE1] rounded-lg text-sm focus:outline-none focus:border-[#1E3A5F] w-64 text-black" 
              />
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            {/* Filter Button Container */}
            <div className="relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-black text-sm font-medium transition-colors ${showFilter ? 'bg-gray-100 border-gray-400' : 'border-[#D8DDE1] hover:bg-gray-50'}`}
                >
                <Icon icon="material-symbols:tune" className="text-lg" /> Filter
                </button>

                {/* The Dropdown Menu */}
                {showFilter && (
                    <div className="absolute right-0 top-12 w-72 bg-white border border-[#D8DDE1] rounded-lg shadow-xl z-20 p-4 text-black">
                        {/* Dropdown Content */}
                        <div className="space-y-4">
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

                            <div>
                                <label className="block text-sm font-semibold mb-2">Status</label>
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Waiting Approval">Waiting Approval</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-2">Sort By</label>
                                <select 
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    <option value="Default">Default</option>
                                    <optgroup label="Name">
                                      <option value="Name A-Z">Name (A-Z)</option>
                                      <option value="Name Z-A">Name (Z-A)</option>
                                    </optgroup>
                                    <optgroup label="Date">
                                      <option value="Date Newest">Date (Newest)</option>
                                      <option value="Date Oldest">Date (Oldest)</option>
                                    </optgroup>
                                    <optgroup label="Jabatan">
                                      <option value="Jabatan A-Z">Jabatan (A-Z)</option>
                                      <option value="Jabatan Z-A">Jabatan (Z-A)</option>
                                    </optgroup>
                                    <optgroup label="Time">
                                      <option value="Clock In Earliest">Clock In (Earliest)</option>
                                      <option value="Clock In Latest">Clock In (Latest)</option>
                                      <option value="Work Hours High">Work Hours (Highest)</option>
                                      <option value="Work Hours Low">Work Hours (Lowest)</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-black underline">Reset</button>
                                <button onClick={() => setShowFilter(false)} className="bg-[#1E3A5F] text-white px-3 py-1 rounded text-xs hover:bg-[#2b4c75]">Apply</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2b4c75] text-sm font-medium">
              <Icon icon="mdi:plus" className="text-lg" /> Tambah Data
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="text-[#596171] text-sm">
                <th className="p-4 font-medium bg-[#F3F5F6] rounded-l-[5px] border-y border-l border-[#F3F5F6] whitespace-nowrap">Employee Name</th>
                <th className="p-4 font-medium bg-[#F3F5F6] border-y border-[#F3F5F6]">Jabatan</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6] whitespace-nowrap">Clock In</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6] whitespace-nowrap">Clock Out</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6] whitespace-nowrap">Work Hours</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6]">Approve</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] border-y border-[#F3F5F6]">Status</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] rounded-r-[5px] border-y border-r border-[#F3F5F6]">Details</th>
              </tr>
            </thead>

            <tbody>
              <tr className="h-4"></tr>
              
              {/* Conditionally render table rows OR empty state */}
              {currentData.length > 0 ? (
                currentData.map((data) => (
                  <tr key={data.id} className="border-b border-[#EEF2F5] hover:bg-gray-50 text-black text-sm">
                    <td className="p-4 border-b border-[#EEF2F5] whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={data.avatar} alt={data.name} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div className="flex flex-col">
                          <span className="font-medium">{data.name}</span>
                          {data.date && <span className="text-xs text-gray-400">{data.date}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 border-b border-[#EEF2F5] whitespace-nowrap">{data.role}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5] whitespace-nowrap">{data.clockIn}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5] whitespace-nowrap">{data.clockOut}</td>
                    <td className="p-4 text-center font-medium border-b border-[#EEF2F5] whitespace-nowrap">{data.workHours}</td>
                    
                    {/* Approve/Reject Buttons */}
                    <td className="p-4 border-b border-[#EEF2F5]">
                      {data.status === "Waiting Approval" ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleActionClick('approve', data)} className="w-8 h-8 flex items-center justify-center bg-[#247046] text-white rounded hover:bg-green-700">
                            <Icon icon="mdi:check" className="text-lg" />
                          </button>
                          <button onClick={() => handleActionClick('reject', data)} className="w-8 h-8 flex items-center justify-center bg-[#C11106] text-white rounded hover:bg-red-700">
                            <Icon icon="mdi:close" className="text-lg" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs">-</div>
                      )}
                    </td>

                    {/* Status Badge with dynamic colors */}
                    <td className="p-4 text-center border-b border-[#EEF2F5] whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        data.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                        data.status === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {data.status}
                      </span>
                    </td>
                    
                    {/* View Details Button */}
                    <td className="p-4 text-center border-b border-[#EEF2F5]">
                      <button onClick={() => handleViewDetail(data)} className="px-3 py-1 border border-gray-400 rounded text-xs hover:bg-gray-800 hover:text-white transition">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                /* EMPTY STATE if no data found */
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <Icon icon="mdi:file-search-outline" className="text-4xl text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">No Data Found</h3>
                      <p className="text-gray-500 text-sm mb-6 max-w-xs">
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

        {/* PAGINATION FOOTER */}
        <div className="grid grid-cols-3 items-center mt-6 pt-4">
          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-2 justify-start">
            <span className="text-sm text-gray-500">Showing</span>
            <div className="relative">
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="appearance-none border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:border-[#1E3A5F] cursor-pointer pr-8 bg-white">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base" />
            </div>
          </div>
          {/* Page Info */}
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">
              {totalRecords > 0 ? `Showing ${startRecord} to ${endRecord} out of ${totalRecords} records` : ''}
            </p>
          </div>
          {/* Page Buttons */}
          <div className="flex justify-end gap-1">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"><Icon icon="mdi:chevron-left" className="text-2xl" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-all ${currentPage === pageNum ? "border border-gray-400 text-black bg-white" : "text-gray-500 hover:bg-gray-50"}`}>{pageNum}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"><Icon icon="mdi:chevron-right" className="text-2xl" /></button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* DETAIL DRAWER */}
      {/* ================================================================= */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${selectedEmployee ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedEmployee && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">Attendance Details</h2>
              <button onClick={() => setSelectedEmployee(null)} className="text-gray-500 hover:text-black">
                <Icon icon="mdi:close" className="text-3xl" />
              </button>
            </div>
            {/* Profile Card */}
            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6 flex items-center gap-4">
              <div className="relative">
                <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-16 h-16 rounded-full border border-gray-200" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-black">{selectedEmployee.name}</h3>
                <p className="text-gray-500 text-sm">{selectedEmployee.role}</p>
              </div>
              <div className={`px-3 py-1 rounded text-xs flex items-center gap-2 border border-[#D8DDE1] whitespace-nowrap ${selectedEmployee.status === "Approved" ? "bg-green-50 text-green-700" : selectedEmployee.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-[#F3F5F6] text-[#676767]"}`}>
                <span className={`w-2 h-2 rounded-full ${selectedEmployee.status === "Approved" ? "bg-green-700" : selectedEmployee.status === "Rejected" ? "bg-red-700" : "bg-[#676767]"}`}></span>
                {selectedEmployee.status === "Waiting Approval" ? "Waiting Approval" : selectedEmployee.status}
              </div>
            </div>
            {/* Attendance Details Block */}
            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-black mb-4">Attendance Information</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div><p className="text-gray-500 text-xs mb-1">Date</p><p className="font-semibold text-black text-sm">{selectedEmployee.date || '1 March 2025'}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Check In</p><p className="font-semibold text-black text-sm">{selectedEmployee.clockIn}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Check Out</p><p className="font-semibold text-black text-sm">{selectedEmployee.clockOut}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Status</p><p className="font-semibold text-black text-sm">Present</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Work Hours</p><p className="font-semibold text-black text-sm">{selectedEmployee.workHours}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
              </div>
            </div>
            {/* Location Details Block */}
            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-black mb-4">Location Information</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div><p className="text-gray-500 text-xs mb-1">Location</p><p className="font-semibold text-black text-sm">Kantor Pusat</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Detail Address</p><p className="font-semibold text-black text-sm">Kota Malang, Jawa Timur</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Lat</p><p className="font-semibold text-black text-sm">0.000000</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Long</p><p className="font-semibold text-black text-sm">0.000000</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
              </div>
            </div>
            {/* Proof Image Block */}
            <div className="border border-[#D8DDE1] rounded-lg p-6">
              <h3 className="font-bold text-lg text-black mb-4">Location Information</h3>
              <div className="border border-[#D8DDE1] rounded flex items-center justify-between p-3">
                <div className="flex items-center gap-3"><Icon icon="mdi:file-image-outline" className="text-gray-500 text-xl" /><span className="text-gray-600 text-sm font-medium">Proof of Attendance.JPG</span></div>
                <div className="flex gap-3"><Icon icon="mdi:eye-outline" className="text-gray-500 cursor-pointer hover:text-black" /><Icon icon="mdi:download-outline" className="text-gray-500 cursor-pointer hover:text-black" /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* CONFIRMATION MODAL */}
      {/* ================================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white w-[700px] rounded-[5px] border-2 border-[#D8DDE1] shadow-2xl overflow-hidden relative">
            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="absolute top-4 right-4 text-gray-400 hover:text-black"><Icon icon="mdi:close" className="text-2xl" /></button>
            <div className="p-10 flex gap-6 items-start">
              <div className="w-[87px] h-[87px] flex-shrink-0">
                <img src="/confirm-icon.png" alt="Confirmation Icon" className="w-full h-full object-contain" />
              </div>
              <div className="mt-2">
                <h2 className="text-2xl font-bold text-black mb-2">{confirmModal.type === 'approve' ? 'Approve Attendance?' : 'Reject Attendance?'}</h2>
                <p className="text-lg text-black leading-7">Are you sure you want to {confirmModal.type} this employee's attendance? <br /> This action cannot be undone.</p>
              </div>
            </div>
            <div className="h-[91px] bg-[#F3F5F6] border-t border-[#E5E7EB] flex items-center justify-end px-10 gap-4">
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="w-[84px] h-[41px] bg-white border border-[#444444] rounded-[5px] text-[#444444] text-base font-normal hover:bg-gray-50">Cancel</button>
              <button onClick={executeAction} className={`w-[97px] h-[41px] text-white rounded-[5px] text-base font-normal hover:opacity-90 ${confirmModal.type === 'approve' ? 'bg-[#B93B53]' : 'bg-[#C11106]'}`}>{confirmModal.type === 'approve' ? 'Approve' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ADD CHECKCLOCK MODAL (The Form) */}
      {/* ================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white w-full max-w-6xl rounded-[10px] shadow-2xl flex flex-col h-[95vh] max-h-[1024px]">
            <div className="px-8 py-6"><h2 className="text-2xl font-bold text-black">Add Checkclock</h2></div>
            <div className="flex-1 px-8 pb-8 overflow-hidden">
                <div className="w-full h-full border-2 border-[#D8DDE1] rounded-[10px] flex flex-col overflow-hidden relative bg-white">
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div><label className="block text-lg font-medium text-black mb-2">Karyawan</label><div className="relative"><select className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"><option>Pilih Karyawan</option>{uniqueEmployees.map((name) => (<option key={name} value={name}>{name}</option>))}</select><Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" /></div></div>
                        <div><label className="block text-lg font-medium text-black mb-2">Tipe Absensi</label><div className="relative"><select className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"><option>Pilih Tipe Absensi</option><option>Clock In</option><option>Clock Out</option><option>Sick Leave</option></select><Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" /></div></div>
                        <div><label className="block text-lg font-medium text-black mb-2">Upload Bukti Pendukung</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-white h-64"><div className="bg-gray-200 p-4 rounded-full mb-3"><Icon icon="mdi:image-outline" className="text-4xl text-gray-500" /></div><p className="text-gray-500">Drag and drop here <br /> or <span className="font-bold text-gray-700 cursor-pointer">Browse</span></p></div><button className="w-full bg-[#1E3A5F] text-white font-semibold py-3 rounded-lg mt-4 hover:bg-[#2b4c75]">Upload</button></div>
                      </div>
                      <div className="space-y-6">
                        <div><label className="block text-lg font-medium text-black mb-2">Lokasi</label><div className="relative"><select className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"><option>Pilih Lokasi</option><option>Head Office (Malang)</option><option>Branch Office (Jakarta)</option></select><Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" /></div></div>
                        <div className="w-full h-64 bg-gray-200 rounded-lg border border-gray-300 relative overflow-hidden group"><img src="https://placehold.co/600x400/png?text=Map+Preview" alt="Map" className="w-full h-full object-cover opacity-60" /><div className="absolute bottom-4 right-4 flex flex-col gap-2"><button className="bg-white p-1 rounded shadow hover:bg-gray-100"><Icon icon="mdi:plus" className="text-black"/></button><button className="bg-white p-1 rounded shadow hover:bg-gray-100"><Icon icon="mdi:minus" className="text-black"/></button></div></div>
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