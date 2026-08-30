import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-1">🦷 DentalCare</h1>
        <p className="text-center text-slate-500 text-sm mb-6">Create Staff Account</p>
        {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}
        <label className="text-sm text-slate-600">Full Name</label>
        <input name="name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2.5 mt-1 mb-4 outline-cyan-500" />
        <label className="text-sm text-slate-600">Email</label>
        <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2.5 mt-1 mb-4 outline-cyan-500" />
        <label className="text-sm text-slate-600">Password</label>
        <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full border rounded-lg p-2.5 mt-1 mb-4 outline-cyan-500" />
        <label className="text-sm text-slate-600">Role</label>
        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-lg p-2.5 mt-1 mb-6 outline-cyan-500">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium transition">
          Register
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-cyan-600 font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
}
