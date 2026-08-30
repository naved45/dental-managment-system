import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/patients", label: "Patients", icon: "🧑‍⚕️" },
  { to: "/appointments", label: "Appointments", icon: "📅" },
  { to: "/dentists", label: "Dentists", icon: "🦷" },
  { to: "/services", label: "Services", icon: "🧾" },
  { to: "/billing", label: "Billing", icon: "💳" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white min-h-screen flex flex-col sticky top-0">
      <div className="p-5 border-b border-slate-700 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-400">🦷 DentalCare</h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>
        <NotificationBell />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <span>{link.icon}</span> {link.label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink
            to="/staff"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <span>👥</span> Staff
          </NavLink>
        )}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
              isActive ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span>⚙️</span> Profile
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <ThemeToggle />
        <p className="text-sm text-slate-300">{user?.name}</p>
        <p className="text-xs text-slate-500 mb-3 capitalize">{user?.role}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-red-600 text-sm py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
