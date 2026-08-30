import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const emptyRecord = { diagnosis: "", treatmentDone: "", prescription: "", notes: "", dentist: "" };

export default function PatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("info");
  const [records, setRecords] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState(emptyRecord);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const loadRecords = () => api.get(`/records/patient/${id}`).then((res) => setRecords(res.data));

  useEffect(() => {
    api.get(`/patients/${id}/full`).then((res) => setData(res.data));
    loadRecords();
    api.get("/dentists").then((res) => setDentists(res.data));
  }, [id]);

  if (!data) return <Layout><p className="text-slate-400">Loading...</p></Layout>;

  const { patient, appointments, invoices } = data;

  const tabs = [
    { key: "info", label: "Info" },
    { key: "appointments", label: `Appointments (${appointments.length})` },
    { key: "invoices", label: `Invoices (${invoices.length})` },
    { key: "records", label: `Medical Records (${records.length})` },
  ];

  const handleRecordChange = (e) => setRecordForm({ ...recordForm, [e.target.name]: e.target.value });

  const submitRecord = async (e) => {
    e.preventDefault();
    try {
      let attachments = [];
      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        attachments = [{ filename: res.data.filename, url: res.data.url }];
      }
      await api.post("/records", { ...recordForm, patient: id, attachments });
      setShowRecordModal(false);
      setRecordForm(emptyRecord);
      setFile(null);
      loadRecords();
      showToast("Medical record added");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add record", "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    if (!confirm("Delete this medical record?")) return;
    await api.delete(`/records/${recordId}`);
    loadRecords();
    showToast("Record deleted", "info");
  };

  return (
    <Layout>
      <Link to="/patients" className="text-sm text-cyan-600 hover:underline">&larr; Back to Patients</Link>
      <div className="flex items-center gap-4 mt-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl font-bold">
          {patient.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{patient.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">{patient.phone} • {patient.gender}, {patient.age} yrs</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key ? "border-cyan-600 text-cyan-600" : "border-transparent text-slate-500 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "records" && (
          <button onClick={() => setShowRecordModal(true)} className="mb-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            + Add Record
          </button>
        )}
      </div>

      {tab === "info" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 grid grid-cols-2 gap-4 text-sm max-w-2xl">
          <div><span className="text-slate-400">Email</span><p className="text-slate-700 dark:text-slate-200">{patient.email || "-"}</p></div>
          <div><span className="text-slate-400">Blood Group</span><p className="text-slate-700 dark:text-slate-200">{patient.bloodGroup || "-"}</p></div>
          <div className="col-span-2"><span className="text-slate-400">Address</span><p className="text-slate-700 dark:text-slate-200">{patient.address || "-"}</p></div>
          <div className="col-span-2"><span className="text-slate-400">Medical History / Allergies</span><p className="text-slate-700 dark:text-slate-200">{patient.medicalHistory || "-"}</p></div>
        </div>
      )}

      {tab === "appointments" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
              <tr><th className="p-3">Date</th><th className="p-3">Time</th><th className="p-3">Dentist</th><th className="p-3">Reason</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                  <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3">{a.dentist?.name}</td>
                  <td className="p-3">{a.reason}</td>
                  <td className="p-3">{a.status}</td>
                </tr>
              ))}
              {appointments.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">No appointments yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "invoices" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
              <tr><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Paid</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                  <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">₹{inv.totalAmount}</td>
                  <td className="p-3">₹{inv.paidAmount}</td>
                  <td className="p-3">{inv.status}</td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-400">No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === "records" && (
        <div className="space-y-3">
          {records.length === 0 && (
            <p className="text-slate-400 text-center py-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              No medical records yet.
            </p>
          )}
          {records.map((r) => (
            <div key={r._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{new Date(r.visitDate).toLocaleDateString()}</p>
                  {r.dentist?.name && <p className="text-xs text-cyan-600">Dr. {r.dentist.name} • {r.dentist.specialization}</p>}
                </div>
                <button onClick={() => deleteRecord(r._id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {r.diagnosis && <div><span className="text-slate-400">Diagnosis</span><p className="text-slate-700 dark:text-slate-200">{r.diagnosis}</p></div>}
                {r.treatmentDone && <div><span className="text-slate-400">Treatment Done</span><p className="text-slate-700 dark:text-slate-200">{r.treatmentDone}</p></div>}
                {r.prescription && <div className="md:col-span-2"><span className="text-slate-400">Prescription</span><p className="text-slate-700 dark:text-slate-200">{r.prescription}</p></div>}
                {r.notes && <div className="md:col-span-2"><span className="text-slate-400">Notes</span><p className="text-slate-700 dark:text-slate-200">{r.notes}</p></div>}
              </div>
              {r.attachments?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.attachments.map((a, i) => (
                    <a
                      key={i}
                      href={`${api.defaults.baseURL.replace(/\/api$/, "")}${a.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-md hover:underline"
                    >
                      📎 {a.filename || "Attachment"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRecordModal && (
        <Modal title="Add Medical Record" onClose={() => setShowRecordModal(false)}>
          <form onSubmit={submitRecord} className="space-y-3">
            <select name="dentist" value={recordForm.dentist} onChange={handleRecordChange} className="w-full border rounded-lg p-2.5">
              <option value="">Select dentist (optional)</option>
              {dentists.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <input name="diagnosis" placeholder="Diagnosis" value={recordForm.diagnosis} onChange={handleRecordChange} className="w-full border rounded-lg p-2.5" />
            <input name="treatmentDone" placeholder="Treatment done" value={recordForm.treatmentDone} onChange={handleRecordChange} className="w-full border rounded-lg p-2.5" />
            <textarea name="prescription" placeholder="Prescription" value={recordForm.prescription} onChange={handleRecordChange} className="w-full border rounded-lg p-2.5" rows="2" />
            <textarea name="notes" placeholder="Additional notes" value={recordForm.notes} onChange={handleRecordChange} className="w-full border rounded-lg p-2.5" rows="2" />
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300">Attach X-ray / document (image or PDF, optional)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full border rounded-lg p-2 mt-1 text-sm" />
            </div>
            <button disabled={uploading} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium">
              {uploading ? "Uploading..." : "Save Record"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
