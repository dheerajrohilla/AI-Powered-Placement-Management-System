import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function SystemConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [config, setConfig] = useState({
    collegeName: "National Institute of Technology",
    collegeCode: "NIT-2026",
    address: "Campus Road, University Enclave",
    contactEmail: "placement@college.edu",
    academicYear: "2025-2026",
    departments: "CSE, ECE, IT, ME, EEE, Civil",
    minCgpaDefault: 6.5,
    autoShortlistThreshold: 8.0,
    maxApplicationsPerStudent: 15,
    allowMultipleOffers: false,
    requireResumeUpload: true,
    emailAlertsEnabled: true,
    systemAlertsEnabled: true
  });

  useEffect(() => {
    adminAPI.getSystemConfig()
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setConfig({
            collegeName: d.collegeName || "National Institute of Technology",
            collegeCode: d.collegeCode || "NIT-2026",
            address: d.address || "Campus Road, University Enclave",
            contactEmail: d.contactEmail || "placement@college.edu",
            academicYear: d.academicYear || "2025-2026",
            departments: (d.departments || ['CSE', 'ECE', 'IT', 'ME', 'EEE', 'Civil']).join(', '),
            minCgpaDefault: d.placementSettings?.minCgpaDefault || 6.5,
            autoShortlistThreshold: d.placementSettings?.autoShortlistThreshold || 8.0,
            maxApplicationsPerStudent: d.placementSettings?.maxApplicationsPerStudent || 15,
            allowMultipleOffers: d.applicationSettings?.allowMultipleOffers ?? false,
            requireResumeUpload: d.applicationSettings?.requireResumeUpload ?? true,
            emailAlertsEnabled: d.notificationSettings?.emailAlertsEnabled ?? true,
            systemAlertsEnabled: d.notificationSettings?.systemAlertsEnabled ?? true
          });
        }
      })
      .catch((err) => console.error("Error loading system config:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      await adminAPI.updateSystemConfig({
        collegeName: config.collegeName,
        collegeCode: config.collegeCode,
        address: config.address,
        contactEmail: config.contactEmail,
        academicYear: config.academicYear,
        departments: config.departments.split(',').map(s => s.trim()).filter(Boolean),
        placementSettings: {
          minCgpaDefault: Number(config.minCgpaDefault),
          autoShortlistThreshold: Number(config.autoShortlistThreshold),
          maxApplicationsPerStudent: Number(config.maxApplicationsPerStudent)
        },
        applicationSettings: {
          allowMultipleOffers: config.allowMultipleOffers,
          requireResumeUpload: config.requireResumeUpload
        },
        notificationSettings: {
          emailAlertsEnabled: config.emailAlertsEnabled,
          systemAlertsEnabled: config.systemAlertsEnabled
        }
      });

      setMessage("System configuration successfully saved!");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="profile-page">
        <div className="profile-heading">
          <div>
            <h1>System Configuration</h1>
            <p>Manage college details, academic year, department lists, placement rules, and notification preferences.</p>
          </div>
        </div>

        {message && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}
        {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>

            {/* COLLEGE INFORMATION */}
            <section className="profile-card">
              <h2>College & Academic Profile</h2>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>College Name</label>
                <input type="text" value={config.collegeName} onChange={(e) => setConfig({ ...config, collegeName: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>College Code</label>
                <input type="text" value={config.collegeCode} onChange={(e) => setConfig({ ...config, collegeCode: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Contact Email</label>
                <input type="email" value={config.contactEmail} onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Academic Year</label>
                <input type="text" value={config.academicYear} onChange={(e) => setConfig({ ...config, academicYear: e.target.value })} placeholder="e.g. 2025-2026" required />
              </div>
              <div className="form-group">
                <label>Campus Address</label>
                <input type="text" value={config.address} onChange={(e) => setConfig({ ...config, address: e.target.value })} required />
              </div>
            </section>

            {/* PLACEMENT & APPLICATION RULES */}
            <section className="profile-card">
              <h2>Placement Rules & Defaults</h2>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Default Min CGPA Eligibility</label>
                <input type="number" step="0.1" value={config.minCgpaDefault} onChange={(e) => setConfig({ ...config, minCgpaDefault: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Auto-Shortlist CGPA Threshold</label>
                <input type="number" step="0.1" value={config.autoShortlistThreshold} onChange={(e) => setConfig({ ...config, autoShortlistThreshold: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Max Applications Per Student</label>
                <input type="number" value={config.maxApplicationsPerStudent} onChange={(e) => setConfig({ ...config, maxApplicationsPerStudent: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Departments / Branches (comma separated)</label>
                <input type="text" value={config.departments} onChange={(e) => setConfig({ ...config, departments: e.target.value })} required />
              </div>
            </section>

            {/* SYSTEM PREFERENCES & NOTIFICATIONS */}
            <section className="profile-card" style={{ gridColumn: 'span 2' }}>
              <h2>Application & System Preferences</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.allowMultipleOffers} onChange={(e) => setConfig({ ...config, allowMultipleOffers: e.target.checked })} />
                  <span>Allow Placed Students to Apply for Dream Companies</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.requireResumeUpload} onChange={(e) => setConfig({ ...config, requireResumeUpload: e.target.checked })} />
                  <span>Require PDF Resume Upload Before Application</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.emailAlertsEnabled} onChange={(e) => setConfig({ ...config, emailAlertsEnabled: e.target.checked })} />
                  <span>Enable Email Notifications for Drive Updates</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.systemAlertsEnabled} onChange={(e) => setConfig({ ...config, systemAlertsEnabled: e.target.checked })} />
                  <span>Enable System Dashboard Alert Broadcasts</span>
                </label>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="save-btn" style={{ background: '#4f46e5', padding: '12px 24px' }} disabled={saving}>
                  {saving ? "Saving Configuration..." : "Save System Settings"}
                </button>
              </div>
            </section>

          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default SystemConfig;
