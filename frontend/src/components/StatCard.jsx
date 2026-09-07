const COLOR_MAP = {
  blue:   { border: "border-l-blue-500",   iconBg: "bg-blue-50 dark:bg-slate-700",   iconText: "text-blue-600 dark:text-cyan-400" },
  green:  { border: "border-l-green-500",  iconBg: "bg-green-50 dark:bg-slate-700",  iconText: "text-green-600 dark:text-green-400" },
  purple: { border: "border-l-purple-500", iconBg: "bg-purple-50 dark:bg-slate-700", iconText: "text-purple-600 dark:text-purple-400" },
  amber:  { border: "border-l-amber-500",  iconBg: "bg-amber-50 dark:bg-slate-700",  iconText: "text-amber-600 dark:text-amber-400" },
};

export default function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-100 dark:border-slate-700 border-l-4 ${c.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.iconBg} ${c.iconText}`}>
        {Icon && <Icon size={20} strokeWidth={2} />}
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
