import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function Monitoring() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  useEffect(() => {
    adminAPI.getMonitoring()
      .then((res) => setLogs(res.data || []))
      .catch((err) => console.error("Error loading audit logs:", err))
      .finally(() => setLoading(false));
  }, []);

  const modules = ["All", ...new Set(logs.map(l => l.module).filter(Boolean))];

  const filteredLogs = logs.filter((l) => {
    const user = l.userName || "";
    const action = l.action || "";
    const details = l.details || "";
    const matchesSearch =
      user.toLowerCase().includes(search.toLowerCase()) ||
      action.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === "All" || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <AdminLayout>
      <div className="company-heading">
        <div>
          <h1>Platform Monitoring & Audit Logs</h1>
          <p>Real-time system event monitor, user activity logs, and security audit trail.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Audit Events</span>
          <strong>{logs.length}</strong>
          <p>Recorded actions</p>
        </div>
        <div className="company-stat-card">
          <span>Success Events</span>
          <strong style={{ color: '#16a34a' }}>{logs.filter(l => l.status === 'success').length}</strong>
          <p>Normal operations</p>
        </div>
        <div className="company-stat-card">
          <span>System Alerts</span>
          <strong style={{ color: '#dc2626' }}>{logs.filter(l => l.status !== 'success').length}</strong>
          <p>Warning / Failures</p>
        </div>
        <div className="company-stat-card">
          <span>Active Modules</span>
          <strong style={{ color: '#4f46e5' }}>{modules.length - 1}</strong>
          <p>Logged services</p>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Audit Log Roster</h2>
            <p>Track who performed what action across system modules with timestamps.</p>
          </div>
          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search user, action, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="All">All Modules</option>
              {modules.filter(m => m !== "All").map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>User Candidate</th>
                <th>Role</th>
                <th>Action & Module</th>
                <th>Event Details</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <strong style={{ color: '#1e293b' }}>{log.userName || 'System'}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: log.userRole === 'admin' ? '#e0e7ff' : log.userRole === 'tpo' ? '#fae8ff' : '#f1f5f9',
                      color: log.userRole === 'admin' ? '#4338ca' : log.userRole === 'tpo' ? '#c026d3' : '#475569'
                    }}>
                      {log.userRole || 'System'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{log.action}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Module: {log.module}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{log.details || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={log.status === 'success' ? "status-badge placed" : "status-badge unplaced"}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="no-students">Loading audit logs...</div>}
          {!loading && filteredLogs.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No audit logs found matching filter.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Monitoring;
