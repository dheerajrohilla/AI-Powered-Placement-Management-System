import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { useAuth } from "../../context/useAuth";
import { tpoAPI } from "../../services/api";

function TPOProfile() {
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
    department: "Training & Placement Cell",
    designation: "Head Training & Placement Officer",
    collegeName: "National Institute of Technology",
    officeLocation: "Placement Cell, Main Block"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    tpoAPI.getProfile()
      .then((res) => {
        if (res.data) {
          const u = res.data.user || {};
          const t = res.data.tpoProfile || {};
          setFormData({
            name: u.name || user?.name || "",
            email: u.email || user?.email || "",
            phone: u.phone || t.phone || "",
            department: t.department || "Training & Placement Cell",
            designation: t.designation || "Head Training & Placement Officer",
            collegeName: t.collegeName || "National Institute of Technology",
            officeLocation: t.officeLocation || "Placement Cell, Main Block"
          });
        }
      })
      .catch((err) => console.error("Error loading TPO profile:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      await tpoAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        collegeName: formData.collegeName,
        officeLocation: formData.officeLocation
      });
      setMessage("Profile details saved successfully!");
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
      await tpoAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : "T";

  if (loading) {
    return (
      <TPOLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <p>Loading officer profile...</p>
        </div>
      </TPOLayout>
    );
  }

  return (
    <TPOLayout>
      <div className="profile-page">
        <div className="profile-heading">
          <div>
            <h1>TPO Officer Profile</h1>
            <p>Manage your account settings, contact info, and security preferences.</p>
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
              background: activeTab === "profile" ? "#2563eb" : "#f1f5f9",
              color: activeTab === "profile" ? "#ffffff" : "#475569"
            }}
          >
            📋 Profile Details
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeTab === "password" ? "#2563eb" : "#f1f5f9",
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
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                  {initial}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{formData.name}</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Role: <strong>Training & Placement Officer</strong></p>
                  <p style={{ margin: '2px 0 0 0', color: '#2563eb', fontWeight: 500 }}>{formData.collegeName}</p>
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
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department / Cell</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>College Name</label>
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Office Location</label>
                    <input
                      type="text"
                      value={formData.officeLocation}
                      onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : (
          <div className="profile-grid">
            <section className="profile-card" style={{ maxWidth: '500px' }}>
              <h2>Security Settings</h2>
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
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </TPOLayout>
  );
}

export default TPOProfile;
