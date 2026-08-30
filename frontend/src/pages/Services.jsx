/*import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = { name: "", category: "General", price: "", durationMinutes: 30, description: "" };

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => api.get("/services").then((res) => setServices(res.data));
  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (s) => { setForm(s); setEditId(s._id); setShowModal(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/services/${editId}`, form);
      else await api.post("/services", form);
      setShowModal(false);
      load();
      showToast(editId ? "Service updated" : "Service added");
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    await api.delete(`/services/${id}`);
    load();
    showToast("Service deleted", "info");
  };

  const grouped = services.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Treatments & Services</h1>
          <p className="text-slate-500 dark:text-slate-400">Price list used when creating invoices</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Service
          </button>
        )}
      </div>

      {Object.keys(grouped).length === 0 && <p className="text-slate-400">No services added yet.</p>}

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {list.map((s) => (
              <div key={s._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{s.name}</h3>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">₹{s.price}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{s.durationMinutes} min</p>
                {s.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{s.description}</p>}
                {isAdmin && (
                  <div className="mt-3 space-x-3">
                    <button onClick={() => openEdit(s)} className="text-cyan-600 text-sm hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 text-sm hover:underline">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <Modal title={editId ? "Edit Service" : "Add Service"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="name" placeholder="Service name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <input name="category" placeholder="Category (e.g. Preventive, Surgery)" value={form.category} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <div className="grid grid-cols-2 gap-3">
              <input name="price" type="number" placeholder="Price (₹)" required value={form.price} onChange={handleChange} className="border rounded-lg p-2.5" />
              <input name="durationMinutes" type="number" placeholder="Duration (min)" value={form.durationMinutes} onChange={handleChange} className="border rounded-lg p-2.5" />
            </div>
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded-lg p-2.5" rows="2" />
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
              {editId ? "Update Service" : "Add Service"}
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
  category: "General",
  price: "",
  durationMinutes: 30,
  description: "",
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  // =========================
  // LOAD SERVICES
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services:", err);

      showToast(
        err.response?.data?.message || "Failed to load services",
        "error"
      );
    }
  };

  // IMPORTANT:
  // Do NOT use: useEffect(load, [])
  useEffect(() => {
    load();
  }, []);

  // =========================
  // ADD SERVICE
  // =========================
  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setShowModal(true);
  };

  // =========================
  // EDIT SERVICE
  // =========================
  const openEdit = (s) => {
    setForm({
      name: s.name || "",
      category: s.category || "General",
      price: s.price ?? "",
      durationMinutes: s.durationMinutes ?? 30,
      description: s.description || "",
    });

    setEditId(s._id);
    setShowModal(true);
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =========================
  // SAVE SERVICE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const serviceData = {
        name: form.name.trim(),
        category: form.category.trim() || "General",
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        description: form.description.trim(),
      };

      if (editId) {
        await api.put(`/ services / ${editId} `, serviceData);
        showToast("Service updated");
      } else {
        await api.post("/services", serviceData);
        showToast("Service added");
      }

      setShowModal(false);
      setForm(empty);
      setEditId(null);

      await load();
    } catch (err) {
      console.error("Save service error:", err);

      showToast(
        err.response?.data?.message || "Save failed",
        "error"
      );
    }
  };

  // =========================
  // DELETE SERVICE
  // =========================
  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) {
      return;
    }

    try {
      await api.delete(`/ services / ${id} `);

      await load();

      showToast("Service deleted", "info");
    } catch (err) {
      console.error("Delete service error:", err);

      showToast(
        err.response?.data?.message || "Failed to delete service",
        "error"
      );
    }
  };

  // =========================
  // GROUP SERVICES
  // =========================
  const grouped = services.reduce((acc, s) => {
    const category = s.category || "General";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(s);

    return acc;
  }, {});

  // =========================
  // UI
  // =========================
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Treatments & Services
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            Price list used when creating invoices
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Service
          </button>
        )}
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-slate-400">
          No services added yet.
        </p>
      )}

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {list.map((s) => (
              <div
                key={s._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {s.name}
                  </h3>

                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                    ₹{s.price}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {s.durationMinutes} min
                </p>

                {s.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {s.description}
                  </p>
                )}

                {isAdmin && (
                  <div className="mt-3 space-x-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-cyan-600 text-sm hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <Modal
          title={editId ? "Edit Service" : "Add Service"}
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
              placeholder="Service name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <input
              name="category"
              placeholder="Category (e.g. Preventive, Surgery)"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="price"
                type="number"
                min="0"
                placeholder="Price (₹)"
                required
                value={form.price}
                onChange={handleChange}
                className="border rounded-lg p-2.5"
              />

              <input
                name="durationMinutes"
                type="number"
                min="1"
                placeholder="Duration (min)"
                required
                value={form.durationMinutes}
                onChange={handleChange}
                className="border rounded-lg p-2.5"
              />
            </div>

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
              rows="2"
            />

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium"
            >
              {editId ? "Update Service" : "Add Service"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

