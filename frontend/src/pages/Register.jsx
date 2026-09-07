import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "staff" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-indigo-500/60 focus:border-indigo-400 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-400 transition text-sm";

  return (
    <div className="min-h-screen bg-[#0c0c16]">
      {/* Top nav, matching the light marketing-site header from the reference */}
      <header className="bg-white flex items-center justify-between px-8 py-4 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="text-2xl">🦷</span> DentalCare
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <Link to="/login" className="hover:text-indigo-600">Login</Link>
          <Link to="/patient-login" className="hover:text-indigo-600">Patient Portal</Link>
        </nav>
      </header>

      {/* Dark hero area with the sign-up card */}
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0f0f1c] border border-indigo-900/60 rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)] p-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🦷</span>
            <h1 className="text-xl font-extrabold text-white tracking-wide">DENTALCARE CLINIC</h1>
          </div>

          {error && <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-2.5 rounded-lg mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Enter Your Name" required value={form.name} onChange={handleChange} className={inputClass} />
            <input type="email" name="email" placeholder="Email" required value={form.email} onChange={handleChange} className={inputClass} />
            <input type="password" name="password" placeholder="Password" required value={form.password} onChange={handleChange} className={inputClass} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" required value={form.confirmPassword} onChange={handleChange} className={inputClass} />

            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              <option value="staff" className="bg-[#0f0f1c]">Staff Account</option>
              <option value="admin" className="bg-[#0f0f1c]">Admin Account</option>
            </select>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold tracking-wide transition"
            >
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">LOGIN</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
