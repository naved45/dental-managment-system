import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarPlus, CalendarDays, CreditCard, ClipboardList, Stethoscope, LogOut } from "lucide-react";
import { usePatientAuth } from "../context/PatientAuthContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/book-appointment", label: "Book Appointment", icon: CalendarPlus },
  { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
  { to: "/patient/doctors", label: "Our Doctors", icon: Stethoscope },
  { to: "/patient/payments", label: "My Payments", icon: CreditCard },
  { to: "/patient/records", label: "Medical Reports", icon: ClipboardList },
];

export default function PatientSidebar() {
  const { patient, logout } = usePatientAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/patient-login");
  };

  const itemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-cyan-50 text-cyan-600 dark:bg-slate-800 dark:text-cyan-400"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col sticky top-0">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center text-white text-lg shrink-0">
          🦷
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">DentalCare</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Patient Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} className={itemClass}>
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-semibold text-sm shrink-0">
            {patient?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{patient?.name}</p>
            <p className="text-xs text-slate-400 truncate">{patient?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm py-2 rounded-xl transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
