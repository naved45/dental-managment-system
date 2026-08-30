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

const empty = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  experienceYears: "",
};

export default function Dentists() {
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  // =========================
  // LOAD DENTISTS
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/dentists");

      console.log("Dentists API response:", res.data);

      setDentists(res.data);
    } catch (err) {
      console.error("Failed to load dentists:", err);

      showToast(
        err.response?.data?.message || "Failed to load dentists",
        "error"
      );
    }
  };

  // IMPORTANT:
  // Do not use: useEffect(load, [])
  useEffect(() => {
    load();
  }, []);

  // =========================
  // ADD DENTIST
  // =========================
  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setShowModal(true);
  };

  // =========================
  // EDIT DENTIST
  // =========================
  const openEdit = (d) => {
    setForm({
      name: d.name || "",
      specialization: d.specialization || "",
      phone: d.phone || "",
      email: d.email || "",
      experienceYears: d.experienceYears ?? "",
    });

    setEditId(d._id);
    setShowModal(true);
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE DENTIST
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dentistData = {
        name: form.name.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        experienceYears:
          form.experienceYears === ""
            ? 0
            : Number(form.experienceYears),
      };

      if (editId) {
        await api.put(`/ dentists / ${editId} `, dentistData);
        showToast("Dentist updated");
      } else {
        await api.post("/dentists", dentistData);
        showToast("Dentist added");
      }

      setShowModal(false);
      setForm(empty);
      setEditId(null);

      await load();
    } catch (err) {
      console.error("Save dentist error:", err);

      showToast(
        err.response?.data?.message || "Save failed",
        "error"
      );
    }
  };

  // =========================
  // DELETE DENTIST
  // =========================
  const handleDelete = async (id) => {
    if (!confirm("Delete this dentist?")) {
      return;
    }

    try {
      await api.delete(`/ dentists / ${id} `);

      await load();

      showToast("Dentist deleted", "info");
    } catch (err) {
      console.error("Delete dentist error:", err);

      showToast(
        err.response?.data?.message || "Failed to delete dentist",
        "error"
      );
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <Layout>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dentists.map((d) => (
          <div
            key={d._id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5"
          >
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {d.name}
            </h3>

            <p className="text-sm text-cyan-600 dark:text-cyan-400">
              {d.specialization}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              📞 {d.phone}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              ✉️ {d.email}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              🎓 {d.experienceYears} yrs experience
            </p>

            <div className="mt-3 space-x-3">
              <button
                onClick={() => openEdit(d)}
                className="text-cyan-600 text-sm hover:underline"
              >
                Edit
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(d._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {dentists.length === 0 && (
          <p className="text-slate-400">
            No dentists added yet
          </p>
        )}
      </div>

      {showModal && (
        <Modal
          title={editId ? "Edit Dentist" : "Add Dentist"}
          onClose={() => {
            setShowModal(false);
            setForm(empty);
            setEditId(null);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <input
              name="name"
              placeholder="Full name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <input
              name="specialization"
              placeholder="Specialization (e.g. Orthodontist)"
              value={form.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <input
              name="experienceYears"
              type="number"
              min="0"
              placeholder="Years of experience"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

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
