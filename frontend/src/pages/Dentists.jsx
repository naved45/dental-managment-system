/*import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = { name: "", specialization: "", phone: "", email: "", experienceYears: "" };

export default function Dentists() {
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => api.get("/dentists").then((res) => setDentists(res.data));
  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (d) => { setForm(d); setEditId(d._id); setShowModal(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/dentists/${editId}`, form);
      else await api.post("/dentists", form);
      setShowModal(false);
      load();
      showToast(editId ? "Dentist updated" : "Dentist added");
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this dentist?")) return;
    await api.delete(`/dentists/${id}`);
    load();
    showToast("Dentist deleted", "info");
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dentists</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage clinic dentists / staff</p>
        </div>
        <button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Dentist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dentists.map((d) => (
          <div key={d._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white">{d.name}</h3>
            <p className="text-sm text-cyan-600 dark:text-cyan-400">{d.specialization}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">📞 {d.phone}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">✉️ {d.email}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">🎓 {d.experienceYears} yrs experience</p>
            <div className="mt-3 space-x-3">
              <button onClick={() => openEdit(d)} className="text-cyan-600 text-sm hover:underline">Edit</button>
              {isAdmin && <button onClick={() => handleDelete(d._id)} className="text-red-500 text-sm hover:underline">Delete</button>}
            </div>
          </div>
        ))}
        {dentists.length === 0 && <p className="text-slate-400">No dentists added yet</p>}
      </div>

      {showModal && (
        <Modal title={editId ? "Edit Dentist" : "Add Dentist"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="name" placeholder="Full name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="specialization" placeholder="Specialization (e.g. Orthodontist)" value={form.specialization} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="experienceYears" type="number" placeholder="Years of experience" value={form.experienceYears} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
              {editId ? "Update Dentist" : "Add Dentist"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
*/







import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  experienceYears: "",
};

export default function Dentists() {
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  // Load dentists
  const loadDentists = async () => {
    try {
      setLoading(true);

      const res = await api.get("/dentists");

      setDentists(res.data);
    } catch (err) {
      console.error("Failed to load dentists:", err);

      showToast(
        err.response?.data?.message || "Failed to load dentists",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDentists();
  }, []);

  // Open Add Dentist modal
  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Dentist modal
  const openEdit = (dentist) => {
    setForm({
      name: dentist.name || "",
      specialization: dentist.specialization || "",
      phone: dentist.phone || "",
      email: dentist.email || "",
      experienceYears: dentist.experienceYears || "",
    });

    setEditId(dentist._id);
    setShowModal(true);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add / Update Dentist
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/dentists/${editId}`, form);

        showToast("Dentist updated successfully", "success");
      } else {
        await api.post("/dentists", form);

        showToast("Dentist added successfully", "success");
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);

      await loadDentists();
    } catch (err) {
      console.error("Save dentist error:", err);

      showToast(
        err.response?.data?.message || "Failed to save dentist",
        "error"
      );
    }
  };

  // Delete Dentist
  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this dentist?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/dentists/${id}`);

      showToast("Dentist deleted successfully", "info");

      await loadDentists();
    } catch (err) {
      console.error("Delete dentist error:", err);

      showToast(
        err.response?.data?.message || "Failed to delete dentist",
        "error"
      );
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Dentists
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            Manage clinic dentists / staff
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Dentist
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-slate-500">
          Loading dentists...
        </div>
      )}

      {/* Dentist Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dentists.map((dentist) => (
            <div
              key={dentist._id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5"
            >
              {/* Name */}
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                {dentist.name}
              </h3>

              {/* Specialization */}
              <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">
                {dentist.specialization || "General Dentist"}
              </p>

              {/* Phone */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                📞 {dentist.phone || "Not provided"}
              </p>

              {/* Email */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-all">
                ✉️ {dentist.email || "Not provided"}
              </p>

              {/* Experience */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                🎓 {dentist.experienceYears || 0} yrs experience
              </p>

              {/* Actions */}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => openEdit(dentist)}
                  className="text-cyan-600 text-sm hover:underline"
                >
                  Edit
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(dentist._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {dentists.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-400">
                No dentists added yet.
              </p>

              <button
                onClick={openAdd}
                className="mt-3 text-cyan-600 hover:underline"
              >
                Add your first dentist
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editId ? "Edit Dentist" : "Add Dentist"}
          onClose={() => {
            setShowModal(false);
            setForm(emptyForm);
            setEditId(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <input
              name="name"
              placeholder="Full name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Specialization */}
            <input
              name="specialization"
              placeholder="Specialization (e.g. Orthodontist)"
              value={form.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Phone */}
            <input
              name="phone"
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Email */}
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Experience */}
            <input
              name="experienceYears"
              type="number"
              min="0"
              placeholder="Years of experience"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium"
            >
              {editId ? "Update Dentist" : "Add Dentist"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}