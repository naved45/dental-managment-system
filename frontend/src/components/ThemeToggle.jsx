import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ compact = false }) {
  const { dark, toggle } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggle}
        title="Toggle dark mode"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition"
      >
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      title="Toggle dark mode"
      className="w-full flex items-center justify-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg mb-2 transition"
    >
      {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
