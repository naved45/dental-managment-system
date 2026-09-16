import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import AppointmentCalendar from "../components/AppointmentCalendar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const empty = { patient: "", dentist: "", date: "", time: "", reason: "", status: "Scheduled" };
const STATUS_TABS = ["All", "Pending", "Scheduled", "Completed", "Cancelled"];
const statusColor = {
  Pending: "bg-amber-100 text-amber-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [view, setView] = useState("list");
  const [dayModal, setDayModal] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get("status") || "All";
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => api.get("/appointments").then((res) => setAppointments(res.data));

  useEffect(() => {
    load();
    api.get("/patients", { params: { limit: 1000 } }).then((res) => setPatients(res.data.patients || res.data));
    api.get("/dentists").then((res) => setDentists(res.data));

    // Live-refresh the list in the background so a newly booked/approved
    // appointment shows up here without anyone reloading the page.
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
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

  const updateStatus = async (id, status, successMsg) => {
    setActingId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      await load();
      showToast(successMsg || `Marked as ${status}`);
    } catch {
      showToast("Could not update appointment", "error");
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    await api.delete(`/appointments/${id}`);
    load();
    showToast("Appointment deleted", "info");
  };

  const visibleAppointments = filterStatus === "All" ? appointments : appointments.filter((a) => a.status === filterStatus);
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
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

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s === "All" ? {} : { status: s })}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              filterStatus === s
                ? "bg-slate-900 dark:bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {s} {s === "Pending" && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {view === "calendar" && (
        <AppointmentCalendar appointments={visibleAppointments} onDayClick={(list, day) => setDayModal({ list, day })} />
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
            {visibleAppointments.map((a) => (
              <tr key={a._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3">{a.patient?.name}</td>
                <td className="p-3">{a.dentist?.name}</td>
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.time}</td>
                <td className="p-3">{a.reason}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                </td>
                <td className="p-3 space-x-2 whitespace-nowrap">
                  {a.status === "Pending" && (
                    <>
                      <button
                        disabled={actingId === a._id}
                        onClick={() => updateStatus(a._id, "Scheduled", "Appointment approved — patient notified by email")}
                        className="text-green-600 hover:underline disabled:opacity-50 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actingId === a._id}
                        onClick={() => updateStatus(a._id, "Cancelled", "Appointment declined — patient notified by email")}
                        className="text-red-500 hover:underline disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
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
            {visibleAppointments.length === 0 && (
              <tr><td colSpan="7" className="p-6 text-center text-slate-400">No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} appointments</td></tr>
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
