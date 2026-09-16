import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-6">
      <div className="relative w-full max-w-5xl bg-emerald-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        {/* Left: marketing panel */}
        <div className="relative flex-1 p-10 md:p-14 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 text-lg leading-tight">
              Dental<br />Care
            </div>
            <span className="hidden sm:inline-block bg-slate-200/70 text-slate-700 text-xs font-medium px-4 py-2 rounded-full">
              Dental Emergency
            </span>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
              Your Gateway<br />to Exceptional<br />Dental Care
            </h1>
            <Link
              to="/patient-register"
              className="inline-block bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-medium transition"
            >
              Make Appointment
            </Link>
          </div>

          {/* Decorative illustration — no stock photo, just abstract dental-themed shapes */}
          <div className="absolute -right-10 bottom-0 w-72 h-72 opacity-90 pointer-events-none hidden md:block">
            <div className="absolute right-8 bottom-6 w-48 h-48 rounded-full bg-emerald-200/70" />
            <div className="absolute right-24 bottom-24 text-8xl">🦷</div>
            <div className="absolute right-2 top-4 w-16 h-16 rounded-full bg-cyan-200/60" />
          </div>
        </div>

        {/* Right: floating sign-in card */}
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
              className="w-full border border-slate-200 rounded-lg p-3 mt-1.5 mb-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
            <label className="text-sm text-slate-700 font-medium">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 mt-1.5 mb-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />

            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded"
              />
              <span className="text-sm text-slate-500">Remember me</span>
            </label>

            <button
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <Link to="/register" className="text-sm text-emerald-800 font-medium hover:underline">
              Create staff or admin account
            </Link>
            <button className="text-sm text-emerald-800 hover:underline">Forgot Password?</button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Patient? <Link to="/patient-login" className="text-slate-600 font-medium hover:underline">Use the patient portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
