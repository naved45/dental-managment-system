import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, UserRound, CalendarCheck2, ChevronLeft, ChevronRight, CalendarPlus, UserPlus } from "lucide-react";
import Layout from "../components/Layout";
import api from "../api/axios";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_BADGE = {
  Scheduled: "bg-amber-100 text-amber-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};
const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-cyan-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500"];

function colorForName(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [error, setError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = prev, +1 = next
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => setError("Could not load stats. Make sure backend & MongoDB are running."));
    api.get("/appointments").then((res) => setAppointments(res.data)).catch(() => {});
    api.get("/patients?limit=5&page=1").then((res) => setRecentPatients(res.data.patients || [])).catch(() => {});
  }, []);

  // ---- "Appointments Statistics" chart: real counts per day for the viewed month ----
  const chartDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const chartData = useMemo(() => {
    const year = chartDate.getFullYear();
    const month = chartDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const counts = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, appointments: 0 }));
    appointments.forEach((a) => {
      const d = new Date(a.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        counts[d.getDate() - 1].appointments += 1;
      }
    });
    return counts;
  }, [appointments, chartDate]);

  // ---- "Upcoming Appointments" panel: a 7-day strip starting today, filtered to the selected day ----
  const dateStrip = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => sameDay(new Date(a.date), selectedDay))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDay]);

  const patientsToday = useMemo(() => {
    const today = new Date();
    const ids = new Set(appointments.filter((a) => sameDay(new Date(a.date), today)).map((a) => a.patient?._id));
    return ids.size;
  }, [appointments]);

  // Most recent appointment's reason, per patient — used as a "Treatment" column
  // built from real data, since our Patient model has no separate treatment field.
  const latestTreatmentByPatient = useMemo(() => {
    const map = {};
    [...appointments]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((a) => {
        if (a.patient?._id) map[a.patient._id] = a.reason || a.status;
      });
    return map;
  }, [appointments]);

  const dayLabel = (d) => {
    const today = new Date();
    if (sameDay(d, today)) return "Today";
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (sameDay(d, tomorrow)) return "Tomorrow";
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  };

  return (
    <Layout>
      {error && <p className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-6 text-sm">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard overview</h1>
        <div className="flex gap-3">
          <Link to="/appointments" className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
            <CalendarPlus size={16} /> Make an Appointment
          </Link>
          <Link to="/patients" className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
            <UserPlus size={16} /> Add Patient
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{patientsToday}</p>
            <p className="text-xs text-slate-400">Patients Today</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-slate-700 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <UserRound size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{stats?.patients ?? "-"}</p>
            <p className="text-xs text-slate-400">Total Patients</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{stats?.upcomingAppointments ?? "-"}</p>
            <p className="text-xs text-slate-400">Scheduled Appointments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: chart + latest patients */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white">Appointments Statistics</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setMonthOffset((m) => m - 1)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-32 text-center">
                  {MONTH_NAMES[chartDate.getMonth()]} {chartDate.getFullYear()}
                </span>
                <button onClick={() => setMonthOffset((m) => m + 1)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={2} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, "Appointments"]} labelFormatter={(d) => `Day ${d}`} />
                <Line type="monotone" dataKey="appointments" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Latest Patients</h2>
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-left">
                <tr>
                  <th className="pb-2 font-medium">No</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Membership</th>
                  <th className="pb-2 font-medium">Treatment</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p, i) => (
                  <tr key={p._id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 text-slate-500">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-2.5 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                    <td className="py-2.5">
                      {p.hasPortalAccess ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Member</span>
                      ) : (
                        <span className="text-xs text-slate-400">Not a member</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {latestTreatmentByPatient[p._id] ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {latestTreatmentByPatient[p._id]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentPatients.length === 0 && (
                  <tr><td colSpan="5" className="py-6 text-center text-slate-400">No patients yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: upcoming appointments with date strip */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">{dayLabel(selectedDay)}'s Appointments</h2>

          <div className="flex justify-between mb-5">
            {dateStrip.map((d) => {
              const active = sameDay(d, selectedDay);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDay(d)}
                  className={`flex flex-col items-center w-9 py-2 rounded-lg transition ${
                    active ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-[10px] uppercase">{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</span>
                  <span className="text-sm font-semibold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {dayAppointments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No appointments on this day.</p>
            )}
            {dayAppointments.map((a) => (
              <div key={a._id} className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0">
                <div className={`w-9 h-9 rounded-full ${colorForName(a.patient?.name)} text-white flex items-center justify-center text-sm font-semibold shrink-0`}>
                  {a.patient?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{a.patient?.name}</p>
                  <p className="text-xs text-slate-400 truncate">Dr. {a.dentist?.name} {a.reason ? `— ${a.reason}` : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{a.time}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
