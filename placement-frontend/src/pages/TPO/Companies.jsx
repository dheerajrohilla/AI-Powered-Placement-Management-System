import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const fetchCompanies = () => {
    tpoAPI.getCompanies()
      .then((res) => setCompanies(res.data || []))
      .catch((err) => console.error("Error loading TPO companies:", err));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerifyToggle = async (companyId, currentStatus) => {
    setLoadingId(companyId);
    try {
      await tpoAPI.verifyCompany(companyId, !currentStatus);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update company verification.");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const name = c.companyName || c.userId?.name || "";
    const industry = c.industry || "";
    const location = c.location || "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      industry.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Verified" && c.isVerified) ||
      (statusFilter === "Pending" && !c.isVerified);

    return matchesSearch && matchesStatus;
  });

  const totalCompanies = companies.length;
  const verifiedCompanies = companies.filter((c) => c.isVerified).length;
  const pendingCompanies = totalCompanies - verifiedCompanies;

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Registered Recruiters & Companies</h1>
          <p>Monitor participating company profiles, Job Descriptions, and update recruiter verification status.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Companies</span>
          <strong>{totalCompanies}</strong>
          <p>Registered recruiters</p>
        </div>

        <div className="company-stat-card">
          <span>Verified Companies</span>
          <strong style={{ color: '#16a34a' }}>{verifiedCompanies}</strong>
          <p>Approved partners</p>
        </div>

        <div className="company-stat-card">
          <span>Pending Verification</span>
          <strong style={{ color: '#d97706' }}>{pendingCompanies}</strong>
          <p>Requires approval</p>
        </div>

        <div className="company-stat-card">
          <span>Verification Rate</span>
          <strong style={{ color: '#2563eb' }}>{totalCompanies > 0 ? ((verifiedCompanies / totalCompanies) * 100).toFixed(0) : 0}%</strong>
          <p>Approval ratio</p>
        </div>
      </div>

      {/* Company List */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Company Directory</h2>
            <p>Approve or manage recruiter accounts and view recruitment activities.</p>
          </div>

          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search company or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Companies</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Company & HR</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Drives Conducted</th>
                <th>Applications</th>
                <th>Selections</th>
                <th>Verification Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="student-name">
                      <strong>{c.companyName || c.userId?.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>HR: {c.hrName || 'Contact'} ({c.hrEmail || c.userId?.email})</span>
                    </div>
                  </td>
                  <td>{c.industry || 'IT & Software'}</td>
                  <td>{c.location || 'Multiple'}</td>
                  <td><strong style={{ color: '#2563eb' }}>{c.drivesCount || 0} Drives</strong></td>
                  <td><span>{c.applicantsCount || 0} Submissions</span></td>
                  <td><strong style={{ color: '#16a34a' }}>{c.selectionsCount || 0} Offers</strong></td>
                  <td>
                    <span className={c.isVerified ? "status-badge placed" : "status-badge unplaced"}>
                      {c.isVerified ? "Verified" : "Pending Approval"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="save-btn"
                        style={{ padding: '4px 10px', fontSize: '0.8rem', background: c.isVerified ? '#dc2626' : '#16a34a' }}
                        disabled={loadingId === c._id}
                        onClick={() => handleVerifyToggle(c._id, c.isVerified)}
                      >
                        {loadingId === c._id ? "..." : (c.isVerified ? "Unverify" : "Verify")}
                      </button>
                      <button className="view-btn" onClick={() => setSelectedCompany(c)}>
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCompanies.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No companies found matching criteria.
            </div>
          )}
        </div>
      </div>

      {/* COMPANY DETAIL MODAL */}
      {selectedCompany && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '650px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedCompany.companyName}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{selectedCompany.industry} • {selectedCompany.location}</p>
              </div>
              <button onClick={() => setSelectedCompany(null)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>HR Representative</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedCompany.hrName || 'N/A'}</p>
                <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{selectedCompany.hrEmail}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Company Website</span>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedCompany.website ? (
                    <a href={selectedCompany.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{selectedCompany.website}</a>
                  ) : 'Not specified'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Company Overview</h4>
              <p style={{ margin: 0, background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                {selectedCompany.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', background: '#e0f2fe', padding: '12px', borderRadius: '8px', color: '#0369a1', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>📢 Total Drives: {selectedCompany.drivesCount || 0}</span>
              <span>📋 Total Applicants: {selectedCompany.applicantsCount || 0}</span>
              <span>🎉 Total Offers: {selectedCompany.selectionsCount || 0}</span>
            </div>

            <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedCompany(null)} className="save-btn" style={{ background: '#475569' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </TPOLayout>
  );
}

export default Companies;