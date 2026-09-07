import { useEffect, useState } from "react";
import PatientLayout from "../../components/PatientLayout";
import patientApi from "../../api/patientAxios";
import { useToast } from "../../context/ToastContext";

export default function PatientPayments() {
  const [invoices, setInvoices] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    patientApi.get("/portal/invoices").then((res) => setInvoices(res.data));
  }, []);

  const statusColor = {
    Paid: "bg-green-100 text-green-700",
    "Partially Paid": "bg-amber-100 text-amber-700",
    Unpaid: "bg-red-100 text-red-700",
  };

  // Step 7: PDF download
  const downloadPdf = async (id) => {
    setBusyId(id);
    try {
      const res = await patientApi.get(`/portal/invoices/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Could not download receipt", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Step 9: Email the receipt again
  const emailReceipt = async (id) => {
    setBusyId(id);
    try {
      const res = await patientApi.post(`/portal/invoices/${id}/email`);
      showToast(res.data.message, res.data.sent ? "success" : "info");
    } catch {
      showToast("Could not email receipt", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">My Payments</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Your billing and payment history</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="p-3">₹{inv.totalAmount}</td>
                <td className="p-3">₹{inv.paidAmount}</td>
                <td className="p-3">₹{inv.totalAmount - inv.paidAmount}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{inv.status}</span></td>
                <td className="p-3 space-x-2">
                  <button disabled={busyId === inv._id} onClick={() => downloadPdf(inv._id)} className="text-cyan-600 hover:underline disabled:opacity-50">
                    Download PDF
                  </button>
                  <button disabled={busyId === inv._id} onClick={() => emailReceipt(inv._id)} className="text-slate-500 hover:underline disabled:opacity-50">
                    Email me
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PatientLayout>
  );
}
