import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
