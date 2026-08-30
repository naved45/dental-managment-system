import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../api/axios";

const COLORS = { Scheduled: "#f59e0b", Completed: "#22c55e", Cancelled: "#ef4444" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => setError("Could not load stats. Make sure backend & MongoDB are running."));
    api.get("/appointments/today/list").then((res) => setToday(res.data)).catch(() => {});
  }, []);

  const pieData = stats
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Overview of your dental clinic</p>

      {error && <p className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-6 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Patients" value={stats?.patients ?? "-"} icon="🧑‍⚕️" color="bg-cyan-50" />
        <StatCard label="Total Dentists" value={stats?.dentists ?? "-"} icon="🦷" color="bg-purple-50" />
        <StatCard label="Upcoming Appointments" value={stats?.upcomingAppointments ?? "-"} icon="📅" color="bg-amber-50" />
        <StatCard label="Revenue Collected" value={stats ? `₹${stats.revenue}` : "-"} icon="💰" color="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Revenue Trend (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.revenueTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Appointments by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            {Object.entries(COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} /> {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Pending Payments</h2>
          <p className="text-3xl font-bold text-red-500">{stats ? `₹${stats.pending}` : "-"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total amount yet to be collected from patients</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Today's Appointments</h2>
          {today.length === 0 && <p className="text-sm text-slate-400">No appointments scheduled for today.</p>}
          <ul className="space-y-2">
            {today.map((a) => (
              <li key={a._id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-slate-700 dark:text-slate-200">{a.patient?.name} — {a.dentist?.name}</span>
                <span className="text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
