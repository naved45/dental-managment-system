import PatientSidebar from "./PatientSidebar";

export default function PatientLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <PatientSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
