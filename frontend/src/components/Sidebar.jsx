import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Stethoscope, ClipboardList,
  CreditCard, ShieldCheck, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/dentists", label: "Doctors", icon: Stethoscope },
  { to: "/services", label: "Services", icon: ClipboardList },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const itemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-white text-indigo-700 shadow-sm"
        : "text-indigo-200 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-[#1e2358] min-h-screen flex flex-col sticky top-0">
      <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-lg shrink-0">
          🦷
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">DentalCare</h1>
          <p className="text-[11px] text-indigo-300">Management System</p>
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
        {user?.role === "admin" && (
          <NavLink to="/staff" className={itemClass}>
            <ShieldCheck size={18} strokeWidth={2} />
            Staff
          </NavLink>
        )}
        <NavLink to="/profile" className={itemClass}>
          <Settings size={18} strokeWidth={2} />
          Settings
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </aside>
  );
}
