import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/useAuth";
import { adminAPI } from "../../services/api";

function AdminProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    role: "Administrator"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    adminAPI.getProfile()
      .then((res) => {
        if (res.data?.user) {
          const u = res.data.user;
          setFormData({
            name: u.name || user?.name || "",
            email: u.email || user?.email || "",
            phone: u.phone || "",
            role: "Administrator"
          });
        }
      })
      .catch((err) => console.error("Error loading Admin profile:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      await adminAPI.updateProfile({
        name: formData.name,
        phone: formData.phone
      });
      setMessage("Admin profile updated successfully!");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage("Admin password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : "A";

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <p>Loading administrator profile...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="profile-page">
        <div className="profile-heading">
          <div>
            <h1>Administrator Profile</h1>
            <p>Platform system administration account settings & security credentials.</p>
          </div>
          <button className="edit-btn" style={{ background: '#ef4444' }} onClick={logout}>
            🚪 Logout
          </button>
        </div>

        {message && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}
        {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{errorMsg}</div>}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeTab === "profile" ? "#4f46e5" : "#f1f5f9",
              color: activeTab === "profile" ? "#ffffff" : "#475569"
            }}
          >
            📋 Admin Details
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeTab === "password" ? "#4f46e5" : "#f1f5f9",
              color: activeTab === "password" ? "#ffffff" : "#475569"
            }}
          >
            🔒 Change Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="profile-grid">
            <section className="profile-card" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                  {initial}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{formData.name}</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Role: <strong style={{ color: '#4f46e5' }}>System Administrator</strong></p>
                  <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Full platform governance & configuration access</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={formData.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 9999999999"
                    />
                  </div>
                  <div className="form-group">
                    <label>Access Role</label>
                    <input type="text" value="System Administrator" disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="save-btn" style={{ background: '#4f46e5' }} disabled={saving}>
                    {saving ? "Saving..." : "Save Admin Profile"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : (
          <div className="profile-grid">
            <section className="profile-card" style={{ maxWidth: '500px' }}>
              <h2>Admin Security Credentials</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>New Password (min 6 chars)</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    minLength="6"
                    required
                  />
                </div>
                <button type="submit" className="save-btn" style={{ background: '#4f46e5' }} disabled={saving}>
                  {saving ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
