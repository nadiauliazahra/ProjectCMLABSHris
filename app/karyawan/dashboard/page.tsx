"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from "@iconify/react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '../../../utils/config'; 
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function EmployeeDashboard() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  
  // Dropdown States
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showTimeRangeFilter, setShowTimeRangeFilter] = useState(false);
  const [showWeekFilter, setShowWeekFilter] = useState(false);

  // Date Range State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch "My Attendance" (Limit 100 to calculate stats)
        const response = await axios.get(`${API_URL}/attendance/my`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 100 } 
        });

        const data = response.data.rows || response.data.data || [];
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // --- FILTER ENGINE (THE FIX) ---
  const filteredData = useMemo(() => {
    // If no dates selected, return all data
    if (!startDate && !endDate) return attendanceData;

    return attendanceData.filter(item => {
        const itemDate = new Date(item.date).getTime();
        const start = startDate ? new Date(startDate).getTime() : 0;
        // Set end date to end of day (23:59:59) to ensure inclusion
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;

        return itemDate >= start && itemDate <= end;
    });
  }, [attendanceData, startDate, endDate]);

  // --- DATA PROCESSING ---
  
  // 1. Calculate Stats Cards (Using filteredData)
  const stats = useMemo(() => {
    let totalHours = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let leaveCount = 0;
    let presentCount = 0;

    filteredData.forEach(item => {
        // Count Status
        if (item.status_approve === 'approved') approved++;
        if (item.status_approve === 'waiting') pending++;
        if (item.status_approve === 'rejected') rejected++;

        // Count Types
        if (['annual_leave', 'sick_leave'].includes(item.type)) leaveCount++;
        if (item.type === 'present') presentCount++;

        // Calculate Work Hours
        if (item.check_in && item.check_out) {
            const start = new Date(item.check_in).getTime();
            const end = new Date(item.check_out).getTime();
            const hours = (end - start) / (1000 * 60 * 60);
            if (hours > 0) totalHours += hours;
        }
    });

    return { totalHours, approved, pending, rejected, leaveCount, presentCount };
  }, [filteredData]);

  // 2. Prepare Pie Chart Data
  const attendancePieData = useMemo(() => [
    { name: 'Present', value: stats.presentCount, color: '#247046' },
    { name: 'Leave', value: stats.leaveCount, color: '#C01005' },    
  ], [stats]);

  // 3. Prepare Bar Chart Data
  const workHoursData = useMemo(() => {
    const hoursByDate: Record<string, number> = {};
    
    filteredData.forEach(item => {
        if (item.check_in && item.check_out && item.date) {
            const dateKey = new Date(item.date).toISOString().split('T')[0];
            const start = new Date(item.check_in).getTime();
            const end = new Date(item.check_out).getTime();
            const hours = (end - start) / (1000 * 60 * 60);
            
            if (hours > 0) {
                hoursByDate[dateKey] = (hoursByDate[dateKey] || 0) + hours;
            }
        }
    });

    // Convert to Array & Sort
    const chartData = Object.keys(hoursByDate).sort().map(dateStr => ({
        date: new Date(dateStr),
        hours: parseFloat(hoursByDate[dateStr].toFixed(1))
    }));

    // Logic: If Filter is active, show ALL days in filter. 
    // If NO filter, just show last 7 days (Dashboard default).
    if (startDate || endDate) {
        return chartData;
    }
    return chartData.slice(-7);

  }, [filteredData, startDate, endDate]);


  // --- FORMATTERS ---
  const formatXAxis = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const formatTooltip = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  // --- HANDLERS ---
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleNavigate = (path: string) => {
    router.push(path); 
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex-1 bg-[#F3F5F6] min-h-screen font-sans p-6 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        
        {/* Date Filter Dropdown */}
        <div className="relative z-10">
            <button 
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-gray-50 transition-colors ${startDate || endDate ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-[#D8DDE1] text-[#596171]'}`}
            >
                <Icon icon="mdi:calendar-range" className="text-lg" />
                <span>{startDate ? `${startDate} - ${endDate || 'Now'}` : "Pilih Rentang Tanggal"}</span>
                <Icon icon="mdi:chevron-down" className={`text-lg transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Content */}
            {showDateFilter && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in duration-200">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2 text-[#1D395E]">Date Range</label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#1E3A5F]"
                            />
                            <span className="text-gray-400 font-bold">-</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#1E3A5F]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-black underline">Reset</button>
                        <button onClick={() => setShowDateFilter(false)} className="bg-[#1E3A5F] text-white px-4 py-1.5 rounded text-xs hover:bg-[#2b4c75] transition-colors">Apply</button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- TOP STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Work Hours */}
        <div className="bg-white p-5 rounded-xl border border-[#D8DDE1] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Icon icon="mdi:clock-time-eight" className="text-[#1D395E] text-lg" />
                    Work Hours
                </div>
            </div>
            <p className="text-4xl font-bold text-black">{Math.floor(stats.totalHours)}h</p>
        </div>

        {/* Attendance Approved */}
        <div className="bg-white p-5 rounded-xl border border-[#D8DDE1] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Icon icon="mdi:checkbox-marked-circle-outline" className="text-black text-lg" />
                    Attendance Approved
                </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats.approved}</p>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl border border-[#D8DDE1] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Icon icon="mdi:alert-circle" className="text-[#14AE5C] text-lg" />
                    Attendance Pending
                </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats.pending}</p>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-xl border border-[#D8DDE1] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Icon icon="mdi:close-circle" className="text-[#C11106] text-lg" />
                    Attendance Rejected
                </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats.rejected}</p>
        </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Attendance Summary (Pie Chart) */}
        <div className="bg-white rounded-xl border border-[#D8DDE1] shadow-sm h-[400px] flex flex-col p-6">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-xl font-bold text-black">Attendance Summary</h3>
                <div className="relative">
                    <button onClick={() => setShowMonthFilter(!showMonthFilter)} className="flex items-center gap-1 text-xs text-[#596171] border border-[#D8DDE1] px-2 py-1 rounded hover:bg-gray-50">
                        Select Month <Icon icon="mdi:chevron-down" className={`transition-transform ${showMonthFilter ? 'rotate-180' : ''}`}/>
                    </button>
                    {showMonthFilter && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded p-2 w-32 z-10">
                            <div className="text-xs p-1 hover:bg-gray-100 cursor-pointer rounded text-black">Current Month</div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="border-b border-[#D8DDE1] mb-4"></div>

            <div className="flex-1 relative flex flex-col justify-center items-center">
                <div className="relative w-full h-full">
                    {/* Centered Dynamic Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-0 pointer-events-none">
                        <p className="text-4xl font-bold text-black transition-all duration-300">
                            {activePieIndex !== null ? attendancePieData[activePieIndex].value : stats.presentCount}
                        </p>
                        <p className="text-sm font-bold text-black transition-all duration-300">
                            {activePieIndex !== null ? attendancePieData[activePieIndex].name : "Present"}
                        </p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={attendancePieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActivePieIndex(index)}
                                onMouseLeave={() => setActivePieIndex(null)}
                            >
                                {attendancePieData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.color} 
                                        stroke="none"
                                        style={{ outline: 'none', transition: 'opacity 0.3s' }}
                                        opacity={activePieIndex !== null && activePieIndex !== index ? 0.6 : 1}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {attendancePieData.map((item, index) => (
                        <div key={item.name} className={`flex items-center gap-2 transition-opacity duration-300 ${activePieIndex !== null && activePieIndex !== index ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm font-medium text-black">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-white rounded-xl border border-[#D8DDE1] shadow-sm h-[400px] flex flex-col p-6">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-xl font-bold text-black">Leave Summary</h3>
            </div>

            <div className="border-b border-[#D8DDE1] mb-6"></div>

                <div className="border border-[#D8DDE1] rounded-lg overflow-hidden flex flex-col justify-between">
                    <div className="p-4">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full bg-[#B93B53]"></div>
                            <span className="font-medium text-black">Leave Taken</span>
                         </div>
                         <span className="text-xl font-medium text-black">{stats.leaveCount} Days</span>
                    </div>
                    <div 
                         onClick={() => handleNavigate('/karyawan/time')}
                         className="bg-[#B93B53] px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-[#a6344a] transition-colors"
                    >
                        <span className="text-xs font-medium text-white">Request Leave</span>
                        <Icon icon="mdi:arrow-right" className="text-white text-sm" />
                    </div>
                </div>
            </div>
        </div>

      {/* --- Work Hours Chart --- */}
      <div className="bg-white rounded-xl border border-[#D8DDE1] shadow-sm p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-medium text-[#595959]">Your Work Hours</h3>
                <p className="text-2xl font-bold text-black mt-1">{stats.totalHours.toFixed(1)}h</p>
            </div>
        </div>

        <div className="border-b border-[#D8DDE1] mb-6"></div>

        {/* Content Area */}
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={workHoursData} 
                    barSize={40} 
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#9CA3AF" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#000' }} 
                        dy={10}
                        tickFormatter={formatXAxis} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#000' }} 
                        ticks={[0, 4, 8, 12]} 
                        domain={[0, 12]} 
                    />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        labelFormatter={formatTooltip}
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#fff'
                        }}
                        labelStyle={{ 
                            color: '#000', 
                            fontWeight: 'bold', 
                            marginBottom: '0.25rem' 
                        }}
                        itemStyle={{ 
                            color: '#1D395E', 
                            fontSize: '14px', 
                            fontWeight: '500' 
                        }}
                    />
                    <Bar 
                        dataKey="hours" 
                        radius={[4, 4, 0, 0]} 
                    >
                        {workHoursData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={activeBarIndex === index ? '#1D395E' : '#7CA5BF'}
                                onMouseEnter={() => setActiveBarIndex(index)}
                                onMouseLeave={() => setActiveBarIndex(null)}
                                cursor="pointer"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}