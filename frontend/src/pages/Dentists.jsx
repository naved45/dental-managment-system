// import { useEffect, useState } from "react";
// import Layout from "../components/Layout";
// import Modal from "../components/Modal";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";

// const empty = { name: "", specialization: "", phone: "", email: "", experienceYears: "" };

// export default function Dentists() {
//   const [dentists, setDentists] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState(empty);
//   const [editId, setEditId] = useState(null);
//   const { user } = useAuth();
//   const { showToast } = useToast();
//   const isAdmin = user?.role === "admin";

//   const load = () => api.get("/dentists").then((res) => setDentists(res.data));
//   useEffect(load, []);

//   const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
//   const openEdit = (d) => { setForm(d); setEditId(d._id); setShowModal(true); };
//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editId) await api.put(`/dentists/${editId}`, form);
//       else await api.post("/dentists", form);
//       setShowModal(false);
//       load();
//       showToast(editId ? "Dentist updated" : "Dentist added");
//     } catch (err) {
//       showToast(err.response?.data?.message || "Save failed", "error");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this dentist?")) return;
//     await api.delete(`/dentists/${id}`);
//     load();
//     showToast("Dentist deleted", "info");
//   };

//   return (
//     <Layout>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctors</h1>
//           <p className="text-slate-500 dark:text-slate-400">
//             {isAdmin ? "Manage clinic doctors" : "View clinic doctors (read-only — ask an admin to make changes)"}
//           </p>
//         </div>
//         {isAdmin && (
//           <button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
//             + Add Doctor
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {dentists.map((d) => (
//           <div key={d._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
//             <h3 className="font-semibold text-slate-800 dark:text-white">{d.name}</h3>
//             <p className="text-sm text-cyan-600 dark:text-cyan-400">{d.specialization}</p>
//             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">📞 {d.phone}</p>
//             <p className="text-sm text-slate-500 dark:text-slate-400">✉️ {d.email}</p>
//             <p className="text-sm text-slate-500 dark:text-slate-400">🎓 {d.experienceYears} yrs experience</p>
//             <div className="mt-3 space-x-3">
//               {isAdmin ? (
//                 <>
//                   <button onClick={() => openEdit(d)} className="text-cyan-600 text-sm hover:underline">Edit</button>
//                   <button onClick={() => handleDelete(d._id)} className="text-red-500 text-sm hover:underline">Delete</button>
//                 </>
//               ) : (
//                 <span className="text-xs text-slate-400 italic">View only</span>
//               )}
//             </div>
//           </div>
//         ))}
//         {dentists.length === 0 && <p className="text-slate-400">No dentists added yet</p>}
//       </div>

//       {showModal && (
//         <Modal title={editId ? "Edit Dentist" : "Add Dentist"} onClose={() => setShowModal(false)}>
//           <form onSubmit={handleSubmit} className="space-y-3">
//             <input name="name" placeholder="Full name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
//             <input name="specialization" placeholder="Specialization (e.g. Orthodontist)" value={form.specialization} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
//             <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
//             <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
//             <input name="experienceYears" type="number" placeholder="Years of experience" value={form.experienceYears} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
//             <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
//               {editId ? "Update Dentist" : "Add Dentist"}
//             </button>
//           </form>
//         </Modal>
//       )}
//     </Layout>
//   );
// }








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

  const load = () => {
    api
      .get("/dentists")
      .then((res) => setDentists(res.data))
      .catch((err) => {
        console.error("Failed to load dentists:", err);
        showToast(
          err.response?.data?.message || "Failed to load doctors",
          "error"
        );
      });
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (d) => {
    setForm({
      name: d.name || "",
      specialization: d.specialization || "",
      phone: d.phone || "",
      email: d.email || "",
      experienceYears: d.experienceYears || "",
    });

    setEditId(d._id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/dentists/${editId}`, form);
      } else {
        await api.post("/dentists", form);
      }

      setShowModal(false);
      load();

      showToast(
        editId ? "Dentist updated" : "Dentist added",
        "success"
      );
    } catch (err) {
      console.error("Save dentist error:", err);

      showToast(
        err.response?.data?.message || "Save failed",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this dentist?")) return;

    try {
      await api.delete(`/dentists/${id}`);

      load();

      showToast("Dentist deleted", "info");
    } catch (err) {
      console.error("Delete dentist error:", err);

      showToast(
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Doctors
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Manage clinic doctors"
              : "View clinic doctors (read-only — ask an admin to make changes)"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Doctor
          </button>
        )}
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
              {isAdmin ? (
                <>
                  <button
                    onClick={() => openEdit(d)}
                    className="text-cyan-600 text-sm hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(d._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  View only
                </span>
              )}
            </div>
          </div>
        ))}

        {dentists.length === 0 && (
          <p className="text-slate-400">No dentists added yet</p>
        )}
      </div>

      {showModal && (
        <Modal
          title={editId ? "Edit Dentist" : "Add Dentist"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
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