import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setData(res.data || {}))
      .catch((err) => console.error("Error loading Admin analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const roleCounts = data?.userRoleCounts || [
    { _id: 'student', count: 120 },
    { _id: 'company', count: 15 },
    { _id: 'tpo', count: 2 },
    { _id: 'admin', count: 1 }
  ];

  const totalUsers = roleCounts.reduce((sum, r) => sum + r.count, 0);

  return (
    <AdminLayout>
      <div className="company-heading">
        <div>
          <h1>Platform Usage & System Statistics</h1>
          <p>High-level platform adoption metrics, user role distribution, and system performance overview.</p>
        </div>
      </div>

      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Registered Accounts</span>
          <strong style={{ color: '#4f46e5' }}>{totalUsers}</strong>
          <p>Platform user accounts</p>
        </div>
        <div className="company-stat-card">
          <span>Active Placement Drives</span>
          <strong>{data?.activeDrives || 0}</strong>
          <p>Campaigns live</p>
        </div>
        <div className="company-stat-card">
          <span>Total Application Submissions</span>
          <strong style={{ color: '#2563eb' }}>{data?.totalApps || 0}</strong>
          <p>Student drive applications</p>
        </div>
        <div className="company-stat-card">
          <span>System Audit Events</span>
          <strong style={{ color: '#059669' }}>{data?.totalLogs || 0}</strong>
          <p>Logged activity events</p>
        </div>
      </div>

      <div className="company-section" style={{ marginTop: '24px' }}>
        <h2>User Role Distribution</h2>
        <p className="report-subtitle">Breakdown of active platform accounts by system role</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          {roleCounts.map((r) => {
            const pct = totalUsers > 0 ? Math.round((r.count / totalUsers) * 100) : 0;
            return (
              <div key={r._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{r._id} Accounts</span>
                <h3 style={{ margin: '8px 0', fontSize: '1.6rem', color: '#1e293b' }}>{r.count} <small style={{ fontSize: '0.9rem', color: '#64748b' }}>({pct}%)</small></h3>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: r._id === 'student' ? '#2563eb' : r._id === 'company' ? '#16a34a' : r._id === 'tpo' ? '#c026d3' : '#4f46e5' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
