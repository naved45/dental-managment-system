import axios from "axios";

// A separate Axios instance for the patient portal, so a patient's login
// session never collides with a staff/admin session in the same browser
// (each uses its own localStorage key and its own token).
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const patientApi = axios.create({ baseURL: API_BASE });

patientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("patientToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default patientApi;
