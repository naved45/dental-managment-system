import { Navigate } from "react-router-dom";
import { usePatientAuth } from "../context/PatientAuthContext";

export default function PatientPrivateRoute({ children }) {
  const { patient } = usePatientAuth();
  if (!patient) return <Navigate to="/patient-login" replace />;
  return children;
}
