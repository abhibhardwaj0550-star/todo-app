import React, { useEffect, useState } from "react";

// ---------------------- Admin Navbar Component ----------------------
const AdminNavbar = ({ activeTab, setActiveTab }) => {
  const tabs = ["Dashboard", "Users", "Feedback"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    
    window.location.href = "/login"; // redirect to login page
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

// ---------------------- Stats Card Component ----------------------
const StatsCard = ({ title, value }) => (
  <div className="bg-white shadow p-6 rounded-lg text-center border">
    <h2 className="text-gray-600 text-lg">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

// ---------------------- Main Admin Component ----------------------
export default function Admin() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem("token");

  // ---------------- Fetch Data Functions ----------------
  const fetchStats = () => {
    fetch("http://localhost:5000/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  };

  const fetchUsers = () => {
    fetch("http://localhost:5000/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error(err));
  };

  const fetchFeedbacks = () => {
    fetch("http://localhost:5000/admin/feedbacks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchFeedbacks();
  }, []);

  // ---------------- Action Functions ----------------
  const updateRole = async (id, role) => {
    await fetch(`http://localhost:5000/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    fetchFeedbacks(); // remove user's feedbacks too
  };

  const deleteFeedback = async (id) => {
    await fetch(`http://localhost:5000/admin/feedbacks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFeedbacks();
  };

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-6">
        {/* ---------------- Dashboard Tab ---------------- */}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard title="Total Users" value={stats.totalUsers} />
            <StatsCard title="Total Admins" value={stats.totalAdmins} />
            <StatsCard title="Total Feedbacks" value={stats.totalFeedbacks} />
            <StatsCard title="Avg Rating" value={stats.avgRating ?? "0"} />
          </div>
        )}

        {/* ---------------- Users Tab ---------------- */}
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
                  <tr className="border" key={u._id}>
                    <td className="p-2">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td className="flex gap-2 p-2">
                      <button
                        onClick={() =>
                          updateRole(u._id, u.role === "admin" ? "user" : "admin")
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

        {/* ---------------- Feedback Tab ---------------- */}
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
                  <tr className="border" key={fb._id}>
                    <td className="p-2">
                      {fb.userId?.name} <br />
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
