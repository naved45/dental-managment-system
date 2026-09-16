import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../api/axios";
import patientApi from "../api/patientAxios";
import { useAuth } from "../context/AuthContext";
import { usePatientAuth } from "../context/PatientAuthContext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const type = params.get("type") === "patient" ? "patient" : "staff";
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const { user, markEmailVerified: markStaffVerified } = useAuth();
  const { patient, markEmailVerified: markPatientVerified } = usePatientAuth();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing a token.");
      return;
    }
    const client = type === "patient" ? patientApi : api;
    const endpoint = type === "patient" ? `/patient-auth/verify-email/${token}` : `/auth/verify-email/${token}`;

    client
      .get(endpoint)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully.");
        // If this browser is already logged in as the matching account, reflect it immediately.
        if (type === "patient" && patient) markPatientVerified();
        if (type === "staff" && user) markStaffVerified();
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link is invalid or has expired.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, type]);

  const loginLink = type === "patient" ? "/patient-login" : "/login";
  const loginLabel = type === "patient" ? "Go to Patient Login" : "Go to Staff Login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 text-cyan-600 animate-spin" size={40} />
            <h1 className="text-xl font-bold text-slate-800 mb-2">Verifying your email...</h1>
            <p className="text-slate-500 text-sm">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-green-500" size={44} />
            <h1 className="text-xl font-bold text-slate-800 mb-2">Email Verified!</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link to={loginLink} className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-medium transition">
              {loginLabel}
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={44} />
            <h1 className="text-xl font-bold text-slate-800 mb-2">Verification Failed</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link to={loginLink} className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition">
              {loginLabel}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
