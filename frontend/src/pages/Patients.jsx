import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = { name: "", age: "", gender: "Male", phone: "", email: "", address: "", medicalHistory: "", bloodGroup: "" };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => {
    api
      .get("/patients", { params: { search, gender, page, limit: 8 } })
      .then((res) => {
        setPatients(res.data.patients);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => showToast("Failed to load patients", "error"));
  };

  useEffect(load, [page, search, gender]);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (p) => { setForm(p); setEditId(p._id); setShowModal(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/patients/${editId}`, form);
      else await api.post("/patients", form);
      setShowModal(false);
      load();
      showToast(editId ? "Patient updated" : "Patient added");
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    await api.delete(`/patients/${id}`);
    load();
    showToast("Patient deleted", "info");
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/patients/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patients.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("CSV exported");
    } catch {
      showToast("Export failed", "error");
    }
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Patients</h1>
          <p className="text-slate-500 dark:text-slate-400">{total} total patient{total !== 1 && "s"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium">
            ⬇ Export CSV
          </button>
          <button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Patient
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="flex-1 min-w-[220px] border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 text-sm"
        />
        <select value={gender} onChange={(e) => { setPage(1); setGender(e.target.value); }} className="border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 text-sm">
          <option value="">All Genders</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Age</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Blood Group</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3 font-medium">
                  <Link to={`/patients/${p._id}`} className="text-cyan-700 dark:text-cyan-400 hover:underline">{p.name}</Link>
                </td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.gender}</td>
                <td className="p-3">{p.phone}</td>
                <td className="p-3">{p.bloodGroup}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => openEdit(p)} className="text-cyan-600 hover:underline">Edit</button>
                  {isAdmin && <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400">No patients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">Prev</button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">Next</button>
        </div>
      )}

      {showModal && (
        <Modal title={editId ? "Edit Patient" : "Add Patient"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="name" placeholder="Full name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <div className="grid grid-cols-2 gap-3">
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} className="border rounded-lg p-2.5" />
              <select name="gender" value={form.gender} onChange={handleChange} className="border rounded-lg p-2.5">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <input name="phone" placeholder="Phone number" required value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="bloodGroup" placeholder="Blood group" value={form.bloodGroup} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <textarea name="medicalHistory" placeholder="Medical history / allergies" value={form.medicalHistory} onChange={handleChange} className="w-full border rounded-lg p-2.5" rows="3" />
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
              {editId ? "Update Patient" : "Add Patient"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
