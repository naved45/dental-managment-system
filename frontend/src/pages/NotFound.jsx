import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center px-4">
      <p className="text-6xl mb-4">🦷</p>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">404 — Page not found</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium">
        Go Home
      </Link>
    </div>
  );
}
