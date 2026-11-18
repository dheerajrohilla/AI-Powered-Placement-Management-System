import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function SystemConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Email diagnostics & testing state
  const [emailDiag, setEmailDiag] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testEmailInput, setTestEmailInput] = useState("");

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

  const loadEmailData = async () => {
    try {
      const [diagRes, logsRes] = await Promise.allSettled([
        adminAPI.getEmailDiagnostics(),
        adminAPI.getEmailLogs(25)
      ]);
      if (diagRes.status === "fulfilled" && diagRes.value?.data) {
        setEmailDiag(diagRes.value.data);
      }
      if (logsRes.status === "fulfilled" && logsRes.value?.data) {
        setEmailLogs(logsRes.value.data);
      }
    } catch (err) {
      console.warn("Could not load email diagnostics:", err);
    }
  };

  useEffect(() => {
    Promise.all([
      adminAPI.getSystemConfig().then((res) => {
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
      }),
      loadEmailData()
    ])
      .catch((err) => console.error("Error loading system config:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleVerifyConnection = async () => {
    setTestingConnection(true);
    setVerifyResult(null);
    try {
      const res = await adminAPI.verifyEmailConnection();
      setVerifyResult({
        success: res.data.success,
        message: res.data.message || (res.data.success ? "Connection successfully verified!" : "Verification failed.")
      });
      loadEmailData();
    } catch (err) {
      setVerifyResult({
        success: false,
        message: err.response?.data?.error || err.message || "Failed to reach email server."
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await adminAPI.sendTestEmail(testEmailInput.trim() || undefined);
      setTestResult({
        success: res.data.success,
        message: res.data.success
          ? `✓ Test email dispatched successfully to ${res.data.recipient}! (${res.data.durationMs}ms)`
          : `❌ Failed: ${res.data.error || "Provider rejected delivery."}`
      });
      loadEmailData();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || err.message || "Test dispatch failed."
      });
    } finally {
      setSendingTest(false);
    }
  };

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
      setMessage("System configuration updated successfully!");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading System Configuration...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-header" style={{ marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>System Configuration & Operations</h1>
            <p style={{ color: "#64748b" }}>Manage institution profile, centralized email service, placement policies, and notification systems.</p>
          </div>
        </div>

        {message && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', fontWeight: 500 }}>
            ✓ {message}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', fontWeight: 500 }}>
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            
            {/* INSTITUTION METADATA */}
            <section className="profile-card">
              <h2>Institution & Academic Profile</h2>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Institution / College Name</label>
                <input type="text" value={config.collegeName} onChange={(e) => setConfig({ ...config, collegeName: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Institution Code</label>
                <input type="text" value={config.collegeCode} onChange={(e) => setConfig({ ...config, collegeCode: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Campus Address</label>
                <input type="text" value={config.address} onChange={(e) => setConfig({ ...config, address: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Official Placement Contact Email</label>
                <input type="email" value={config.contactEmail} onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Active Academic Year</label>
                <input type="text" value={config.academicYear} onChange={(e) => setConfig({ ...config, academicYear: e.target.value })} required />
              </div>
            </section>

            {/* PLACEMENT & ELIGIBILITY RULES */}
            <section className="profile-card">
              <h2>Placement Policies & Eligibility Thresholds</h2>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Default Minimum CGPA Threshold</label>
                <input type="number" step="0.1" value={config.minCgpaDefault} onChange={(e) => setConfig({ ...config, minCgpaDefault: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Auto-Shortlist CGPA Cutoff</label>
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

            {/* SYSTEM PREFERENCES */}
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

        {/* ===================================================================== */}
        {/* CENTRALIZED EMAIL NOTIFICATION HUB & DIAGNOSTICS */}
        {/* ===================================================================== */}
        <div style={{ marginTop: '36px' }}>
          <section className="profile-card" style={{ padding: '28px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📧</span>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    Centralized Email Notification System
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Application-wide transactional email service. Individual users never configure credentials.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: emailDiag?.isConfigured ? '#ecfdf5' : '#fef3c7',
                  color: emailDiag?.isConfigured ? '#047857' : '#b45309',
                  border: `1px solid ${emailDiag?.isConfigured ? '#a7f3d0' : '#fde68a'}`
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: emailDiag?.isConfigured ? '#10b981' : '#f59e0b' }}></span>
                  {emailDiag?.isConfigured ? 'SMTP Live / Authenticated' : 'Simulation Mode Active'}
                </span>

                <button
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={testingConnection}
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: testingConnection ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {testingConnection ? 'Testing Handshake...' : '⚡ Verify Connection'}
                </button>
              </div>
            </div>

            {/* Verification Alert Banner */}
            {verifyResult && (
              <div style={{
                background: verifyResult.success ? '#ecfdf5' : '#fef2f2',
                color: verifyResult.success ? '#065f46' : '#991b1b',
                border: `1px solid ${verifyResult.success ? '#a7f3d0' : '#fecaca'}`,
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {verifyResult.success ? '✓ ' : '⚠ '} {verifyResult.message}
              </div>
            )}

            {/* SYSTEM CONFIGURATION CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>Provider Service</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {emailDiag?.provider || 'Gmail'}
                </p>
                <small style={{ color: '#64748b' }}>Configured via .env</small>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>Sender Identity</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>
                  {emailDiag?.fromAddress || 'placements@university.edu'}
                </p>
                <small style={{ color: '#64748b' }}>Account: {emailDiag?.userMasked || 'Unconfigured'}</small>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>Delivery Rate</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                  {emailDiag?.stats?.successRate || '100%'}
                </p>
                <small style={{ color: '#64748b' }}>
                  Sent: {emailDiag?.stats?.sent || 0} | Sim: {emailDiag?.stats?.simulated || 0} | Failed: {emailDiag?.stats?.failed || 0}
                </small>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>Policy & Retries</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {emailDiag?.maxRetries || 3} Attempts
                </p>
                <small style={{ color: '#64748b' }}>Timeout: {((emailDiag?.timeoutMs || 10000) / 1000)}s with backoff</small>
              </div>
            </div>

            {/* SEND TEST EMAIL MECHANISM */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1e3a8a' }}>
                  Authorized Email Delivery Test Tool
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6' }}>
                  Manually trigger a real end-to-end verification email to confirm inbox delivery without affecting production student records.
                </p>
              </div>

              <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="email"
                  placeholder="Target test email (leave blank to send to your admin address)"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  style={{
                    flex: '1 1 320px',
                    padding: '10px 14px',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#ffffff'
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingTest}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: sendingTest ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  {sendingTest ? 'Sending Test Email...' : 'Send Verification Email 🚀'}
                </button>
              </form>

              {testResult && (
                <div style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: testResult.success ? '#ecfdf5' : '#fef2f2',
                  color: testResult.success ? '#047857' : '#dc2626'
                }}>
                  {testResult.message}
                </div>
              )}
            </div>

            {/* RECENT OUTBOX LOG TABLE */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Recent Outbox & Dispatch Activity Log
                </h3>
                <button
                  type="button"
                  onClick={loadEmailData}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  🔄 Refresh Log
                </button>
              </div>

              {emailLogs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '14px' }}>
                  No transactional email logs recorded yet. Emails sent for password resets, applications, or tests will appear here.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Recipient</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Event Type</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Subject</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Attempts</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLogs.map((log) => {
                        const statusColors = {
                          sent: { bg: '#ecfdf5', text: '#047857' },
                          simulated: { bg: '#eff6ff', text: '#1d4ed8' },
                          queued: { bg: '#fef3c7', text: '#b45309' },
                          failed: { bg: '#fef2f2', text: '#b91c1c' }
                        };
                        const color = statusColors[log.status] || { bg: '#f1f5f9', text: '#475569' };

                        return (
                          <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                              {log.recipient}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                                {log.eventType}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.subject}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                background: color.bg,
                                color: color.text,
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                {log.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>
                              {log.attempts || 1}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </section>
        </div>

      </div>
    </AdminLayout>
  );
}

export default SystemConfig;
