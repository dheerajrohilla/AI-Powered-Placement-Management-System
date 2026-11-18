import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    department: "CSE",
    companyName: "",
    employeeId: ""
  });

  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = (showLoading = false) => {
    if (showLoading) setLoading(true);
    adminAPI.getUsers()
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error("Error loading users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(false);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.createUser({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password || "Password123",
        role: createForm.role,
        additionalData: {
          rollNumber: createForm.rollNumber,
          department: createForm.department,
          companyName: createForm.companyName,
          employeeId: createForm.employeeId
        }
      });
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "student", rollNumber: "", department: "CSE", companyName: "", employeeId: "" });
      fetchUsers(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      await adminAPI.toggleUserStatus(userId, !currentActive);
      fetchUsers(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change account status.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!showResetModal || !newPassword) return;
    setSubmitting(true);
    try {
      await adminAPI.resetUserPassword(showResetModal._id, newPassword);
      alert(`Password successfully reset for ${showResetModal.email}`);
      setShowResetModal(null);
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to permanently delete user: ${email}?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user account.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="company-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>User Account Management</h1>
          <p>Full CRUD control over platform accounts: Student, Company, TPO Officer, and Administrator.</p>
        </div>
        <button className="create-drive-btn" style={{ background: '#4f46e5', padding: '10px 18px', fontSize: '0.95rem' }} onClick={() => setShowCreateModal(true)}>
          ➕ Create New User
        </button>
      </div>

      {/* Stats */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Platform Users</span>
          <strong>{users.length}</strong>
          <p>All registered accounts</p>
        </div>
        <div className="company-stat-card">
          <span>Students</span>
          <strong style={{ color: '#2563eb' }}>{users.filter(u => u.role === 'student').length}</strong>
          <p>Candidate profiles</p>
        </div>
        <div className="company-stat-card">
          <span>Companies</span>
          <strong style={{ color: '#16a34a' }}>{users.filter(u => u.role === 'company').length}</strong>
          <p>Recruiter accounts</p>
        </div>
        <div className="company-stat-card">
          <span>TPO & Admins</span>
          <strong style={{ color: '#c026d3' }}>{users.filter(u => u.role === 'tpo' || u.role === 'admin').length}</strong>
          <p>Administrative staff</p>
        </div>
      </div>

      {/* User Table */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>User Account Directory</h2>
            <p>Filter by system role, activate/deactivate accounts, reset passwords, or delete entries.</p>
          </div>
          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="student">Students</option>
              <option value="company">Companies</option>
              <option value="tpo">TPO Officers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>User & Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Account Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="student-name">
                      <strong>{u.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: u.role === 'admin' ? '#e0e7ff' : u.role === 'tpo' ? '#fae8ff' : u.role === 'company' ? '#f0fdf4' : '#e0f2fe',
                      color: u.role === 'admin' ? '#4338ca' : u.role === 'tpo' ? '#c026d3' : u.role === 'company' ? '#16a34a' : '#0284c7'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span className={u.isActive !== false ? "status-badge placed" : "status-badge unplaced"}>
                      {u.isActive !== false ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: u.isActive !== false ? '#fee2e2' : '#dcfce7', color: u.isActive !== false ? '#b91c1c' : '#15803d', fontWeight: 600 }}
                      >
                        {u.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setShowResetModal(u)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#334155', fontWeight: 600 }}
                      >
                        🔑 Reset Pass
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id, u.email)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#ffffff', fontWeight: 600 }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="no-students">Loading user directory...</div>}
          {!loading && filteredUsers.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No user accounts found matching criteria.
            </div>
          )}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Create Platform User Account</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Default: Password123" minLength="6" required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                    <option value="tpo">TPO Officer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {createForm.role === 'student' && (
                  <>
                    <div className="form-group"><label>Roll Number</label><input type="text" value={createForm.rollNumber} onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })} placeholder="e.g. 2021099" required /></div>
                    <div className="form-group"><label>Department</label><input type="text" value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} required /></div>
                  </>
                )}

                {createForm.role === 'company' && (
                  <div className="form-group"><label>Company Name</label><input type="text" value={createForm.companyName} onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })} required /></div>
                )}

                {createForm.role === 'tpo' && (
                  <div className="form-group"><label>Employee ID</label><input type="text" value={createForm.employeeId} onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })} placeholder="e.g. EMP-999" required /></div>
                )}
              </div>

              <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="save-btn" style={{ background: '#64748b' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#4f46e5' }} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Reset Password for {showResetModal.name}</h3>
              <button onClick={() => setShowResetModal(null)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowResetModal(null)} className="save-btn" style={{ background: '#64748b' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#4f46e5' }} disabled={submitting}>
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default Users;
