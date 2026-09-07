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
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load staff:", err);
      showToast(err.response?.data?.message || "Failed to load staff", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Toggle Admin / Staff role
  const toggleRole = async (user) => {
    const isCurrentUser = user._id === currentUser?._id || user._id === currentUser?.id;
    if (isCurrentUser) {
      showToast("You can't change your own role", "error");
      return;
    }
    const newRole = user.role === "admin" ? "staff" : "admin";
    try {
      setActionId(user._id);
      await api.put(`/users/${user._id}`, {
        role: newRole,
        isActive: user.isActive,
      });
      await loadUsers();
      showToast(`${user.name} is now ${newRole}`, "success");
    } catch (err) {
      console.error("Role update error:", err);
      showToast(err.response?.data?.message || "Failed to update role", "error");
    } finally {
      setActionId(null);
    }
  };

  // Activate / Deactivate user
  const toggleActive = async (user) => {
    const isCurrentUser = user._id === currentUser?._id || user._id === currentUser?.id;
    if (isCurrentUser) {
      showToast("You can't deactivate your own account", "error");
      return;
    }
    try {
      setActionId(user._id);
      await api.put(`/users/${user._id}`, {
        role: user.role,
        isActive: !user.isActive,
      });
      await loadUsers();
      showToast(
        user.isActive ? `${user.name} deactivated` : `${user.name} activated`,
        "success"
      );
    } catch (err) {
      console.error("Status update error:", err);
      showToast(err.response?.data?.message || "Failed to update account status", "error");
    } finally {
      setActionId(null);
    }
  };

  // Delete user
  const handleDelete = async (user) => {
    const isCurrentUser = user._id === currentUser?._id || user._id === currentUser?.id;
    if (isCurrentUser) {
      showToast("You can't delete your own account", "error");
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to remove ${user.name}?`);
    if (!confirmed) return;
    try {
      setActionId(user._id);
      await api.delete(`/users/${user._id}`);
      await loadUsers();
      showToast("Staff member removed", "info");
    } catch (err) {
      console.error("Delete user error:", err);
      showToast(err.response?.data?.message || "Failed to remove staff member", "error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Staff Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Admin-only: manage staff accounts and roles
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">Loading staff...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user._id === currentUser?._id || user._id === currentUser?.id;
                const isProcessing = actionId === user._id;
                return (
                  <tr
                    key={user._id}
                    className="border-t border-slate-100 dark:border-slate-700 dark:text-slate-200"
                  >
                    {/* Name */}
                    <td className="p-3 font-medium">
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-xs text-cyan-500 ml-2">(you)</span>
                      )}
                    </td>
                    {/* Email */}
                    <td className="p-3">{user.email}</td>
                    {/* Role */}
                    <td className="p-3 capitalize">{user.role}</td>
                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-3">
                        {/* Change Role */}
                        <button
                          disabled={isCurrentUser || isProcessing}
                          onClick={() => toggleRole(user)}
                          className={`text-cyan-600 hover:underline ${isCurrentUser || isProcessing
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          Make {user.role === "admin" ? "Staff" : "Admin"}
                        </button>
                        {/* Activate / Deactivate */}
                        <button
                          disabled={isCurrentUser || isProcessing}
                          onClick={() => toggleActive(user)}
                          className={`text-amber-600 hover:underline ${isCurrentUser || isProcessing
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        {/* Delete */}
                        <button
                          disabled={isCurrentUser || isProcessing}
                          onClick={() => handleDelete(user)}
                          className={`text-red-500 hover:underline ${isCurrentUser || isProcessing
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400">No staff accounts found.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
