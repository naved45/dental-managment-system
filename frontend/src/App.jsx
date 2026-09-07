import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { PatientAuthProvider } from "./context/PatientAuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import PatientPrivateRoute from "./components/PatientPrivateRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Dentists from "./pages/Dentists";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientPayments from "./pages/patient/PatientPayments";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientBookAppointment from "./pages/patient/PatientBookAppointment";
import PatientDoctors from "./pages/patient/PatientDoctors";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PatientAuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
                <Route path="/patients/:id" element={<PrivateRoute><PatientDetail /></PrivateRoute>} />
                <Route path="/dentists" element={<PrivateRoute><Dentists /></PrivateRoute>} />
                <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
                <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
                <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
                <Route path="/staff" element={<AdminRoute><Staff /></AdminRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                {/* Patient self-service portal — separate login from staff */}
                <Route path="/patient-login" element={<PatientLogin />} />
                <Route path="/patient-register" element={<PatientRegister />} />
                <Route path="/patient/dashboard" element={<PatientPrivateRoute><PatientDashboard /></PatientPrivateRoute>} />
                <Route path="/patient/appointments" element={<PatientPrivateRoute><PatientAppointments /></PatientPrivateRoute>} />
                <Route path="/patient/payments" element={<PatientPrivateRoute><PatientPayments /></PatientPrivateRoute>} />
                <Route path="/patient/records" element={<PatientPrivateRoute><PatientRecords /></PatientPrivateRoute>} />
                <Route path="/patient/book-appointment" element={<PatientPrivateRoute><PatientBookAppointment /></PatientPrivateRoute>} />
                <Route path="/patient/doctors" element={<PatientPrivateRoute><PatientDoctors /></PatientPrivateRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PatientAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
