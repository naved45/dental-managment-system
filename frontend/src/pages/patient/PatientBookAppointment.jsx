import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../components/PatientLayout";
import patientApi from "../../api/patientAxios";
import { useToast } from "../../context/ToastContext";

const empty = { dentist: "", date: "", time: "", reason: "" };

export default function PatientBookAppointment() {
  const [dentists, setDentists] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    patientApi.get("/portal/doctors").then((res) => setDentists(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientApi.post("/portal/appointments", form);
      showToast("Appointment booked! A confirmation email is on its way.");
      navigate("/patient/appointments");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not book appointment", "error");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Book an Appointment</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Pick a dentist, date and time that works for you</p>

      <div className="max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">Dentist</label>
            <select
              name="dentist"
              required
              value={form.dentist}
              onChange={handleChange}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2.5 mt-1"
            >
              <option value="">Select a dentist</option>
              {dentists.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name} — {d.specialization} ({d.experienceYears} yrs)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">Date</label>
              <input
                type="date" name="date" required min={today} value={form.date} onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2.5 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">Time</label>
              <input
                type="time" name="time" required value={form.time} onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2.5 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">Reason for visit</label>
            <textarea
              name="reason" rows="3" value={form.reason} onChange={handleChange}
              placeholder="e.g. Toothache, routine checkup, cleaning..."
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2.5 mt-1"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      <div className="max-w-xl mt-4 bg-cyan-50 dark:bg-slate-800 border border-cyan-100 dark:border-slate-700 rounded-xl p-4 text-sm text-cyan-800 dark:text-cyan-300">
        📧 The clinic staff will see this booking immediately, and you'll get a confirmation email
        right away (plus a reminder the day before your visit).
      </div>
    </PatientLayout>
  );
}
