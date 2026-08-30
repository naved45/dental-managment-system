import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
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
