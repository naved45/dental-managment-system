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

const emptyForm = {
  name: "",
  category: "General",
  price: "",
  durationMinutes: 30,
  description: "",
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  // Load services
  const loadServices = async () => {
    try {
      setLoading(true);

      const res = await api.get("/services");

      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services:", err);

      showToast(
        err.response?.data?.message || "Failed to load services",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Open Add Service modal
  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Service modal
  const openEdit = (service) => {
    setForm({
      name: service.name || "",
      category: service.category || "General",
      price: service.price || "",
      durationMinutes: service.durationMinutes || 30,
      description: service.description || "",
    });

    setEditId(service._id);
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add / Update Service
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/services/${editId}`, form);

        showToast("Service updated successfully", "success");
      } else {
        await api.post("/services", form);

        showToast("Service added successfully", "success");
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);

      await loadServices();
    } catch (err) {
      console.error("Save service error:", err);

      showToast(
        err.response?.data?.message || "Failed to save service",
        "error"
      );
    }
  };

  // Delete Service
  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/services/${id}`);

      showToast("Service deleted successfully", "info");

      await loadServices();
    } catch (err) {
      console.error("Delete service error:", err);

      showToast(
        err.response?.data?.message || "Failed to delete service",
        "error"
      );
    }
  };

  // Group services by category
  const grouped = services.reduce((acc, service) => {
    const category = service.category || "General";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(service);

    return acc;
  }, {});

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Treatments & Services
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            Price list used when creating invoices
          </p>
        </div>

        {/* Admin only */}
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Service
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-slate-500">
          Loading services...
        </div>
      )}

      {/* Services */}
      {!loading && (
        <>
          {/* Empty state */}
          {services.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400">
                No services added yet.
              </p>

              {isAdmin && (
                <button
                  onClick={openAdd}
                  className="mt-3 text-cyan-600 hover:underline"
                >
                  Add your first service
                </button>
              )}
            </div>
          )}

          {/* Categories */}
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="mb-8">
              {/* Category title */}
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {category}
              </h2>

              {/* Service cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((service) => (
                  <div
                    key={service._id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5"
                  >
                    {/* Name + Price */}
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {service.name}
                      </h3>

                      <span className="text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap">
                        ₹{Number(service.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Duration */}
                    <p className="text-xs text-slate-400 mt-2">
                      ⏱ {service.durationMinutes || 0} min
                    </p>

                    {/* Description */}
                    {service.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                        {service.description}
                      </p>
                    )}

                    {/* Admin actions */}
                    {isAdmin && (
                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={() => openEdit(service)}
                          className="text-cyan-600 text-sm hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(service._id)}
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
        </>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editId ? "Edit Service" : "Add Service"}
          onClose={() => {
            setShowModal(false);
            setForm(emptyForm);
            setEditId(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Service Name */}
            <input
              name="name"
              placeholder="Service name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Category */}
            <input
              name="category"
              placeholder="Category (e.g. Preventive, Surgery)"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
            />

            {/* Price + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price (₹)"
                required
                value={form.price}
                onChange={handleChange}
                className="border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
              />

              <input
                name="durationMinutes"
                type="number"
                min="1"
                placeholder="Duration (min)"
                required
                value={form.durationMinutes}
                onChange={handleChange}
                className="border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 dark:bg-slate-700 dark:text-white"
              rows="3"
            />

            {/* Submit */}
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