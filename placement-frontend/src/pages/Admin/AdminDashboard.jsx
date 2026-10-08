import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error loading Admin dashboard stats:", err));
  }, []);

  return (
    <AdminLayout>
      <div className="tpo-page">

        {/* ADMIN HEADER BANNER */}
        <div className="company-heading" style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', color: '#ffffff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <div>
            <span style={{ background: '#6366f1', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Platform System Governance
            </span>
            <h1 style={{ color: '#ffffff', margin: '8px 0 4px 0' }}>Welcome, {user?.name || "System Administrator"}</h1>
            <p style={{ color: '#c7d2fe', margin: 0 }}>
              System Administration Control Center: manage user accounts, roles & permissions, platform configuration, and security audit logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="create-drive-btn" style={{ background: '#4f46e5' }} onClick={() => navigate('/admin/users')}>
              👥 Manage Users
            </button>
            <button className="create-drive-btn" style={{ background: '#059669' }} onClick={() => navigate('/admin/configuration')}>
              ⚙️ System Config
            </button>
          </div>
        </div>

        {/* SYSTEM OVERVIEW CARDS */}
        <div className="company-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>👥</div>
            <div>
              <span>Total System Users</span>
              <strong>{stats?.totalUsers || 0}</strong>
              <p>Platform accounts</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>👨‍🎓</div>
            <div>
              <span>Students</span>
              <strong>{stats?.totalStudents || 0}</strong>
              <p>Registered candidates</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>🏢</div>
            <div>
              <span>Companies</span>
              <strong>{stats?.totalCompanies || 0}</strong>
              <p>Verified recruiters</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#fae8ff', color: '#a21caf' }}>👔</div>
            <div>
              <span>TPO Officers</span>
              <strong>{stats?.totalTPO || 1}</strong>
              <p>Placement staff</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>📢</div>
            <div>
              <span>Placement Drives</span>
              <strong>{stats?.totalDrives || 0}</strong>
              <p>{stats?.activeDrives || 0} active drives</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>🎯</div>
            <div>
              <span>Total Selections</span>
              <strong>{stats?.placedStudents || 0}</strong>
              <p>Placed students</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#ffedd5', color: '#c2410c' }}>📋</div>
            <div>
              <span>Applications</span>
              <strong>{stats?.totalApplications || 0}</strong>
              <p>Submissions count</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#f1f5f9', color: '#334155' }}>⚡</div>
            <div>
              <span>System Health</span>
              <strong style={{ color: '#16a34a' }}>99.9%</strong>
              <p>Services online</p>
            </div>
          </div>

        </div>

        {/* RECENT SYSTEM LOGS & QUICK ADMIN ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>

          {/* AUDIT LOG TIMELINE */}
          <section className="company-section">
            <div className="company-section-header">
              <div>
                <h2>Recent System Audit Logs</h2>
                <p>Track security actions, user registrations, and system events</p>
              </div>
              <button className="create-drive-btn" style={{ background: '#475569' }} onClick={() => navigate('/admin/monitoring')}>
                Full Audit Trail
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(stats?.recentLogs || []).map((log) => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{log.action}</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      By {log.userName} ({log.userRole}) • {log.module}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: log.status === 'success' ? '#dcfce7' : '#fee2e2',
                      color: log.status === 'success' ? '#15803d' : '#b91c1c'
                    }}>
                      {log.status}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No system logs recorded yet.</p>
              )}
            </div>
          </section>

          {/* ADMIN SHORTCUTS */}
          <section className="company-section">
            <div className="company-section-header">
              <h2>Platform Administration</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/admin/users')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                👥 <span>User Accounts & CRUD</span>
              </button>
              <button onClick={() => navigate('/admin/roles-permissions')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔐 <span>Roles & Permissions Matrix</span>
              </button>
              <button onClick={() => navigate('/admin/configuration')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⚙️ <span>System & College Config</span>
              </button>
              <button onClick={() => navigate('/admin/monitoring')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🖥️ <span>Platform Audit & Event Logs</span>
              </button>
              <button onClick={() => navigate('/admin/analytics')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 <span>Platform Usage Analytics</span>
              </button>
              <button onClick={() => navigate('/admin/notifications')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔔 <span>Admin Alerts & System Notices</span>
              </button>
            </div>
          </section>

        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;