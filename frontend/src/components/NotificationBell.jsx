import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  const loadCount = () => api.get("/notifications/unread-count").then((res) => setCount(res.data.count)).catch(() => {});
  const loadList = () => api.get("/notifications").then((res) => setNotifications(res.data)).catch(() => {});

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!open) loadList();
    setOpen((o) => !o);
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setCount(0);
    loadList();
  };

  const typeIcon = { appointment: "📅", payment: "💳", system: "🔔" };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200">
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-sm text-slate-700 dark:text-white">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-cyan-600 hover:underline">Mark all read</button>
          </div>
          {notifications.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No notifications yet</p>
          )}
          {notifications.map((n) => (
            <div key={n._id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700 text-sm flex gap-2 ${!n.read ? "bg-cyan-50/50 dark:bg-cyan-950/30" : ""}`}>
              <span>{typeIcon[n.type] || "🔔"}</span>
              <div>
                <p className="text-slate-700 dark:text-slate-200">{n.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
