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

export default function Dashboard() {
  // Data dummy
  const employeeData = [
    { name: "New", value: 18 },
    { name: "Active", value: 8 },
    { name: "Resign", value: 25 },
  ];

  const statusData = [
    { name: "Tetap Permanen", value: 23 },
    { name: "Tetap Percobaan", value: 46 },
    { name: "PKWT (Kontrak)", value: 64 },
    { name: "Magang", value: 75 },
  ];

  const attendanceData = [
    { name: "Ontime", value: 142 },
    { name: "Late", value: 34 },
    { name: "Absent", value: 12 },
  ];

  const COLORS = ["#1E3A8A", "#6B7280", "#FACC15"];

  return (
    <div className="p-5 grid grid-cols-4 gap-4 bg-gray-100 min-h-screen">
      {/* Cards */}
      <Card
        title="Total Employee"
        value={20}
        color="bg-blue-500 text-white"
        update="September 28, 2025"
      />
      <Card
        title="New Employees"
        value={12}
        color="bg-yellow-500 text-white"
        update="September 28, 2025"
      />
      <Card
        title="Active Employees"
        value={15}
        color="bg-green-600 text-white"
        update="September 28, 2025"
      />
      <Card
        title="Resigned Employees"
        value={5}
        color="bg-red-600 text-white"
        update="September 28, 2025"
      />

      {/* Chart 1 - Current Number of Employees */}
      <div className="col-span-2 bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">
            Employee Statistics - Current Number of Employees
          </h2>
          <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
            <option>Select Month</option>
            <option>September</option>
            <option>October</option>
          </select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 - Employee Status */}
      <div className="col-span-2 bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">
            Employee Statistics - Employee Status
          </h2>
          <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
            <option>Select Month</option>
            <option>September</option>
            <option>October</option>
          </select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3 - Attendance Pie */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold text-gray-800 mb-3">Attendance Statistics</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="col-span-3 bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Attendance</h2>
          <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
            <option>Select Month</option>
            <option>September</option>
            <option>October</option>
          </select>
        </div>
        <table className="w-full text-sm border-t border-gray-200">
          <thead className="text-gray-500">
            <tr>
              <th className="py-2 text-left">No</th>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Status Kehadiran</th>
              <th className="py-2 text-left">Check In</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-t">
              <td>1.</td>
              <td>M Faiza Firdaus</td>
              <td><span className="text-blue-600 font-medium">Ontime</span></td>
              <td>08:00</td>
            </tr>
            <tr className="border-t">
              <td>2.</td>
              <td>Naila Sahda A.</td>
              <td><span className="text-gray-600 font-medium">Late</span></td>
              <td>08:15</td>
            </tr>
            <tr className="border-t">
              <td>3.</td>
              <td>Nadia Aulia Z.</td>
              <td><span className="text-yellow-500 font-medium">Absent</span></td>
              <td>10:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
