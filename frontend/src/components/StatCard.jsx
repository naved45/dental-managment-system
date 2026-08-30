export default function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color} dark:bg-slate-700`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
