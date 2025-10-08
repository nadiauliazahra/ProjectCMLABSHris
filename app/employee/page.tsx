"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Faiza", gender: "Laki-laki", phone: "085124789021", city: "Jakarta", job: "Project Manager", grade: "Lead", status: true, avatar: "/avatar1.png" },
    { id: 2, name: "Nadia", gender: "Perempuan", phone: "086124789897", city: "Bogor", job: "Front End", grade: "Staff", status: false, avatar: "/avatar2.png" },
    { id: 3, name: "Naila", gender: "Perempuan", phone: "087124789099", city: "Jakarta", job: "Back End", grade: "Staff", status: false, avatar: "/avatar3.png" },
    { id: 4, name: "Fawaz", gender: "Laki-laki", phone: "085114789098", city: "Jakarta", job: "HRD", grade: "Manager", status: true, avatar: "/avatar4.png" },
    { id: 5, name: "Riyanti", gender: "Perempuan", phone: "085124789123", city: "Bogor", job: "Project Manager", grade: "Lead", status: true, avatar: "/avatar5.png" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterGender, setFilterGender] = useState("All");

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    gender: "Laki-laki",
    phone: "",
    city: "",
    job: "",
    grade: "",
    status: true,
    avatar: "",
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchesId = filterId === "" || emp.id.toString().includes(filterId);
    const matchesName = filterName === "" || emp.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesGender = filterGender === "All" || emp.gender === filterGender;
    return matchesId && matchesName && matchesGender;
  });

  const handleAdd = () => {
    if (!newEmployee.name || !newEmployee.job) return;
    const newId = employees.length ? employees[employees.length - 1].id + 1 : 1;
    setEmployees([...employees, { id: newId, ...newEmployee, avatar: avatar || "/default-avatar.png" }]);
    setShowModal(false);
    setNewEmployee({
      name: "",
      gender: "Laki-laki",
      phone: "",
      city: "",
      job: "",
      grade: "",
      status: true,
      avatar: "",
    });
    setAvatar(null);
  };

  const handleDelete = (id: number) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  const handleDuplicate = (emp: any) => {
    const newId = employees.length ? employees[employees.length - 1].id + 1 : 1;
    setEmployees([...employees, { ...emp, id: newId, name: emp.name + " (Baru)" }]);
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="flex-4">
      {/* Header Statistik */}
      <div className="grid grid-cols-4 gap-4 my-4">
        <div className="bg-white shadow rounded p-4">
          <p className="text-black">Periode</p>
          <p className="text-xl text-black font-bold">Oktober 2025</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-black">Total Employee</p>
          <p className="text-xl text-black font-bold">{employees.length}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-black">Total New Hire</p>
          <p className="text-xl text-black font-bold">3</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-black">Full Time Employee</p>
          <p className="text-xl text-black font-bold">{employees.filter((e) => e.status).length}</p>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex gap-2 mb-4 text-gray-700 items-center relative">
      {/* 🧾 Judul */}
      <h1 className="font-bold text-black text-3xl flex-1">
        All Employees Information
      </h1>
       {/* 🔍 Input Search dengan Icon */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-3 flex items-center">
        </span>
        <input
          type="text"
          placeholder="Search Employee"
          className="w-full rounded-lg border border-gray-400 bg-gray-10 px-4 py-2 pl-10 text-base text-black placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <Icon
          icon="mdi:magnify"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-xl"
        />
      </div>

        {/* Tombol Filter */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="border border-gray-800 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-black"
        >
          <Icon icon="mage:filter-fill" className="w-5 h-5" />
          Filter
        </button>

        {/* Dropdown Filter */}
        {showFilter && (
          <div className="absolute right-32 top-14 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 text-black">
            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold mb-1">Nomor</label>
                <input
                  type="text"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  placeholder="Masukkan No..."
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama</label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Masukkan Nama..."
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jenis Kelamin</label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="All">Semua</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => {
                    setFilterId("");
                    setFilterName("");
                    setFilterGender("All");
                    setShowFilter(false);
                  }}
                  className="text-gray-600 hover:underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border rounded text-black">
          <Icon icon="lucide:download" className="w-5 h-5" />
          Import
        </button>

        <button className="flex items-center gap-2 px-4 py-2 border rounded text-black">
          <Icon icon="lucide:upload" className="w-5 h-5" />
          Export
        </button>
      </div>

        {/* Tombol Tambah Data */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1E3A5F] text-white px-4 py-2 rounded hover:bg-[#254b7b] flex items-center gap-1"
        >
          <Icon icon="mdi:plus-circle-outline" className="w-5 h-5" />
          Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left text-black">
              <th className="p-2">No</th>
              <th className="p-2">Avatar</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Jenis Kelamin</th>
              <th className="p-2">Nomor Telepon</th>
              <th className="p-2">Cabang</th>
              <th className="p-2">Jabatan</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50 text-black">
                <td className="p-2">{emp.id}</td>
                <td className="p-2">
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border" />
                </td>
                <td className="p-2">{emp.name}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm font-bold ${
                      emp.gender === "Laki-laki" ? "bg-gray-500" : "bg-gray-300"
                    }`}
                  >
                    {emp.gender}
                  </span>
                </td>
                <td className="p-2">{emp.phone}</td>
                <td className="p-2">{emp.city}</td>
                <td className="p-2">{emp.job}</td>
                <td className="p-2">{emp.grade}</td>
                <td className="p-2">
                  <div className={`w-10 h-5 rounded-full ${emp.status ? "bg-green-500" : "bg-gray-300"} relative`}>
                    <span
                      className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition ${
                        emp.status ? "translate-x-5" : ""
                      }`}
                    ></span>
                  </div>
                </td>
                <td className="p-2 text-center">
  <div className="flex justify-center gap-3">
    {/* Duplicate */}
    <button
      onClick={() => handleDuplicate(emp)}
      className="bg-blue-500 border border-blue-200 rounded-l p-2 hover:bg-blue-100  transition duration-200"
      title="Duplicate"
    >
      <Icon icon="ant-design:file-add-filled" className="w-5 h-5 text-white" />
    </button>

    {/* Edit */}
    <button
      className="bg-yellow-500 border border-yellow-200 rounded-l p-2 hover:bg-yellow-800 transition duration-200"
      title="Edit"
    >
      <Icon icon="line-md:edit" className="w-5 h-5 text-white" />
    </button>

    {/* Delete */}
    <button
      onClick={() => handleDelete(emp.id)}
      className="bg-red-700 border border-red-100 rounded-l p-2 hover:bg-red-100 transition duration-200"
      title="Delete"
    >
      <Icon icon="material-symbols:delete" className="w-5 h-5 text-white" />
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

  {/* 🟢 Modal Tambah Data */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[85%] max-w-5xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Employee</h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 rounded-md border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
          {avatar ? (
            <img src={avatar} alt="avatar" className="object-cover w-full h-full" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        <label
          htmlFor="avatar"
          className="mt-3 px-4 py-2 bg-gray-100 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 text-black"
        >
          Upload Avatar
        </label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Form */}
      <div className="border border-black rounded-xl p-6">
      <form className="grid grid-cols-2 gap-x-10 gap-y-5 text-black">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter the first name" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mobile Number</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter mobile number" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select className="w-full border border-gray-400 rounded-md p-2">
              <option>- Choose Gender -</option>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Tempat Lahir</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Masukan tempat lahir" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Jabatan</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter your job title" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Tipe Kontrak</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1"><input type="radio" name="contract" /> Tetap</label>
              <label className="flex items-center gap-1"><input type="radio" name="contract" /> Kontrak</label>
              <label className="flex items-center gap-1"><input type="radio" name="contract" /> Lepas</label>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Bank</label>
            <select className="w-full border border-gray-400 rounded-md p-2">
              <option>- Pilih Bank -</option>
              <option>BCA (Bank Central Asia)</option>
              <option>BNI (Bank Negara Indonesia)</option>
              <option>Mandiri (Bank Republik Indonesia) </option>
              <option>Mandiri</option>
            </select>
          </div>
           <div>
            <label className="block mb-1 font-medium">Atas Nama Rekening</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Masukan A/N Rekening" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter the last name" />
          </div>
          <div>
            <label className="block mb-1 font-medium">NIK</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter the NIK" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Pendidikan Terakhir</label>
            <select className="w-full border border-gray-400 rounded-md p-2">
              <option>- Pilih Pendidikan Terakhir -</option>
              <option>SMA/SMK</option>
              <option>D3</option>
              <option>S1</option>
              <option>S2</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Tanggal Lahir</label>
            <input type="date" className="w-full border border-gray-400 rounded-md p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Cabang</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Enter the cabang" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Grade</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Masukan Grade Anda" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nomor Rekening</label>
            <input type="text" className="w-full border border-gray-400 rounded-md p-2" placeholder="Masukan nomor rekening" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Tipe SP</label>
            <select className="w-full border border-gray-400 rounded-md p-2">
              <option>- Pilih SP -</option>
              <option>SP1</option>
              <option>SP2</option>
              <option>SP3</option>
            </select>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8 border-t pt-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 border border-gray-700 rounded-lg hover:bg-gray-100 font-medium text-black"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save
        </button>
      </div>
    </div>
  </div>
  </div>
)}

    </div>
  );
}
