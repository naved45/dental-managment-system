import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Preferences saved");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Profile & Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Your account information</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Full name</label>
            <input defaultValue={user?.name} className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Email notifications for appointments</span>
            <input type="checkbox" checked={notifEmail} onChange={() => setNotifEmail(!notifEmail)} className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">SMS reminders</span>
            <input type="checkbox" checked={notifSms} onChange={() => setNotifSms(!notifSms)} className="w-4 h-4" />
          </div>
          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium">
            Save Changes
          </button>
        </form>
      </div>
    </Layout>
  );
}
