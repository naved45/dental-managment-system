import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
      <div className="relative w-80 max-w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients, appointments..."
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-300"
        />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle compact />
        <NotificationBell />
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-2 pr-4 py-1.5">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[140px]">{user?.name || "Staff"}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || "staff"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
