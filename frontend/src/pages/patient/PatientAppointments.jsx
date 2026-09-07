import { useEffect, useState } from "react";
import PatientLayout from "../../components/PatientLayout";
import patientApi from "../../api/patientAxios";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    patientApi.get("/portal/appointments").then((res) => setAppointments(res.data));
  }, []);

  const statusColor = {
    Scheduled: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">My Appointments</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Your full appointment history</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Dentist</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.time}</td>
                <td className="p-3">Dr. {a.dentist?.name} <span className="text-xs text-slate-400">({a.dentist?.specialization})</span></td>
                <td className="p-3">{a.reason || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">No appointments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PatientLayout>
  );
}
