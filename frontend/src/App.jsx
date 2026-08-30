import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
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

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
