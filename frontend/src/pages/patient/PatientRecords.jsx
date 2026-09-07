import { useEffect, useState } from "react";
import PatientLayout from "../../components/PatientLayout";
import patientApi from "../../api/patientAxios";
import { useToast } from "../../context/ToastContext";

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    patientApi.get("/portal/records").then((res) => setRecords(res.data));
  }, []);

  // Step 7: PDF download
  const downloadPdf = async (id) => {
    setBusyId(id);
    try {
      const res = await patientApi.get(`/portal/records/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `medical-report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Could not download report", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Step 9: Email the report
  const emailReport = async (id) => {
    setBusyId(id);
    try {
      const res = await patientApi.post(`/portal/records/${id}/email`);
      showToast(res.data.message, res.data.sent ? "success" : "info");
    } catch {
      showToast("Could not email report", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">My Medical Reports</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Diagnosis, treatment, and prescription history</p>

      <div className="space-y-3">
        {records.length === 0 && (
          <p className="text-slate-400 text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            No medical reports on file yet.
          </p>
        )}
        {records.map((r) => (
          <div key={r._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{new Date(r.visitDate).toLocaleDateString()}</p>
                {r.dentist?.name && <p className="text-xs text-cyan-600">Dr. {r.dentist.name} &bull; {r.dentist.specialization}</p>}
              </div>
              <div className="space-x-3 text-sm">
                <button disabled={busyId === r._id} onClick={() => downloadPdf(r._id)} className="text-cyan-600 hover:underline disabled:opacity-50">
                  Download PDF
                </button>
                <button disabled={busyId === r._id} onClick={() => emailReport(r._id)} className="text-slate-500 hover:underline disabled:opacity-50">
                  Email me
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {r.diagnosis && <div><span className="text-slate-400">Diagnosis</span><p className="text-slate-700 dark:text-slate-200">{r.diagnosis}</p></div>}
              {r.treatmentDone && <div><span className="text-slate-400">Treatment Done</span><p className="text-slate-700 dark:text-slate-200">{r.treatmentDone}</p></div>}
              {r.prescription && <div className="md:col-span-2"><span className="text-slate-400">Prescription</span><p className="text-slate-700 dark:text-slate-200">{r.prescription}</p></div>}
              {r.notes && <div className="md:col-span-2"><span className="text-slate-400">Notes</span><p className="text-slate-700 dark:text-slate-200">{r.notes}</p></div>}
            </div>
          </div>
        ))}
      </div>
    </PatientLayout>
  );
}
