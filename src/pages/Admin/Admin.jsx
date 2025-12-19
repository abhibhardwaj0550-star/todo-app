import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

/* ---------------- Admin Navbar ---------------- */
const AdminNavbar = ({ activeTab, setActiveTab }) => {
  const tabs = ["Dashboard", "Users", "Feedback"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`hover:text-blue-400 ${
              activeTab === tab ? "text-blue-400 font-bold" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 hover:scale-105 transition-transform duration-200"
      >
        Logout
      </button>
    </nav>
  );
};

/* ---------------- Stats Card ---------------- */
const StatsCard = ({ title, value }) => (
  <div className="bg-white shadow p-6 rounded-lg text-center border">
    <h2 className="text-gray-600 text-lg">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value ?? 0}</p>
  </div>
);

/* ---------------- Admin Page ---------------- */
export default function Admin() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ---------------- API Calls ---------------- */
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, authHeader);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, authHeader);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API}/admin/feedbacks`, authHeader);
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchFeedbacks();
  }, []);

  /* ---------------- Actions ---------------- */
  const updateRole = async (id, role) => {
    await axios.patch(
      `${API}/admin/users/${id}/role`,
      { role },
      authHeader
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`${API}/admin/users/${id}`, authHeader);
    fetchUsers();
    fetchFeedbacks();
  };

  const deleteFeedback = async (id) => {
    await axios.delete(`${API}/admin/feedbacks/${id}`, authHeader);
    fetchFeedbacks();
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-6">
        {/* -------- Dashboard -------- */}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <StatsCard title="Total Users" value={stats.totalUsers} />
            <StatsCard title="Total Admins" value={stats.totalAdmins} />
            <StatsCard title="Total Feedbacks" value={stats.totalFeedbacks} />
            <StatsCard title="Avg Rating" value={stats.avgRating} />
          </div>
        )}

        {/* -------- Users -------- */}
        {activeTab === "Users" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>

            <table className="border w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border">
                    <td className="p-2">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td className="flex gap-2 p-2">
                      <button
                        onClick={() =>
                          updateRole(
                            u._id,
                            u.role === "admin" ? "user" : "admin"
                          )
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Toggle Role
                      </button>

                      <button
                        onClick={() => deleteUser(u._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -------- Feedback -------- */}
        {activeTab === "Feedback" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Feedback Management</h1>

            <table className="border w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">User</th>
                  <th>Suggestion</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {feedbacks.map((fb) => (
                  <tr key={fb._id} className="border">
                    <td className="p-2">
                      {fb.userId?.name}
                      <br />
                      <span className="text-sm text-gray-500">
                        {fb.userId?.email}
                      </span>
                    </td>
                    <td>{fb.suggestion}</td>
                    <td>{fb.rating} ⭐</td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteFeedback(fb._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
