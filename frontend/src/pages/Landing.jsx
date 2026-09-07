import { Link } from "react-router-dom";

const features = [
  { icon: "🧑‍⚕️", title: "Patient Records", desc: "Store complete patient profiles, medical history and contact details in one place." },
  { icon: "📅", title: "Smart Scheduling", desc: "Book, track and manage appointments across all your dentists with live status updates." },
  { icon: "🦷", title: "Dentist Directory", desc: "Manage specializations, experience and availability of every dentist on staff." },
  { icon: "🧾", title: "Treatment Catalog", desc: "Maintain a price list of services so billing is fast and consistent." },
  { icon: "💳", title: "Billing & Invoices", desc: "Generate multi-item invoices, track payments and see outstanding balances instantly." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Visualize revenue trends and appointment activity with built-in charts." },
];

const testimonials = [
  { name: "Dr. Aisha Verma", role: "Clinic Owner", text: "Cut our front-desk paperwork in half. Everything from bookings to billing lives in one dashboard now." },
  { name: "Rohit Malhotra", role: "Clinic Manager", text: "The analytics view finally gives us a clear picture of monthly revenue and pending payments." },
];

export default function Landing() {
  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">🦷 DentalCare</span>
        <div className="space-x-3">
          <Link to="/patient-login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600">Patient Portal</Link>
          <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600">Staff Login</Link>
          <Link to="/register" className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <span className="inline-block bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-medium px-3 py-1 rounded-full mb-5">
          Built for modern dental clinics
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
          Run your dental clinic <span className="text-cyan-600 dark:text-cyan-400">without the paperwork</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
          One system for patients, appointments, dentists and billing — so your staff spend less time
          on admin and more time on patient care.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/register" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium">
            Register
          </Link>
          <Link to="/login" className="border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            Staff Login
          </Link>
          <Link to="/patient-login" className="border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 px-6 py-3 rounded-lg font-medium hover:bg-cyan-50 dark:hover:bg-slate-800">
            Patient Portal
          </Link>
        </div>
      </section>

      <section className="px-6 md:px-16 py-16 bg-slate-50 dark:bg-slate-800/40">
        <h2 className="text-2xl font-bold text-center mb-10">Everything your front desk needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Trusted by clinic staff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300 italic mb-4">"{t.text}"</p>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-slate-400">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center px-6 py-16 bg-cyan-600 text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to modernize your clinic?</h2>
        <p className="mb-6 text-cyan-50">Create a free staff account and get started in minutes.</p>
        <Link to="/register" className="bg-white text-cyan-700 px-6 py-3 rounded-lg font-medium">
          Create Account
        </Link>
      </section>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100 dark:border-slate-800">
        © {new Date().getFullYear()} DentalCare Management System — Portfolio project.
      </footer>
    </div>
  );
}
