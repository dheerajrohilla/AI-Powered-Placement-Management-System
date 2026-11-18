import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { adminAPI } from "../../services/api";

function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getRolesPermissions()
      .then((res) => setRoles(res.data || []))
      .catch((err) => console.error("Error loading roles & permissions:", err))
      .finally(() => setLoading(false));
  }, []);

  const modulesList = [
    { name: "Student Dashboard & Profile", rolesAllowed: ["Student", "Admin"] },
    { name: "Apply to Placement Drives", rolesAllowed: ["Student"] },
    { name: "Upload & AI Resume Score", rolesAllowed: ["Student"] },
    { name: "Company Recruiter Dashboard", rolesAllowed: ["Company", "Admin"] },
    { name: "Post Placement Drives", rolesAllowed: ["Company", "TPO", "Admin"] },
    { name: "Shortlist & Select Candidates", rolesAllowed: ["Company", "TPO"] },
    { name: "Schedule Candidate Interviews", rolesAllowed: ["Company", "TPO"] },
    { name: "TPO Operations Control Center", rolesAllowed: ["TPO", "Admin"] },
    { name: "Candidate Directory & Extracted Resume View", rolesAllowed: ["TPO", "Admin"] },
    { name: "Application & Eligibility Monitoring", rolesAllowed: ["TPO", "Admin"] },
    { name: "Placement Analytics & Skill Gap Reports", rolesAllowed: ["TPO", "Admin"] },
    { name: "User Account CRUD Management", rolesAllowed: ["Admin"] },
    { name: "Role & Permission Control Matrix", rolesAllowed: ["Admin"] },
    { name: "System & College Settings Configuration", rolesAllowed: ["Admin"] },
    { name: "Platform Monitoring & Audit Logs", rolesAllowed: ["Admin"] }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <p>Loading roles and permissions...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="company-heading">
        <div>
          <h1>Role & Permission Management</h1>
          <p>Define role-based access control (RBAC) rules and module permission matrices across the system.</p>
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="company-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {roles.map((r) => (
          <div key={r.key} className="company-stat-card">
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#4f46e5' }}>{r.role}</h3>
            <p style={{ margin: '4px 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>Role Code: <code>{r.key}</code></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(r.permissions || []).map((perm, idx) => (
                <span key={idx} style={{ fontSize: '0.8rem', color: '#334155', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Module Access Matrix */}
      <div className="company-section" style={{ marginTop: '24px' }}>
        <div className="company-section-header">
          <h2>Module Permission Control Matrix</h2>
          <p>Enforced JWT role authentication boundaries across frontend routes & backend APIs</p>
        </div>

        <table className="student-table" style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>System Module / Feature Access</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Student</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Company</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>TPO Officer</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Administrator</th>
            </tr>
          </thead>
          <tbody>
            {modulesList.map((m, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{m.name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {m.rolesAllowed.includes("Student") ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Allowed</span> : <span style={{ color: '#cbd5e1' }}>— Access Denied</span>}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {m.rolesAllowed.includes("Company") ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Allowed</span> : <span style={{ color: '#cbd5e1' }}>— Access Denied</span>}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {m.rolesAllowed.includes("TPO") ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Allowed</span> : <span style={{ color: '#cbd5e1' }}>— Access Denied</span>}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {m.rolesAllowed.includes("Admin") ? <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>✓ Full Access</span> : <span style={{ color: '#cbd5e1' }}>— Access Denied</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default RolesPermissions;
