import { useMemo, useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns";

const statusDot = { Pending: "bg-amber-500", Scheduled: "bg-blue-500", Completed: "bg-green-500", Cancelled: "bg-red-500" };

export default function AppointmentCalendar({ appointments, onDayClick }) {
  const [month, setMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDay = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const key = format(new Date(a.date), "yyyy-MM-dd");
      map[key] = map[key] || [];
      map[key].push(a);
    });
    return map;
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setMonth((m) => subMonths(m, 1))} className="px-3 py-1 rounded-lg border dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">‹ Prev</button>
        <h3 className="font-semibold text-slate-800 dark:text-white">{format(month, "MMMM yyyy")}</h3>
        <button onClick={() => setMonth((m) => addMonths(m, 1))} className="px-3 py-1 rounded-lg border dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Next ›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayAppts = byDay[key] || [];
          const inMonth = isSameMonth(day, month);
          const today = isSameDay(day, new Date());
          return (
            <button
              key={key}
              onClick={() => dayAppts.length && onDayClick?.(dayAppts, day)}
              className={`min-h-[70px] p-1.5 rounded-lg border text-left align-top flex flex-col gap-0.5 transition ${
                inMonth ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600"
              } ${today ? "border-cyan-400" : "border-slate-100 dark:border-slate-700"} ${dayAppts.length ? "hover:border-cyan-400 cursor-pointer" : "cursor-default"}`}
            >
              <span className={`text-xs ${today ? "text-cyan-600 font-bold" : "text-slate-500 dark:text-slate-400"}`}>{format(day, "d")}</span>
              <div className="flex flex-wrap gap-0.5">
                {dayAppts.slice(0, 3).map((a) => (
                  <span key={a._id} className={`w-1.5 h-1.5 rounded-full ${statusDot[a.status] || "bg-slate-400"}`} title={a.status} />
                ))}
                {dayAppts.length > 3 && <span className="text-[10px] text-slate-400">+{dayAppts.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
