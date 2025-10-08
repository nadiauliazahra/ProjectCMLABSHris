import Card from "@/components/card";

export default function Dashboard() {
  return (
    <div className="p-3 grid grid-cols-4 gap-4">
      {/* Cards */}
      <Card
        title="Total Employee"
        value={20}
        color="bg-blue-400 text-blue-800"
        update="September 28, 2025"
      />
      <Card
        title="New Employees"
        value={12}
        color="bg-green-800 text-green-800"
        update="September 28, 2025"
      />
      <Card
        title="Active Employees"
        value={15}
        color="bg-yellow-500 text-white"
        update="September 28, 2025"
      />
      <Card
        title="Resigned Employees"
        value={5}
        color="bg-red-700 text-red-800"
        update="September 28, 2025"
      />

      {/* Charts + Tables */}
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Current Number of Employees</h2>
        {/* Disini nanti pakai chart library (recharts / chart.js) */}
        <div className="h-48 flex items-center justify-center text-gray-400">
          Bar Chart Placeholder
        </div>
      </div>
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Employee Status</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Horizontal Chart Placeholder
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Attendance</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Pie Chart Placeholder
        </div>
      </div>
      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Attendance</h2>
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-left text-gray-500">
              <th>No</th>
              <th>Name</th>
              <th>Status Kehadiran</th>
              <th>Check In</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1.</td>
              <td>M Faiza Firdaus</td>
              <td><span className="text-blue-600">Ontime</span></td>
              <td>08:00</td>
            </tr>
            <tr>
              <td>2.</td>
              <td>Naila Sahda A.</td>
              <td><span className="text-gray-600">Late</span></td>
              <td>08:15</td>
            </tr>
            <tr>
              <td>3.</td>
              <td>Nadia Aulia Z.</td>
              <td><span className="text-yellow-600">Absent</span></td>
              <td>10:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
