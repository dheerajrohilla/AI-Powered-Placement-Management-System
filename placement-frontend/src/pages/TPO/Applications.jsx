import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI, getAssetUrl } from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eligibilityFilter, setEligibilityFilter] = useState("All");

  const fetchApplications = (showLoading = false) => {
    if (showLoading) setLoading(true);
    tpoAPI.getApplications()
      .then((res) => setApplications(res.data || []))
      .catch((err) => console.error("Error loading applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications(false);
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await tpoAPI.updateApplicationStatus(appId, newStatus);
      fetchApplications(true);
    } catch {
      alert("Failed to update application status.");
    }
  };

  const filtered = applications.filter((app) => {
    const studentName = app.student?.userId?.name || "";
    const studentEmail = app.student?.userId?.email || "";
    const company = app.company?.companyName || "";
    const driveTitle = app.placementDrive?.title || "";

    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      driveTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesEligibility =
      eligibilityFilter === "All" ||
      (eligibilityFilter === "Eligible" && app.isEligible) ||
      (eligibilityFilter === "Ineligible" && !app.isEligible);

    return matchesSearch && matchesStatus && matchesEligibility;
  });

  const totalApps = applications.length;
  const shortlistedApps = applications.filter((a) => a.status === 'shortlisted').length;
  const selectedApps = applications.filter((a) => a.status === 'selected').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Application & Shortlisting Monitor</h1>
          <p>Monitor student applications across all placement drives, track AI resume matching scores & update recruitment stages.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Applications</span>
          <strong>{totalApps}</strong>
          <p>Submissions across drives</p>
        </div>
        <div className="company-stat-card">
          <span>Shortlisted</span>
          <strong style={{ color: '#2563eb' }}>{shortlistedApps}</strong>
          <p>Advanced to next round</p>
        </div>
        <div className="company-stat-card">
          <span>Final Selections</span>
          <strong style={{ color: '#16a34a' }}>{selectedApps}</strong>
          <p>Confirmed job offers</p>
        </div>
        <div className="company-stat-card">
          <span>Rejected</span>
          <strong style={{ color: '#dc2626' }}>{rejectedApps}</strong>
          <p>Not qualified</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Application Monitoring Table</h2>
            <p>Filter candidates by eligibility, match score, or drive status.</p>
          </div>
          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search candidate, company, drive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: '220px' }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={eligibilityFilter} onChange={(e) => setEligibilityFilter(e.target.value)}>
              <option value="All">All Eligibility</option>
              <option value="Eligible">Eligible Only</option>
              <option value="Ineligible">Ineligible Only</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Company & Placement Drive</th>
                <th>CGPA & Eligibility</th>
                <th>AI Resume Match</th>
                <th>Applied Date</th>
                <th>Current Status</th>
                <th>Update Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="student-name">
                      <strong>{app.student?.userId?.name || 'Student Candidate'}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Roll: {app.student?.rollNumber || 'N/A'} • {app.student?.department}</span>
                      {app.student?.resume && (
                        <a
                          href={getAssetUrl(app.student.resume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            color: '#2563eb',
                            fontWeight: 600,
                            marginTop: '2px',
                            textDecoration: 'none'
                          }}
                        >
                          📄 View Resume
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: '#1e293b' }}>{app.placementDrive?.title || 'Drive'}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.company?.companyName || 'Company'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{app.student?.cgpa || 0} CGPA</span>
                    <span style={{
                      display: 'inline-block',
                      marginLeft: '6px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: app.isEligible ? '#dcfce7' : '#fee2e2',
                      color: app.isEligible ? '#15803d' : '#b91c1c'
                    }}>
                      {app.isEligible ? 'Eligible' : 'Min CGPA Unmet'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${app.aiMatchScore}%`, background: app.aiMatchScore >= 80 ? '#16a34a' : app.aiMatchScore >= 60 ? '#2563eb' : '#d97706', height: '100%' }} />
                      </div>
                      <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{app.aiMatchScore}%</strong>
                    </div>
                  </td>
                  <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${app.status === 'selected' ? 'placed' : app.status === 'shortlisted' ? 'placed' : app.status === 'rejected' ? 'unplaced' : ''}`} style={{
                      background: app.status === 'shortlisted' ? '#e0f2fe' : undefined,
                      color: app.status === 'shortlisted' ? '#0369a1' : undefined
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #cbd5e1' }}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected / Placed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="no-students">Loading applications...</div>}
          {!loading && filtered.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No applications match the criteria.
            </div>
          )}
        </div>
      </div>
    </TPOLayout>
  );
}

export default Applications;
