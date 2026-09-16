import { createContext, useContext, useState } from "react";
import patientApi from "../api/patientAxios";

const PatientAuthContext = createContext(null);

export function PatientAuthProvider({ children }) {
  const [patient, setPatient] = useState(() => {
    const stored = localStorage.getItem("patientUser");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await patientApi.post("/patient-auth/login", { email, password });
    localStorage.setItem("patientToken", data.token);
    localStorage.setItem("patientUser", JSON.stringify(data.patient));
    setPatient(data.patient);
  };

  const register = async (form) => {
    const { data } = await patientApi.post("/patient-auth/register", form);
    localStorage.setItem("patientToken", data.token);
    localStorage.setItem("patientUser", JSON.stringify(data.patient));
    setPatient(data.patient);
  };

  const logout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientUser");
    setPatient(null);
  };

  const markEmailVerified = () => {
    setPatient((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, emailVerified: true };
      localStorage.setItem("patientUser", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <PatientAuthContext.Provider value={{ patient, login, register, logout, markEmailVerified }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export const usePatientAuth = () => useContext(PatientAuthContext);
