import { useEffect, useRef } from "react";
import patientApi from "../api/patientAxios";
import { useToast } from "../context/ToastContext";

// A silent background watcher (renders nothing) mounted once in
// PatientLayout, so it's active on every page of the patient portal.
// Polls the patient's own appointments and pops a toast the moment a
// Pending request is approved or declined by staff — no page reload,
// no manual refresh needed.
const POLL_INTERVAL_MS = 5000;

export default function PatientAppointmentWatcher() {
  const lastStatus = useRef(null); // null = not seeded yet (first load)
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await patientApi.get("/portal/appointments");
        const appointments = res.data;

        if (lastStatus.current === null) {
          // First load: remember current statuses, don't toast for history.
          lastStatus.current = new Map(appointments.map((a) => [a._id, a.status]));
          return;
        }

        appointments.forEach((a) => {
          const prev = lastStatus.current.get(a._id);
          if (prev && prev !== a.status) {
            if (prev === "Pending" && a.status === "Scheduled") {
              showToast(
                `✅ Your appointment with Dr. ${a.dentist?.name || ""} on ${new Date(a.date).toLocaleDateString()} has been confirmed!`,
                "success",
                8000
              );
            } else if (prev === "Pending" && a.status === "Cancelled") {
              showToast(
                `⚠️ Your appointment request for ${new Date(a.date).toLocaleDateString()} was declined by the clinic. Check your email or book another time.`,
                "error",
                8000
              );
            }
          }
          lastStatus.current.set(a._id, a.status);
        });
      } catch {
        /* silent — polling failure shouldn't interrupt the UI */
      }
    };

    poll();
    const interval = setInterval(() => {
      if (!cancelled) poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showToast]);

  return null;
}
