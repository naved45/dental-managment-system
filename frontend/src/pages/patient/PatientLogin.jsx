import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePatientAuth } from "../../context/PatientAuthContext";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = usePatientAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-6">
      <div className="relative w-full max-w-5xl bg-sky-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        <div className="relative flex-1 p-10 md:p-14 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 text-lg leading-tight">
              Dental<br />Care
            </div>
            <span className="hidden sm:inline-block bg-slate-200/70 text-slate-700 text-xs font-medium px-4 py-2 rounded-full">
              Patient Portal
            </span>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
              Your Care,<br />Your History,<br />One Login
            </h1>
            <Link
              to="/patient-register"
              className="inline-block bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-medium transition"
            >
              New Patient? Sign Up
            </Link>
          </div>

          <div className="absolute -right-10 bottom-0 w-72 h-72 opacity-90 pointer-events-none hidden md:block">
            <div className="absolute right-8 bottom-6 w-48 h-48 rounded-full bg-cyan-200/70" />
            <div className="absolute right-24 bottom-24 text-8xl">🦷</div>
            <div className="absolute right-2 top-4 w-16 h-16 rounded-full bg-blue-200/60" />
          </div>
        </div>

        <div className="w-full md:w-[380px] bg-white p-8 md:p-10 md:m-6 md:rounded-2xl md:shadow-xl flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            <Link to="/" className="text-slate-300 hover:text-slate-500 text-2xl leading-none">&times;</Link>
          </div>

          {error && <p className="bg-red-50 text-red-600 text-sm p-2.5 rounded-lg mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label className="text-sm text-slate-700 font-medium">Email Address</label>
            <input
              type="email"
              required
              placeholder="Example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 mt-1.5 mb-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
            <label className="text-sm text-slate-700 font-medium">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 mt-1.5 mb-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />

            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-cyan-700 rounded"
              />
              <span className="text-sm text-slate-500">Remember me</span>
            </label>

            <button
              disabled={loading}
              className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Clinic staff? <Link to="/login" className="text-slate-600 font-medium hover:underline">Staff login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
