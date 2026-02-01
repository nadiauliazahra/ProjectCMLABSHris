"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'; // Import Router
import { API_URL } from '../../../utils/config';

// Dynamically import the Map component (Client Side Only)
const MapPicker = dynamic(() => import('../../../components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function EmployeeTimePage() {
  const router = useRouter(); // Initialize router

  // --- STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data
  const [myAttendance, setMyAttendance] = useState<any[]>([]);

  // Form
  const [formData, setFormData] = useState({
    type: "Clock In",
    date: new Date().toISOString().split('T')[0],
    location_name: "",
    address: "",
    lat: "",
    lng: ""
  });

  // --- AUTH CHECKER ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        // If no token, redirect to login
        router.push("/login"); 
    } else {
        // Only fetch data if we have a token
        fetchAttendance();
    }
  }, []);

  // --- HELPERS ---
  const getToken = () => localStorage.getItem("token");

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const calculateWorkHours = (start: string | null, end: string | null) => {
    if (!start || !end) return "-";
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return "-";
    const diffMs = endTime.getTime() - startTime.getTime();
    if (diffMs < 0) return "-"; 
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatLeaveType = (type: string) => {
    if (type === 'present') return '-';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // --- API FUNCTIONS ---

  const fetchAttendance = async () => {
    try {
      const token = getToken();
      if(!token) return;

      const response = await axios.get(`${API_URL}/attendance/my`, {
        headers: { Authorization: `Bearer ${token}` } // Use Dynamic Token
      });

      const formattedData = response.data.data.map((item: any) => {
        const isLeave = item.type !== 'present';
        const displayLabel = isLeave ? formatLeaveType(item.type) : "-";

        return {
            id: item.id,
            date: item.date,
            clockIn: isLeave ? displayLabel : (item.check_in ? new Date(item.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"),
            clockOut: isLeave ? displayLabel : (item.check_out ? new Date(item.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"),
            workHours: isLeave ? "-" : calculateWorkHours(item.check_in, item.check_out),
            location_name: item.location_name || "-",
            address: item.address || "-",
            lat: item.lat || "0",
            lng: item.lng || "0",
            type: item.type,
            status: item.status_approve === 'approved' ? 'Approved' : 
                    item.status_approve === 'rejected' ? 'Rejected' : 'Waiting Approval',
        };
      });

      setMyAttendance(formattedData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if(error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const token = getToken(); // Get fresh token
    
    try {
      const existingRecord = myAttendance.find(r => r.date === formData.date);

      if (formData.type === "Clock In") {
        if (existingRecord && existingRecord.clockOut === "-" && existingRecord.type === 'present') {
            throw new Error("You already have an active session! Please Clock Out first.");
        }
        await axios.post(`${API_URL}/attendance`, {
            date: formData.date,
            type: 'present',
            lat: formData.lat,
            lng: formData.lng,
            location_name: formData.location_name,
            address: formData.address,
            check_in: new Date() 
        }, { headers: { Authorization: `Bearer ${token}` } });
        alert("Clock In Successful!");
      } 
      
      else if (formData.type === "Clock Out") {
        const recordToClose = myAttendance.find(r => r.date === formData.date && r.clockOut === "-" && r.type === 'present');
        if (!recordToClose) {
            throw new Error(`No active 'Clock In' session found for ${formData.date}. Cannot Clock Out.`);
        }

        await axios.put(`${API_URL}/attendance/${recordToClose.id}`, {
            check_out: new Date(),
            lat: formData.lat, 
            lng: formData.lng,
            location_name: formData.location_name,
            address: formData.address
        }, { headers: { Authorization: `Bearer ${token}` } });
        alert("Clock Out Successful!");
      }

      else {
        // Handle Leaves
        const openSession = myAttendance.find(r => r.date === formData.date && r.clockOut === "-" && r.type === 'present');
        if (openSession) {
            await axios.put(`${API_URL}/attendance/${openSession.id}`, {
                check_out: new Date()
            }, { headers: { Authorization: `Bearer ${token}` } });
        }

        await axios.post(`${API_URL}/attendance`, {
            date: formData.date,
            type: formData.type === "Annual Leave" ? "annual_leave" : "sick_leave",
        }, { headers: { Authorization: `Bearer ${token}` } });
        alert(`${formData.type} Submitted!`);
      }

      setShowAddModal(false);
      fetchAttendance(); 
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep detectLocation and other helpers same) ...
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        }));
      });
    }
  };

  // ... (Keep Filter Logic and Render Logic same) ...
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Waiting Approval": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("All");
  };

  const filteredData = myAttendance.filter((item) => {
    const matchesSearch = item.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="flex-1 bg-[#F3F5F6] min-h-screen font-sans p-0 relative overflow-x-hidden">
      
      <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE1] p-6">
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <h2 className="font-bold text-black text-2xl flex-1">Checkclock Overview</h2>
          <div className="flex gap-3 w-full md:w-auto relative">
            
            {/* SEARCH */}
            <div className="relative">
              <input type="text" placeholder="Search Date" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-[#D8DDE1] rounded-lg text-sm w-64 text-black" />
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            
            {/* FILTER BUTTON */}
            <div className="relative">
                <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-black hover:bg-gray-50 text-sm font-medium transition-colors ${showFilter ? 'bg-gray-100 border-gray-400' : 'border-[#D8DDE1] hover:bg-gray-50'}`}>
                    <Icon icon="material-symbols:tune" className="text-lg" /> Filter
                </button>
                {showFilter && (
                    <div className="absolute right-0 top-12 w-72 bg-white border border-[#D8DDE1] rounded-lg shadow-xl z-20 p-4 text-black">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Status</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                                    <option value="All">All Statuses</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Waiting Approval">Waiting Approval</option>
                                </select>
                            </div>
                            <button onClick={clearFilters} className="text-xs text-blue-600 underline">Reset Filters</button>
                        </div>
                    </div>
                )}
            </div>
            
            <button onClick={() => { setShowAddModal(true); detectLocation(); }} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2b4c75] text-sm font-medium">
              <Icon icon="mdi:plus" className="text-lg" /> Tambah Data
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="text-[#596171] text-sm">
                <th className="p-4 font-medium bg-[#F3F5F6] rounded-l-[5px]">Date</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Clock In</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Clock Out</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Work Hours</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6]">Status</th>
                <th className="p-4 font-medium text-center bg-[#F3F5F6] rounded-r-[5px]">Details</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                  currentData.map((data, index) => (
                    <tr key={`${data.id}-${index}`} className="border-b border-[#EEF2F5] hover:bg-gray-50 text-black text-sm">
                      <td className="p-4 border-b border-[#EEF2F5] font-medium">{formatDate(data.date)}</td>
                      <td className={`p-4 text-center border-b border-[#EEF2F5] ${data.type !== 'present' ? 'text-gray-500 italic' : ''}`}>
                        {data.clockIn}
                      </td>
                      <td className={`p-4 text-center border-b border-[#EEF2F5] ${data.type !== 'present' ? 'text-gray-500 italic' : ''}`}>
                        {data.clockOut}
                      </td>
                      <td className="p-4 text-center font-medium border-b border-[#EEF2F5]">{data.workHours}</td>
                      <td className="p-4 text-center border-b border-[#EEF2F5]">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.status)}`}>
                          {data.status}
                        </span>
                      </td>
                      <td className="p-4 text-center border-b border-[#EEF2F5]">
                        <button 
                            onClick={() => setSelectedAttendance(data)}
                            className="px-3 py-1 border border-gray-400 rounded text-xs hover:bg-gray-800 hover:text-white transition"
                        >
                            View
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
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
        
        {/* PAGINATION */}
        <div className="grid grid-cols-3 items-center mt-6 pt-4">
            <div className="flex items-center gap-2 justify-start">
                <span className="text-sm text-gray-500">Showing</span>
                <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="border rounded px-2 py-1 text-sm"><option value={10}>10</option><option value={20}>20</option></select>
            </div>
            <div className="flex justify-center"><p className="text-sm text-gray-500">Showing {1} to {Math.min(rowsPerPage, totalRecords)} of {totalRecords}</p></div>
            <div className="flex justify-end gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage===1} className="p-1"><Icon icon="mdi:chevron-left"/></button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage===totalPages} className="p-1"><Icon icon="mdi:chevron-right"/></button>
            </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${selectedAttendance ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedAttendance && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">Attendance Details</h2>
              <button onClick={() => setSelectedAttendance(null)} className="text-gray-500 hover:text-black">
                <Icon icon="mdi:close" className="text-3xl" />
              </button>
            </div>

            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6 flex items-center justify-between bg-gray-50">
                <div>
                    <h3 className="font-bold text-lg text-black">{selectedAttendance.type === 'present' ? 'Regular Shift' : formatLeaveType(selectedAttendance.type)}</h3>
                    <p className="text-gray-500 text-sm">ID: #{selectedAttendance.id}</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs border ${getStatusColor(selectedAttendance.status)}`}>
                    {selectedAttendance.status}
                </div>
            </div>

            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-black mb-4">Time Information</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div><p className="text-gray-500 text-xs mb-1">Date</p><p className="font-semibold text-black text-sm">{selectedAttendance.date}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Work Hours</p><p className="font-semibold text-black text-sm">{selectedAttendance.workHours}</p><div className="h-1 w-10 bg-[#D8DDE1] mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Clock In</p><p className="font-semibold text-green-700 text-sm">{selectedAttendance.clockIn}</p><div className="h-1 w-10 bg-green-200 mt-2"></div></div>
                <div><p className="text-gray-500 text-xs mb-1">Clock Out</p><p className="font-semibold text-red-700 text-sm">{selectedAttendance.clockOut}</p><div className="h-1 w-10 bg-red-200 mt-2"></div></div>
              </div>
            </div>

            <div className="border border-[#D8DDE1] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-black mb-4">Location Information</h3>
              <div className="grid grid-cols-1 gap-y-4">
                <div><p className="text-gray-500 text-xs mb-1">Location Name</p><p className="font-semibold text-black text-sm">{selectedAttendance.location_name}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Address</p><p className="font-semibold text-black text-sm">{selectedAttendance.address}</p></div>
                
                {/* DRAWER MAP */}
                <div className="w-full h-56 relative -mx-6 mb-4"> 
                    <MapPicker 
                        lat={selectedAttendance.lat} 
                        lng={selectedAttendance.lng} 
                        readonly={true} 
                    />
                </div>
                
                <div className="grid grid-cols-2">
                    <div><p className="text-gray-500 text-xs">Lat</p><p className="text-black text-xs">{selectedAttendance.lat}</p></div>
                    <div><p className="text-gray-500 text-xs">Long</p><p className="text-black text-xs">{selectedAttendance.lng}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white w-full max-w-6xl rounded-[10px] shadow-2xl flex flex-col h-[95vh] max-h-[1024px]">
            <div className="px-8 py-6"><h2 className="text-2xl font-bold text-black">Add Attendance Data</h2></div>
            <div className="flex-1 px-8 pb-8 overflow-hidden">
              <div className="w-full h-full border-2 border-[#D8DDE1] rounded-[10px] flex flex-col overflow-hidden relative bg-white">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium text-black mb-2">Date</label>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                <div className="bg-[#F3F5F6] px-3 py-2 border-r border-gray-300 flex items-center justify-center"><Icon icon="mdi:calendar-blank" className="text-gray-600 text-xl" /></div>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-3 text-gray-700 bg-white focus:outline-none" />
                            </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-black mb-2">Upload Proof</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-white h-64"><Icon icon="mdi:image-outline" className="text-4xl text-gray-500 mb-2" /><p className="text-gray-500">Preview Only</p></div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div><label className="block text-lg font-medium text-black mb-2">Location Name</label><input type="text" placeholder="e.g. Office" value={formData.location_name} onChange={(e) => setFormData({...formData, location_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-white"/></div>
                      
                      {/* IMMERSIVE MAP */}
                      <div className="w-full h-80 relative shadow-sm"> 
                        <MapPicker 
                            lat={formData.lat} 
                            lng={formData.lng} 
                            onChange={(newLat: number, newLng: number) => {
                                setFormData(prev => ({
                                    ...prev,
                                    lat: newLat.toString(),
                                    lng: newLng.toString()
                                }));
                            }}
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

                      <div><label className="block text-lg font-medium text-black mb-2">Address</label><textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 h-24 resize-none"></textarea></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-lg font-medium text-black mb-2">Lat</label><input type="text" readOnly value={formData.lat} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50" /></div>
                        <div><label className="block text-lg font-medium text-black mb-2">Long</label><input type="text" readOnly value={formData.lng} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white flex justify-end gap-4 sticky bottom-0 z-10">
                  <button onClick={() => setShowAddModal(false)} className="px-8 py-2 border-2 border-[#D8DDE1] rounded-[5px] text-[#666666] hover:bg-gray-50 font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={loading} className="px-8 py-2 bg-[#BA3C54] text-white rounded-[5px] hover:bg-[#a03045] font-medium">{loading ? "Processing..." : "Submit"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}