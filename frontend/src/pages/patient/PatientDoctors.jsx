import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../components/PatientLayout";
import patientApi from "../../api/patientAxios";

export default function PatientDoctors() {
  const [dentists, setDentists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    patientApi.get("/portal/doctors").then((res) => setDentists(res.data));
  }, []);

  return (
    <PatientLayout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Our Doctors</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Meet the dentists available at our clinic</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dentists.map((d) => (
          <div key={d._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-slate-700 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-lg font-bold mb-3">
              {d.name?.[0]?.toUpperCase()}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Dr. {d.name}</h3>
            <p className="text-sm text-cyan-600 dark:text-cyan-400">{d.specialization}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">🎓 {d.experienceYears} years experience</p>
            <button
              onClick={() => navigate("/patient/book-appointment")}
              className="mt-4 w-full bg-cyan-50 dark:bg-slate-700 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-slate-600 text-sm font-medium py-2 rounded-lg transition"
            >
              Book with Dr. {d.name}
            </button>
          </div>
        ))}
        {dentists.length === 0 && <p className="text-slate-400">No doctors listed yet.</p>}
      </div>
    </PatientLayout>
  );
}
