import { useEffect, useRef, useState } from "react";
import { CalendarClock, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePatientAuth } from "../context/PatientAuthContext";
import { useToast } from "../context/ToastContext";
import { connectSocket, disconnectSocket } from "../api/socket";
import api from "../api/axios";
import Modal from "./Modal";

// Mounted ONCE at the top of the app (see App.jsx) so the WebSocket
// connection persists across page navigation instead of reconnecting on
// every click. This is what makes "the admin sees a live popup the instant
// a patient books — no page reload" actually work: it's a server push over
// a single long-lived connection, not a page refresh or a timed poll.
export default function RealtimeNotifications() {
  const { user } = useAuth();
  const { patient } = usePatientAuth();
  const { showToast } = useToast();
  const connectedAs = useRef(null);

  // A queue of incoming "new appointment request" alerts for staff, shown as
  // an actionable popup (not just a toast) since this needs a decision, not
  // just an FYI. Queued so multiple near-simultaneous bookings don't clobber
  // each other.
  const [queue, setQueue] = useState([]);
  const [busy, setBusy] = useState(false);
  const current = queue[0] || null;

  useEffect(() => {
    const staffToken = localStorage.getItem("token");
    const patientToken = localStorage.getItem("patientToken");

    if (user && staffToken) {
      if (connectedAs.current === `staff:${user.id}`) return;
      connectedAs.current = `staff:${user.id}`;
      const socket = connectSocket(staffToken);

      socket.on("appointment:new", (data) => {
        setQueue((q) => [...q, data]);
      });

      return () => socket.off("appointment:new");
    }

    if (patient && patientToken) {
      if (connectedAs.current === `patient:${patient.id}`) return;
      connectedAs.current = `patient:${patient.id}`;
      const socket = connectSocket(patientToken);

      socket.on("appointment:approved", (data) => {
        showToast(`✅ Your appointment with Dr. ${data.dentistName} on ${new Date(data.date).toLocaleDateString()} is confirmed!`, "success");
      });
      socket.on("appointment:declined", (data) => {
        showToast(`Your appointment request for ${new Date(data.date).toLocaleDateString()} could not be confirmed. Please choose another time.`, "error");
      });

      return () => {
        socket.off("appointment:approved");
        socket.off("appointment:declined");
      };
    }

    if (!user && !patient && connectedAs.current) {
      connectedAs.current = null;
      disconnectSocket();
    }
  }, [user, patient, showToast]);

  const respond = async (status) => {
    if (!current) return;
    setBusy(true);
    try {
      await api.put(`/appointments/${current._id}`, { status });
      showToast(status === "Scheduled" ? "Appointment approved — patient notified by email" : "Appointment declined — patient notified by email");
    } catch {
      showToast("Could not update appointment — open the Appointments page to try again", "error");
    } finally {
      setBusy(false);
      setQueue((q) => q.slice(1));
    }
  };

  const dismiss = () => setQueue((q) => q.slice(1));

  if (!current) return null;

  return (
    <Modal title="New Appointment Request" onClose={dismiss}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <CalendarClock size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white">{current.patientName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            with Dr. {current.dentistName} &bull; {new Date(current.date).toLocaleDateString()} at {current.time}
          </p>
          {current.reason && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reason: {current.reason}</p>}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        This just came in live — no need to refresh. {queue.length > 1 && `(${queue.length - 1} more waiting)`}
      </p>
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => respond("Scheduled")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition"
        >
          <Check size={16} /> Approve
        </button>
        <button
          disabled={busy}
          onClick={() => respond("Cancelled")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 py-2.5 rounded-lg font-medium transition"
        >
          <X size={16} /> Decline
        </button>
      </div>
      <button onClick={dismiss} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3">
        Decide later
      </button>
    </Modal>
  );
}
