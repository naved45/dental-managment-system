/*import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import AppointmentCalendar from "../components/AppointmentCalendar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = { patient: "", dentist: "", date: "", time: "", reason: "", status: "Scheduled" };

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [view, setView] = useState("list");
  const [dayModal, setDayModal] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => api.get("/appointments").then((res) => setAppointments(res.data));

  useEffect(() => {
    load();
    api.get("/patients", { params: { limit: 1000 } }).then((res) => setPatients(res.data.patients || res.data));
    api.get("/dentists").then((res) => setDentists(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/appointments", form);
      setShowModal(false);
      setForm(empty);
      load();
      showToast("Appointment booked");
    } catch (err) {
      showToast(err.response?.data?.message || "Booking failed", "error");
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}`, { status });
    load();
    showToast(`Marked as ${status}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    await api.delete(`/appointments/${id}`);
    load();
    showToast("Appointment deleted", "info");
  };

  const statusColor = { Scheduled: "bg-amber-100 text-amber-700", Completed: "bg-green-100 text-green-700", Cancelled: "bg-red-100 text-red-700" };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400">Schedule and track patient visits</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>List</button>
            <button onClick={() => setView("calendar")} className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === "calendar" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>Calendar</button>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + New Appointment
          </button>
        </div>
      </div>

      {view === "calendar" && (
        <AppointmentCalendar appointments={appointments} onDayClick={(list, day) => setDayModal({ list, day })} />
      )}

      {view === "list" && (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
            <tr>
              <th className="p-3">Patient</th>
              <th className="p-3">Dentist</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3">{a.patient?.name}</td>
                <td className="p-3">{a.dentist?.name}</td>
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.time}</td>
                <td className="p-3">{a.reason}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                </td>
                <td className="p-3 space-x-2">
                  {a.status === "Scheduled" && (
                    <>
                      <button onClick={() => updateStatus(a._id, "Completed")} className="text-green-600 hover:underline">Complete</button>
                      <button onClick={() => updateStatus(a._id, "Cancelled")} className="text-amber-600 hover:underline">Cancel</button>
                    </>
                  )}
                  {isAdmin && <button onClick={() => handleDelete(a._id)} className="text-red-500 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan="7" className="p-6 text-center text-slate-400">No appointments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {dayModal && (
        <Modal title={dayModal.day.toDateString()} onClose={() => setDayModal(null)}>
          <div className="space-y-3">
            {dayModal.list.map((a) => (
              <div key={a._id} className="flex justify-between items-center border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{a.patient?.name} — {a.dentist?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{a.time} • {a.reason || "No reason given"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title="New Appointment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select name="patient" required value={form.patient} onChange={handleChange} className="w-full border rounded-lg p-2.5">
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <select name="dentist" required value={form.dentist} onChange={handleChange} className="w-full border rounded-lg p-2.5">
              <option value="">Select dentist</option>
              {dentists.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input name="date" type="date" required value={form.date} onChange={handleChange} className="border rounded-lg p-2.5" />
              <input name="time" type="time" required value={form.time} onChange={handleChange} className="border rounded-lg p-2.5" />
            </div>
            <input name="reason" placeholder="Reason for visit" value={form.reason} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
              Book Appointment
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
import AppointmentCalendar from "../components/AppointmentCalendar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = {
  patient: "",
  dentist: "",
  date: "",
  time: "",
  reason: "",
  status: "Scheduled",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);

  const [view, setView] = useState("list");
  const [dayModal, setDayModal] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  // ==========================================
  // LOAD APPOINTMENTS
  // ==========================================
  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments");

      console.log("Appointments response:", res.data);

      setAppointments(
        Array.isArray(res.data)
          ? res.data
          : res.data.appointments || []
      );
    } catch (err) {
      console.error("Failed to load appointments:", err);

      showToast(
        err.response?.data?.message ||
        "Failed to load appointments",
        "error"
      );
    }
  };

  // ==========================================
  // LOAD PATIENTS
  // ==========================================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients", {
        params: {
          limit: 1000,
        },
      });

      console.log("Patients response:", res.data);

      setPatients(
        Array.isArray(res.data)
          ? res.data
          : res.data.patients || []
      );
    } catch (err) {
      console.error("Failed to load patients:", err);

      showToast(
        err.response?.data?.message ||
        "Failed to load patients",
        "error"
      );
    }
  };

  // ==========================================
  // LOAD DENTISTS
  // ==========================================
  const loadDentists = async () => {
    try {
      const res = await api.get("/dentists");

      console.log("Dentists response:", res.data);

      /*
        Your backend might return either:

        [
          { _id: "...", name: "Dr. John" }
        ]

        OR:

        {
          dentists: [
            { _id: "...", name: "Dr. John" }
          ]
        }
      */

      setDentists(
        Array.isArray(res.data)
          ? res.data
          : res.data.dentists || []
      );
    } catch (err) {
      console.error("Failed to load dentists:", err);

      showToast(
        err.response?.data?.message ||
        "Failed to load dentists",
        "error"
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadAppointments(),
        loadPatients(),
        loadDentists(),
      ]);
    };

    loadData();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // BOOK APPOINTMENT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Booking appointment:", form);

      await api.post("/appointments", form);

      setShowModal(false);
      setForm(empty);

      await loadAppointments();

      showToast("Appointment booked");
    } catch (err) {
      console.error("Booking error:", err);

      showToast(
        err.response?.data?.message ||
        "Booking failed",
        "error"
      );
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/ appointments / ${id} `, {
        status,
      });

      await loadAppointments();

      showToast(`Marked as ${status} `);
    } catch (err) {
      console.error("Status update error:", err);

      showToast(
        err.response?.data?.message ||
        "Failed to update status",
        "error"
      );
    }
  };

  // ==========================================
  // DELETE APPOINTMENT
  // ==========================================
  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) {
      return;
    }

    try {
      await api.delete(`/ appointments / ${id} `);

      await loadAppointments();

      showToast("Appointment deleted", "info");
    } catch (err) {
      console.error("Delete appointment error:", err);

      showToast(
        err.response?.data?.message ||
        "Failed to delete appointment",
        "error"
      );
    }
  };

  const statusColor = {
    Scheduled: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Appointments
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            Schedule and track patient visits
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* VIEW SWITCHER */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px - 3 py - 1.5 rounded - md text - sm font - medium ${view === "list"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
                } `}
            >
              List
            </button>

            <button
              onClick={() => setView("calendar")}
              className={`px - 3 py - 1.5 rounded - md text - sm font - medium ${view === "calendar"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
                } `}
            >
              Calendar
            </button>
          </div>

          {/* NEW APPOINTMENT */}
          <button
            onClick={() => {
              setForm(empty);
              setShowModal(true);
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* CALENDAR */}
      {view === "calendar" && (
        <AppointmentCalendar
          appointments={appointments}
          onDayClick={(list, day) =>
            setDayModal({ list, day })
          }
        />
      )}

      {/* LIST */}
      {view === "list" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
              <tr>
                <th className="p-3">Patient</th>
                <th className="p-3">Dentist</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200"
                >
                  <td className="p-3">
                    {a.patient?.name || "Unknown"}
                  </td>

                  <td className="p-3">
                    {a.dentist?.name || "Unknown"}
                  </td>

                  <td className="p-3">
                    {a.date
                      ? new Date(
                        a.date
                      ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {a.time || "-"}
                  </td>

                  <td className="p-3">
                    {a.reason || "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px - 2 py - 1 rounded - full text - xs font - medium ${statusColor[a.status] ||
                        "bg-slate-100 text-slate-600"
                        } `}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="p-3 space-x-2">
                    {a.status === "Scheduled" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(
                              a._id,
                              "Completed"
                            )
                          }
                          className="text-green-600 hover:underline"
                        >
                          Complete
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              a._id,
                              "Cancelled"
                            )
                          }
                          className="text-amber-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() =>
                          handleDelete(a._id)
                        }
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-slate-400"
                  >
                    No appointments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DAY MODAL */}
      {dayModal && (
        <Modal
          title={dayModal.day.toDateString()}
          onClose={() => setDayModal(null)}
        >
          <div className="space-y-3">
            {dayModal.list.map((a) => (
              <div
                key={a._id}
                className="flex justify-between items-center border border-slate-100 dark:border-slate-700 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {a.patient?.name || "Unknown"} —{" "}
                    {a.dentist?.name || "Unknown"}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.time} •{" "}
                    {a.reason || "No reason given"}
                  </p>
                </div>

                <span
                  className={`px - 2 py - 1 rounded - full text - xs font - medium ${statusColor[a.status] ||
                    "bg-slate-100 text-slate-600"
                    } `}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {showModal && (
        <Modal
          title="New Appointment"
          onClose={() => {
            setShowModal(false);
            setForm(empty);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* PATIENT */}
            <select
              name="patient"
              required
              value={form.patient}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            >
              <option value="">
                Select patient
              </option>

              {patients.map((p) => (
                <option
                  key={p._id}
                  value={p._id}
                >
                  {p.name}
                </option>
              ))}
            </select>

            {/* DENTIST */}
            <select
              name="dentist"
              required
              value={form.dentist}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            >
              <option value="">
                Select dentist
              </option>

              {dentists.map((d) => (
                <option
                  key={d._id}
                  value={d._id}
                >
                  {d.name}
                  {d.specialization
                    ? ` — ${d.specialization} `
                    : ""}
                </option>
              ))}
            </select>

            {/* DATE + TIME */}
            <div className="grid grid-cols-2 gap-3">
              <input
                name="date"
                type="date"
                required
                value={form.date}
                onChange={handleChange}
                className="border rounded-lg p-2.5"
              />

              <input
                name="time"
                type="time"
                required
                value={form.time}
                onChange={handleChange}
                className="border rounded-lg p-2.5"
              />
            </div>

            {/* REASON */}
            <input
              name="reason"
              placeholder="Reason for visit"
              value={form.reason}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5"
            />

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium"
            >
              Book Appointment
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}



