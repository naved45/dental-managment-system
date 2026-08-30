import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [patient, setPatient] = useState("");
  const [items, setItems] = useState([{ treatment: "", cost: "" }]);
  const [paidAmount, setPaidAmount] = useState(0);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const load = () => api.get("/invoices").then((res) => setInvoices(res.data));

  useEffect(() => {
    load();
    api.get("/patients", { params: { limit: 1000 } }).then((res) => setPatients(res.data.patients || res.data));
    api.get("/services").then((res) => setServices(res.data));
  }, []);

  const addItem = () => setItems([...items, { treatment: "", cost: "" }]);
  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    if (field === "treatment") {
      const match = services.find((s) => s.name === value);
      if (match) copy[i].cost = match.price;
    }
    setItems(copy);
  };
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((sum, it) => sum + (Number(it.cost) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";
    try {
      await api.post("/invoices", { patient, items, totalAmount: total, paidAmount, status });
      setShowModal(false);
      setPatient("");
      setItems([{ treatment: "", cost: "" }]);
      setPaidAmount(0);
      load();
      showToast("Invoice created");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create invoice", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    await api.delete(`/invoices/${id}`);
    load();
    showToast("Invoice deleted", "info");
  };

  const downloadInvoice = (inv) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(8, 145, 178);
    doc.text("DentalCare Management System", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("Invoice", 14, 26);

    doc.setFontSize(10);
    doc.text(`Invoice ID: ${inv._id}`, 14, 36);
    doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 14, 42);
    doc.text(`Patient: ${inv.patient?.name || "-"}`, 14, 48);
    doc.text(`Status: ${inv.status}`, 14, 54);

    autoTable(doc, {
      startY: 62,
      head: [["Treatment", "Cost (₹)"]],
      body: inv.items.map((it) => [it.treatment, it.cost.toString()]),
      theme: "striped",
      headStyles: { fillColor: [8, 145, 178] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Total: ₹${inv.totalAmount}`, 14, finalY);
    doc.text(`Paid: ₹${inv.paidAmount}`, 14, finalY + 6);
    doc.text(`Balance: ₹${inv.totalAmount - inv.paidAmount}`, 14, finalY + 12);

    doc.save(`invoice-${inv.patient?.name || "patient"}-${inv._id.slice(-6)}.pdf`);
  };

  const statusColor = { Paid: "bg-green-100 text-green-700", "Partially Paid": "bg-amber-100 text-amber-700", Unpaid: "bg-red-100 text-red-700" };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Billing & Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400">Track treatments and payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
            <tr>
              <th className="p-3">Patient</th>
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
                <td className="p-3">{inv.patient?.name}</td>
                <td className="p-3">₹{inv.totalAmount}</td>
                <td className="p-3">₹{inv.paidAmount}</td>
                <td className="p-3">₹{inv.totalAmount - inv.paidAmount}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{inv.status}</span></td>
                <td className="p-3 space-x-2">
                  <button onClick={() => downloadInvoice(inv)} className="text-cyan-600 hover:underline">Download PDF</button>
                  {isAdmin && <button onClick={() => handleDelete(inv._id)} className="text-red-500 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Invoice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select required value={patient} onChange={(e) => setPatient(e.target.value)} className="w-full border rounded-lg p-2.5">
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>

            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <input list="service-list" placeholder="Treatment" required value={it.treatment} onChange={(e) => updateItem(i, "treatment", e.target.value)} className="flex-1 border rounded-lg p-2.5" />
                  <input placeholder="Cost" type="number" required value={it.cost} onChange={(e) => updateItem(i, "cost", e.target.value)} className="w-28 border rounded-lg p-2.5" />
                  {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 px-2">✕</button>}
                </div>
              ))}
              <datalist id="service-list">
                {services.map((s) => <option key={s._id} value={s.name} />)}
              </datalist>
              <button type="button" onClick={addItem} className="text-cyan-600 text-sm">+ Add treatment item</button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
              <span className="text-slate-600 dark:text-slate-300">Total</span>
              <span className="font-semibold dark:text-white">₹{total}</span>
            </div>

            <input placeholder="Amount paid now" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="w-full border rounded-lg p-2.5" />

            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
              Create Invoice
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
