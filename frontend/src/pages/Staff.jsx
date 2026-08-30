/*import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Staff() {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const load = () => api.get("/users").then((res) => setUsers(res.data));
  useEffect(load, []);

  const toggleRole = async (u) => {
    const role = u.role === "admin" ? "staff" : "admin";
    await api.put(`/users/${u._id}`, { role, isActive: u.isActive });
    load();
    showToast(`${u.name} is now ${role}`);
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u._id}`, { role: u.role, isActive: !u.isActive });
    load();
    showToast(u.isActive ? `${u.name} deactivated` : `${u.name} activated`);
  };

  const handleDelete = async (u) => {
    if (u._id === currentUser.id) return showToast("You can't delete your own account", "error");
    if (!confirm(`Remove ${u.name}?`)) return;
    await api.delete(`/users/${u._id}`);
    load();
    showToast("Staff member removed", "info");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Staff Management</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Admin-only: manage staff accounts and roles</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200">
                <td className="p-3 font-medium">{u.name} {u._id === currentUser.id && <span className="text-xs text-cyan-500">(you)</span>}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => toggleRole(u)} className="text-cyan-600 hover:underline">Make {u.role === "admin" ? "Staff" : "Admin"}</button>
                  <button onClick={() => toggleActive(u)} className="text-amber-600 hover:underline">{u.isActive ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => handleDelete(u)} className="text-red-500 hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
*/


import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Staff() {
  const [users, setUsers] = useState([]);

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Load all users
  const load = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users:", error);
      showToast("Failed to load staff members", "error");
    }
  };

  // Load users when component mounts
  useEffect(() => {
    load();
  }, []);

  // Toggle admin/staff role
  const toggleRole = async (u) => {
    try {
      const role = u.role === "admin" ? "staff" : "admin";

      await api.put(`/ users / ${u._id} `, {
        role,
        isActive: u.isActive,
      });

      await load();

      showToast(`${u.name} is now ${role} `);
    } catch (error) {
      console.error("Failed to update role:", error);
      showToast("Failed to update user role", "error");
    }
  };

  // Toggle active/inactive status
  const toggleActive = async (u) => {
    try {
      await api.put(`/ users / ${u._id} `, {
        role: u.role,
        isActive: !u.isActive,
      });

      await load();

      showToast(
        u.isActive
          ? `${u.name} deactivated`
          : `${u.name} activated`
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast("Failed to update user status", "error");
    }
  };

  // Delete user
  const handleDelete = async (u) => {
    if (u._id === currentUser?.id) {
      return showToast(
        "You can't delete your own account",
        "error"
      );
    }

    if (!confirm(`Remove ${u.name}?`)) {
      return;
    }

    try {
      await api.delete(`/ users / ${u._id} `);

      await load();

      showToast("Staff member removed", "info");
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast("Failed to remove staff member", "error");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
        Staff Management
      </h1>

      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Admin-only: manage staff accounts and roles
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200"
              >
                <td className="p-3 font-medium">
                  {u.name}{" "}
                  {u._id === currentUser?.id && (
                    <span className="text-xs text-cyan-500">
                      (you)
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {u.email}
                </td>

                <td className="p-3 capitalize">
                  {u.role}
                </td>

                <td className="p-3">
                  <span
                    className={`px - 2 py - 1 rounded - full text - xs font - medium ${u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      } `}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-3 space-x-2">
                  <button
                    onClick={() => toggleRole(u)}
                    className="text-cyan-600 hover:underline"
                  >
                    Make{" "}
                    {u.role === "admin" ? "Staff" : "Admin"}
                  </button>

                  <button
                    onClick={() => toggleActive(u)}
                    className="text-amber-600 hover:underline"
                  >
                    {u.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() => handleDelete(u)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

