import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ClipboardList, Wallet, CalendarPlus, MailWarning } from "lucide-react";
import PatientLayout from "../../components/PatientLayout";
import StatCard from "../../components/StatCard";
import patientApi from "../../api/patientAxios";
import { usePatientAuth } from "../../context/PatientAuthContext";
import { useToast } from "../../context/ToastContext";

export default function PatientDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const { patient } = usePatientAuth();
  const { showToast } = useToast();

  useEffect(() => {
    patientApi
      .get("/portal/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load your dashboard. Please try logging in again."));
  }, []);

  const resendVerification = async () => {
    setResending(true);
    try {
      const res = await patientApi.post("/patient-auth/resend-verification");
      showToast(res.data.message, res.data.sent ? "success" : "info");
    } catch {
      showToast("Could not send verification email", "error");
    } finally {
      setResending(false);
    }
  };

  const isPending = data?.nextAppointment?.status === "Pending";

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
        Welcome back{data ? `, ${data.patient.name}` : ""} 👋
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Here's a summary of your dental care</p>

      {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</p>}

      {patient && patient.emailVerified === false && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-lg mb-6 text-sm">
          <span className="flex items-center gap-2"><MailWarning size={16} /> Please verify your email address to secure your account.</span>
          <button
            disabled={resending}
            onClick={resendVerification}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={data?.totalAppointments ?? "-"} icon={CalendarDays} color="blue" />
        <StatCard label="Completed Visits" value={data?.totalVisits ?? "-"} icon={CheckCircle2} color="green" />
        <StatCard label="Medical Reports" value={data?.totalRecords ?? "-"} icon={ClipboardList} color="purple" />
        <StatCard label="Outstanding Balance" value={data ? `₹${data.outstandingBalance}` : "-"} icon={Wallet} color="amber" />
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-800 dark:text-white">Next Appointment</h2>
          <Link
            to="/patient/book-appointment"
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <CalendarPlus size={16} /> Book Appointment
          </Link>
        </div>
        {data?.nextAppointment ? (
          <div className="text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">
                {new Date(data.nextAppointment.date).toLocaleDateString()} at {data.nextAppointment.time}
              </p>
              {isPending && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Awaiting confirmation
                </span>
              )}
            </div>
            <p className="text-sm text-cyan-600 mt-1">
              Dr. {data.nextAppointment.dentist?.name} &mdash; {data.nextAppointment.dentist?.specialization}
            </p>
            {data.nextAppointment.reason && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reason: {data.nextAppointment.reason}</p>
            )}
            {isPending && (
              <p className="text-xs text-amber-600 mt-2">
                🕓 The clinic hasn't confirmed this yet — you'll get an email as soon as they do.
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400">No upcoming appointments scheduled.</p>
        )}
      </div>

      <div className="mt-4 bg-cyan-50 dark:bg-slate-800 border border-cyan-100 dark:border-slate-700 rounded-xl p-4 text-sm text-cyan-800 dark:text-cyan-300">
        📧 You'll receive an email as soon as you book (pending confirmation), another when the clinic
        confirms it, a reminder the day before, and a receipt whenever a payment is recorded.
      </div>
    </PatientLayout>
  );
}
