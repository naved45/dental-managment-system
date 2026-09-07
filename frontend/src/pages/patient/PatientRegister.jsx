import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePatientAuth } from "../../context/PatientAuthContext";

export default function PatientRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = usePatientAuth();
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
      await register(form);
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-cyan-500/60 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-400 transition text-sm";

  return (
    <div className="min-h-screen bg-[#0c1316]">
      <header className="bg-white flex items-center justify-between px-8 py-4 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="text-2xl">🦷</span> DentalCare
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-cyan-600">Home</Link>
          <Link to="/patient-login" className="hover:text-cyan-600">Patient Login</Link>
          <Link to="/login" className="hover:text-cyan-600">Staff Login</Link>
        </nav>
      </header>

      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0f1a1c] border border-cyan-900/60 rounded-3xl shadow-[0_0_60px_-15px_rgba(6,182,212,0.35)] p-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🦷</span>
            <h1 className="text-xl font-extrabold text-white tracking-wide">DENTALCARE PATIENT PORTAL</h1>
          </div>

          {error && <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-2.5 rounded-lg mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Enter Your Name" required value={form.name} onChange={handleChange} className={inputClass} />
            <input type="email" name="email" placeholder="Email" required value={form.email} onChange={handleChange} className={inputClass} />
            <input name="phone" placeholder="Phone Number" required value={form.phone} onChange={handleChange} className={inputClass} />
            <input type="password" name="password" placeholder="Password" required value={form.password} onChange={handleChange} className={inputClass} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" required value={form.confirmPassword} onChange={handleChange} className={inputClass} />

            <button
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold tracking-wide transition"
            >
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/patient-login" className="text-cyan-400 font-bold hover:text-cyan-300">LOGIN</Link>
          </p>
          <p className="text-center text-xs text-slate-500 mt-4">
            If the clinic already has your records on file, use the same email/phone they have &mdash;
            your existing history will be linked automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
