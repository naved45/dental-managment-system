import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
