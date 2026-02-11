"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Card from "@/components/card"; 
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_URL } from "../../utils/config";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // --- STATE DATA ---
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployees: 0,
    activeEmployees: 0,
    resignedEmployees: 0,
  });

  const [employeeStatusChart, setEmployeeStatusChart] = useState<any[]>([]);
  const [employeeNewChart, setEmployeeNewChart] = useState<any[]>([]);
  
  // Chart Pie Attendance (Clock In, Clock Out, Leave, Absent)
  const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
  
  // Table Data
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  // Warna Chart: Biru (Clock In), Hijau (Clock Out), Kuning (Leave), Merah (Absent)
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Ambil Data Karyawan
      const empRes = await axios.get(`${API_URL}/employees?limit=1000`, { headers });
      const employees = empRes.data.data;

      // 2. Ambil Data Absensi (Hari ini)
      const attRes = await axios.get(`${API_URL}/attendance?limit=1000`, { headers });
      const allAttendances = attRes.data.data; 

      // --- KALKULASI STATISTIK KARYAWAN (Sama seperti sebelumnya) ---
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const total = employees.length;
      const resigned = employees.filter((e: any) => e.employment_status === 'resign').length;
      const active = total - resigned;
      
      const newEmp = employees.filter((e: any) => {
         const joinDate = new Date(e.created_at);
         return joinDate.getFullYear() === currentYear && joinDate.getMonth() === currentMonth;
      }).length;

      setStats({
        totalEmployees: total,
        newEmployees: newEmp,
        activeEmployees: active,
        resignedEmployees: resigned
      });

      // Chart Status Karyawan
      const statusCounts: Record<string, number> = {};
      employees.forEach((e: any) => {
         let label = e.employment_status;
         if(label === 'pkwt') label = 'PKWT';
         if(label === 'tetap_permanen') label = 'Tetap';
         if(label === 'tetap_percobaan') label = 'Percobaan';
         if(label === 'magang') label = 'Magang';
         if(label === 'resign') label = 'Resign';
         statusCounts[label] = (statusCounts[label] || 0) + 1;
      });
      setEmployeeStatusChart(Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] })));
      
      setEmployeeNewChart([
        { name: "New", value: newEmp },
        { name: "Active", value: active },
        { name: "Resign", value: resigned },
      ]);


      // --- KALKULASI ABSENSI BARU (Clock In / Out / Leave / Absent) ---
      const todayStr = new Date().toISOString().slice(0, 10);
      
      // Filter hanya data hari ini
      const todayAtt = allAttendances.filter((a: any) => a.date === todayStr);

      // Filter hanya karyawan AKTIF (yang resign tidak perlu dihitung absennya)
      const activeEmployeesList = employees.filter((e:any) => e.employment_status !== 'resign');

      let countClockIn = 0;
      let countClockOut = 0;
      let countLeave = 0;
      let countAbsent = 0;

      const recentData: any[] = [];

      // Loop semua karyawan aktif untuk cek status masing-masing
      activeEmployeesList.forEach((emp: any) => {
          // Cari apakah karyawan ini punya record absensi hari ini
          const record = todayAtt.find((a: any) => a.employee_id === emp.id);

          let status = "";
          let statusColor = "";
          let timeInfo = "-";

          if (!record) {
              // Tidak ada record = ABSENT
              status = "Absent";
              statusColor = "text-red-500 font-bold";
              countAbsent++;
          } else {
              // Ada record, cek tipenya
              if (record.type !== 'present') {
                  // Cuti / Sakit = LEAVE
                  status = "Leave"; // Bisa didetailkan: record.type (Sick/Annual)
                  statusColor = "text-yellow-500 font-bold";
                  countLeave++;
                  timeInfo = "On Leave";
              } else {
                  // Hadir, cek apakah sudah pulang
                  const checkIn = record.check_in ? new Date(record.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-";
                  const checkOut = record.check_out ? new Date(record.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null;

                  if (checkOut) {
                      // Ada jam pulang = CLOCK OUT
                      status = "Clock Out";
                      statusColor = "text-green-600 font-bold";
                      countClockOut++;
                      timeInfo = `${checkIn} - ${checkOut}`;
                  } else {
                      // Belum ada jam pulang = CLOCK IN
                      status = "Clock In";
                      statusColor = "text-blue-600 font-bold";
                      countClockIn++;
                      timeInfo = `${checkIn} - ...`;
                  }
              }
          }

          // Masukkan ke table data (Top 5 saja nanti di slice)
          // Kita prioritaskan yang sudah absen agar muncul di atas, atau sesuai kebutuhan
          recentData.push({
              id: emp.id,
              name: `${emp.first_name} ${emp.last_name}`,
              status: status,
              color: statusColor,
              time: timeInfo,
              hasRecord: !!record // helper untuk sorting
          });
      });

      // Update State Chart
      setAttendanceChart([
          { name: "Clock In", value: countClockIn },   // Biru
          { name: "Clock Out", value: countClockOut }, // Hijau
          { name: "Leave", value: countLeave },        // Kuning
          { name: "Absent", value: countAbsent },      // Merah
      ]);

      // Update State Table (Sort: Yang ada record duluan, baru yang absent)
      const sortedRecent = recentData.sort((a, b) => Number(b.hasRecord) - Number(a.hasRecord)).slice(0, 5);
      setRecentAttendance(sortedRecent);

      setLoading(false);

    } catch (error) {
      console.error("Fetch Dashboard Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-5 grid grid-cols-4 gap-4 bg-gray-100 min-h-screen font-sans">
      
      {/* Cards Stat */}
      <Card title="Total Employee" value={stats.totalEmployees} color="bg-blue-600 text-white" update={todayDate} />
      <Card title="New Employees" value={stats.newEmployees} color="bg-emerald-600 text-white" update={todayDate} />
      <Card title="Active Employees" value={stats.activeEmployees} color="bg-amber-500 text-white" update={todayDate} />
      <Card title="Resigned Employees" value={stats.resignedEmployees} color="bg-rose-600 text-white" update={todayDate} />

      {/* Chart 1 */}
      <div className="col-span-2 bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Employee Overview</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeNewChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {employeeNewChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : index === 1 ? "#F59E0B" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 */}
      <div className="col-span-2 bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Status Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeStatusChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} style={{fontSize: '12px'}} />
              <Tooltip />
              <Bar dataKey="value" fill="#1E3A5F" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: PIE CHART BARU */}
      <div className="bg-white p-5 rounded-xl shadow col-span-1">
        <h2 className="font-semibold text-gray-800 mb-3">Today's Presence</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceChart}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label
              >
                {attendanceChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Baru */}
      <div className="col-span-3 bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Real-time Attendance Monitor</h2>
        </div>
        <table className="w-full text-sm border-t border-gray-200">
          <thead className="text-gray-500 bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left">No</th>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Time (In - Out)</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {recentAttendance.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}.</td>
                    <td className="font-medium">{item.name}</td>
                    <td><span className={`${item.color} text-xs uppercase tracking-wide`}>{item.status}</span></td>
                    <td className="text-gray-500 font-mono text-xs">{item.time}</td>
                </tr>
            ))}
            {recentAttendance.length === 0 && (
                 <tr><td colSpan={4} className="text-center py-4">No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}