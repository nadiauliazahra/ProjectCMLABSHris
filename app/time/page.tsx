"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_URL } from "../../utils/config";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("../../components/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>,
});

export default function TimePage() {
  const router = useRouter();

  // --- 1. DATA STATE ---
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // RAW DATA FROM API
  const [employees, setEmployees] = useState<any[]>([]); 

  // --- 2. FILTER STATE (Your Engine Config) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("Default");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- 3. PAGINATION STATE ---
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- 4. MODAL STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null); 
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, type: "approve", id: null as number | null, name: "",
  });

  // --- 5. FORM STATE ---
  const [formData, setFormData] = useState({
    employee_id: "", type: "Clock In", date: new Date().toISOString().split('T')[0],
    check_in: "", check_out: "", location_name: "Office",
    address: "", lat: -6.175392, lng: 106.827153, proof_url: "",
  });

  // --- INIT ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login"); 
    else { 
        fetchAttendance(token); 
        fetchEmployees(token); 
    }
  }, []);

  // --- FETCHING (Get LOTS of data so client filter works) ---
  const fetchAttendance = async (token: string) => {
    setLoading(true);
    try {
      // Fetching 500 items so your client-side filter has data to work with
      const response = await axios.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }, 
        params: { limit: 500, _t: new Date().getTime() },
      });
      setAttendanceData(response.data.rows || response.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) router.push("/login");
    } finally { setLoading(false); }
  };

  const fetchEmployees = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }, params: { limit: 100 }
      });
      setEmployees(response.data.data || response.data.rows || []);
    } catch (error) { console.error("Failed to load employees", error); }
  };

  // ==========================================================================
  // FILTER ENGINE (YOUR LOGIC)
  // ==========================================================================
  
  // Helper to parse duration for sorting
  const getDuration = (start: string, end: string) => {
      if(!start || !end) return 0;
      return new Date(end).getTime() - new Date(start).getTime();
  };

  const filteredData = attendanceData.filter((item) => {
    // 1. Check Search Input (Name OR Role)
    // Note: accessing nested Employee object safely
    const fullName = `${item.Employee?.first_name || ''} ${item.Employee?.last_name || ''}`.toLowerCase();
    const role = (item.Employee?.position || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = fullName.includes(query) || role.includes(query);
    
    // 2. Check Dropdown Status
    // Note: item.status_approve is from API
    const matchesStatus = filterStatus === "All" || item.status_approve.toLowerCase() === filterStatus.toLowerCase();

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
    // 4. Sort based on selection
    const nameA = `${a.Employee?.first_name} ${a.Employee?.last_name}`.toLowerCase();
    const nameB = `${b.Employee?.first_name} ${b.Employee?.last_name}`.toLowerCase();
    const roleA = (a.Employee?.position || "").toLowerCase();
    const roleB = (b.Employee?.position || "").toLowerCase();

    switch (sortOption) {
      case "Name A-Z": return nameA.localeCompare(nameB);
      case "Name Z-A": return nameB.localeCompare(nameA);
      case "Date Newest": return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      case "Date Oldest": return new Date(a.date || "").getTime() - new Date(b.date || "").getTime();
      case "Jabatan A-Z": return roleA.localeCompare(roleB);
      case "Jabatan Z-A": return roleB.localeCompare(roleA);
      case "Clock In Earliest": return new Date(a.check_in || 0).getTime() - new Date(b.check_in || 0).getTime();
      case "Clock In Latest": return new Date(b.check_in || 0).getTime() - new Date(a.check_in || 0).getTime();
      case "Work Hours High": return getDuration(b.check_in, b.check_out) - getDuration(a.check_in, a.check_out);
      case "Work Hours Low": return getDuration(a.check_in, a.check_out) - getDuration(b.check_in, b.check_out);
      default: return 0; // Default (usually ID or Date desc from API)
    }
  });

  // ==========================================================================
  // PAGINATION LOGIC
  // ==========================================================================
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // --- HANDLERS (Save, Confirm, Address) ---
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!formData.employee_id) { setLoading(false); return alert("Please select an employee"); }

      let apiType = 'present'; 
      if (formData.type === 'Annual Leave') apiType = 'annual_leave';
      if (formData.type === 'Sick Leave') apiType = 'sick_leave';
      
      const payload = {
          ...formData,
          type: apiType,
          check_in: formData.type === 'Clock In' ? (formData.check_in || new Date().toTimeString().slice(0,5)) : null,
          check_out: formData.type === 'Clock Out' ? (formData.check_out || new Date().toTimeString().slice(0,5)) : null,
      };

      await axios.post(`${API_URL}/attendance`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Success!");
      setShowAddModal(false);
      fetchAttendance(token);
      setFormData({ employee_id: "", type: "Clock In", date: new Date().toISOString().split('T')[0], check_in: "", check_out: "", location_name: "Office", address: "", lat: -6.175392, lng: 106.827153, proof_url: "" });

    } catch (error: any) { alert(error.response?.data?.message || "Failed"); } 
    finally { setLoading(false); }
  };

  const handleConfirmAction = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { type, id } = confirmModal;
      await axios.put(`${API_URL}/attendance/${id}/${type}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAttendance(token);
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error: any) { alert(error.response?.data?.message || "Action failed"); }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
      }, (err) => console.error(err));
    }
  };

  const clearFilters = () => {
    setFilterStatus("All"); setSortOption("Default"); setStartDate(""); setEndDate(""); setSearchQuery(""); setCurrentPage(1);
  };

  // --- RENDER HELPERS ---
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const formatTime = (t: string) => t && (t.includes('T') || t.includes('-')) ? new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : (t || "-");
  const calculateWorkHours = (s: string, e: string) => {
    if (!s || !e) return "-";
    const diff = new Date(e).getTime() - new Date(s).getTime();
    if (diff < 0) return "-";
    return `${Math.floor(diff / 36e5)}h ${Math.floor((diff % 36e5) / 6e4)}m`;
  };
  const getStatusColor = (s: string) => s === 'approved' ? "bg-green-100 text-green-700 border-green-200" : s === 'rejected' ? "bg-red-100 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200";
  const formatLeaveType = (type: string) => type ? type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "-";

  return (
    <div className="flex-1 bg-[#F3F5F6] min-h-screen font-sans p-6 relative overflow-x-hidden">
      
      <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE1] p-6 relative">
        
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center z-20 relative">
          <h2 className="font-bold text-black text-2xl flex-1">All Employees Information</h2>
          <div className="flex gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 pr-4 py-2 border border-[#D8DDE1] rounded-lg text-sm w-64 text-black outline-none focus:border-blue-500 transition-colors" />
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            {/* Filter Toggle */}
            <button onClick={() => setShowFilter(!showFilter)} 
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilter ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-[#D8DDE1] text-gray-700 hover:bg-gray-50'}`}>
              <Icon icon="mdi:filter-variant" className="text-lg" /> Filter
            </button>

            {/* Add Button */}
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2b4c75] text-sm font-medium">
              <Icon icon="mdi:plus" className="text-lg" /> Add New
            </button>
          </div>
        </div>

        {/* --- FLOATING FILTER CARD (The "Card" You Wanted) --- */}
        {showFilter && (
            <div className="absolute top-20 right-6 z-30 w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-gray-800">Filter & Sort</h3>
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Reset All</button>
                </div>
                
                <div className="space-y-4">
                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">STATUS</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-blue-500">
                            <option value="All">All Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Waiting">Waiting</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Sorting */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">SORT BY</label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-blue-500">
                            <option value="Default">Default</option>
                            <option value="Date Newest">Date (Newest)</option>
                            <option value="Date Oldest">Date (Oldest)</option>
                            <option value="Name A-Z">Name (A-Z)</option>
                            <option value="Name Z-A">Name (Z-A)</option>
                            <option value="Jabatan A-Z">Jabatan (A-Z)</option>
                            <option value="Work Hours High">Work Hours (High)</option>
                            <option value="Work Hours Low">Work Hours (Low)</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">DATE RANGE</label>
                        <div className="flex gap-2">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-1/2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700" />
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-1/2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TABLE --- */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="text-[#596171] text-sm">
                <th className="p-4 font-medium bg-[#F3F5F6] rounded-l-[5px]">Employee Name</th>
                <th className="p-4 font-medium bg-[#F3F5F6]">Jabatan</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Clock In</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Clock Out</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Work Hours</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Approve</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Status</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] rounded-r-[5px]">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading data...</td></tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={index} className="border-b border-[#EEF2F5] hover:bg-gray-50 text-black text-sm group">
                    <td className="p-4 border-b border-[#EEF2F5]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{item.Employee?.first_name?.charAt(0)}</div>
                        <div><p className="font-medium text-black">{item.Employee?.first_name} {item.Employee?.last_name}</p><p className="text-xs text-gray-500 font-mono">{formatDate(item.date)}</p></div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-[#EEF2F5] font-medium text-gray-600">{item.Employee?.position || '-'}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5]">{formatTime(item.check_in)}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5]">{formatTime(item.check_out)}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5] font-mono text-gray-600">{calculateWorkHours(item.check_in, item.check_out)}</td>
                    <td className="p-4 text-center border-b border-[#EEF2F5]">
                        {item.status_approve === 'waiting' ? (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setConfirmModal({ isOpen: true, type: "approve", id: item.id, name: "Request" })} className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><Icon icon="mdi:check" className="text-lg" /></button>
                                <button onClick={() => setConfirmModal({ isOpen: true, type: "reject", id: item.id, name: "Request" })} className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><Icon icon="mdi:close" className="text-lg" /></button>
                            </div>
                        ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="p-4 text-center border-b border-[#EEF2F5]"><span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase ${getStatusColor(item.status_approve)}`}>{item.status_approve}</span></td>
                    <td className="p-4 text-center border-b border-[#EEF2F5]"><button onClick={() => setSelectedAttendance(item)} className="px-3 py-1 border border-gray-400 rounded text-xs hover:bg-gray-800 hover:text-white">View</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="text-center py-20 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD MODAL (YOUR EXACT STRUCTURE) --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white w-full max-w-6xl rounded-[10px] shadow-2xl flex flex-col h-[95vh] max-h-[1024px]">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-2xl font-bold text-black">Add Attendance Data</h2><button onClick={() => setShowAddModal(false)}><Icon icon="mdi:close" className="text-2xl text-gray-400 hover:text-red-500"/></button></div>
            <div className="flex-1 px-8 py-6 overflow-hidden">
                <div className="w-full h-full border border-[#D8DDE1] rounded-[10px] flex flex-col overflow-hidden relative bg-white">
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      
                      {/* LEFT COLUMN */}
                      <div className="space-y-6">
                        
                        {/* Employee Selector (Added to make it functional) */}
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Employee</label>
                            <div className="relative">
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                                <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                            </div>
                        </div>

                        {/* Action Type */}
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Action Type</label>
                            <div className="relative">
                              <select 
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-3 appearance-none text-gray-700 bg-white"
                              >
                                <option value="Clock In">Clock In (Start)</option>
                                <option value="Clock Out">Clock Out (Finish)</option>
                                <option value="Annual Leave">Annual Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                              </select>
                              <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-black mb-2">Date</label>
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                    <div className="bg-[#F3F5F6] px-3 py-2 border-r border-gray-300 flex items-center justify-center"><Icon icon="mdi:calendar-blank" className="text-gray-600 text-xl" /></div>
                                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-3 text-gray-700 bg-white focus:outline-none" />
                                </div>
                            </div>
                            
                            {/* Time (Conditional based on Type) */}
                            {(formData.type === 'Clock In' || formData.type === 'Clock Out') && (
                                <div>
                                    <label className="block text-lg font-medium text-black mb-2">Time</label>
                                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                        <div className="bg-[#F3F5F6] px-3 py-2 border-r border-gray-300 flex items-center justify-center"><Icon icon="mdi:clock-outline" className="text-gray-600 text-xl" /></div>
                                        <input 
                                            type="time" 
                                            value={formData.type === 'Clock In' ? formData.check_in : formData.check_out} 
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                [formData.type === 'Clock In' ? 'check_in' : 'check_out']: e.target.value
                                            })} 
                                            className="w-full p-3 text-gray-700 bg-white focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Upload Proof */}
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Upload Proof</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-white h-64">
                                <Icon icon="mdi:image-outline" className="text-4xl text-gray-500 mb-2" />
                                <p className="text-gray-500">Preview Only</p>
                            </div>
                        </div>
                      </div>
                      
                      {/* RIGHT COLUMN */}
                      <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Location Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Office" 
                                value={formData.location_name} 
                                onChange={(e) => setFormData({...formData, location_name: e.target.value})} 
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-white"
                            />
                        </div>
                        
                        {/* IMMERSIVE MAP (EXACTLY AS REQUESTED) */}
                        <div className="w-full h-80 relative shadow-sm rounded-lg overflow-hidden border border-gray-300"> 
                          <MapPicker 
                              lat={formData.lat} 
                              lng={formData.lng} 
                              // IMPORTANT: This updates lat/lng when pin moves
                              onChange={(newLat: number, newLng: number) => {
                                  setFormData(prev => ({
                                      ...prev,
                                      lat: newLat,
                                      lng: newLng
                                  }));
                              }}
                              // IMPORTANT: This updates Address Textarea automatically
                              onAddressFound={(address: string) => {
                                  setFormData(prev => ({
                                      ...prev,
                                      address: address 
                                  }));
                              }}
                          />
                          <button 
                              onClick={(e) => { e.preventDefault(); detectLocation(); }}
                              className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-blue-600 transition-transform active:scale-95"
                              title="Re-center to my location"
                          >
                              <Icon icon="mdi:crosshairs-gps" className="text-xl" />
                          </button>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Address</label>
                            <textarea 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 h-24 resize-none"
                            ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-lg font-medium text-black mb-2">Lat</label><input type="text" readOnly value={formData.lat} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50" /></div>
                          <div><label className="block text-lg font-medium text-black mb-2">Long</label><input type="text" readOnly value={formData.lng} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* FOOTER */}
                  <div className="p-6 bg-white flex justify-end gap-4 sticky bottom-0 z-10 border-t border-gray-100">
                    <button onClick={() => setShowAddModal(false)} className="px-8 py-2 border-2 border-[#D8DDE1] rounded-[5px] text-[#666666] hover:bg-gray-50 font-medium">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-8 py-2 bg-[#BA3C54] text-white rounded-[5px] hover:bg-[#a03045] font-medium">{loading ? "Processing..." : "Submit"}</button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-black mb-2">Confirm Action</h3>
                <div className="flex gap-3 mt-6"><button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={handleConfirmAction} className={`flex-1 py-2 rounded-lg text-white ${confirmModal.type === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>Confirm</button></div>
            </div>
        </div>
      )}

      {/* DETAIL DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${selectedAttendance ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedAttendance && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-black">Details</h2><button onClick={() => setSelectedAttendance(null)}><Icon icon="mdi:close" className="text-3xl text-gray-500" /></button></div>
            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6 flex items-center justify-between bg-gray-50"><div><h3 className="font-bold text-lg text-black">{selectedAttendance.Employee?.first_name} {selectedAttendance.Employee?.last_name}</h3><p className="text-gray-500 text-sm">#{selectedAttendance.employee_id}</p></div><span className={`px-3 py-1 rounded text-xs border uppercase font-semibold ${getStatusColor(selectedAttendance.status_approve)}`}>{selectedAttendance.status_approve}</span></div>
            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6"><h3 className="font-bold text-lg text-black mb-4">Time</h3><div className="grid grid-cols-2 gap-6"><div><p className="text-gray-500 text-xs uppercase">Date</p><p className="font-semibold text-black">{formatDate(selectedAttendance.date)}</p></div><div><p className="text-gray-500 text-xs uppercase">Hours</p><p className="font-semibold text-black">{calculateWorkHours(selectedAttendance.check_in, selectedAttendance.check_out)}</p></div></div></div>
            <div className="border border-[#D8DDE1] rounded-lg p-6"><h3 className="font-bold text-lg text-black mb-4">Location</h3><p className="font-semibold text-black text-sm mb-2">{selectedAttendance.address}</p><div className="w-full h-48 relative rounded overflow-hidden"><MapPicker lat={selectedAttendance.lat} lng={selectedAttendance.lng} readonly={true} /></div></div>
          </div>
        )}
      </div>
    </div>
  );
}