import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    jobRole: "",
    jobType: "Full Time",
    salary: "",
    location: "",
    minCGPA: "6.5",
    departments: "CSE, ECE, IT",
    batches: "2025, 2026",
    registrationDeadline: "",
    driveDate: "",
    description: "",
    requirements: ""
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([tpoAPI.getDrives(), tpoAPI.getCompanies()])
      .then(([drivesRes, compRes]) => {
        setDrives(drivesRes.data || []);
        setCompanies(compRes.data || []);
      })
      .catch((err) => console.error("Error loading placement drives:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await tpoAPI.createDrive({
        title: formData.title,
        companyId: formData.companyId,
        jobRole: formData.jobRole || formData.title,
        jobType: formData.jobType,
        salary: Number(formData.salary),
        location: formData.location,
        eligibility: {
          minCGPA: Number(formData.minCGPA),
          departments: formData.departments.split(",").map(s => s.trim()).filter(Boolean),
          batches: formData.batches.split(",").map(s => s.trim()).filter(Boolean)
        },
        registrationDeadline: formData.registrationDeadline,
        driveDate: formData.driveDate,
        description: formData.description,
        requirements: formData.requirements.split(",").map(s => s.trim()).filter(Boolean)
      });

      setShowCreateModal(false);
      setFormData({ title: "", companyId: "", jobRole: "", jobType: "Full Time", salary: "", location: "", minCGPA: "6.5", departments: "CSE, ECE, IT", batches: "2025, 2026", registrationDeadline: "", driveDate: "", description: "", requirements: "" });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create placement drive.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (driveId, newStatus) => {
    try {
      await tpoAPI.toggleDriveStatus(driveId, newStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const filteredDrives = drives.filter((d) => {
    const title = d.title || "";
    const company = d.company?.companyName || "";
    const location = d.location || "";
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDrives = drives.length;
  const activeDrives = drives.filter(d => d.status === 'upcoming' || d.status === 'ongoing').length;
  const totalApplicants = drives.reduce((sum, d) => sum + (d.applicantCount || 0), 0);

  return (
    <TPOLayout>
      <div className="company-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Placement Drive Management</h1>
          <p>Monitor, publish, edit, and track company placement drives from announcement to final selection.</p>
        </div>
        <button className="create-drive-btn" style={{ background: '#2563eb', padding: '10px 18px', fontSize: '0.95rem' }} onClick={() => setShowCreateModal(true)}>
          ➕ Post New Drive
        </button>
      </div>

      {/* Stats */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Drives</span>
          <strong>{totalDrives}</strong>
          <p>Drive campaigns</p>
        </div>
        <div className="company-stat-card">
          <span>Active / Upcoming</span>
          <strong style={{ color: '#16a34a' }}>{activeDrives}</strong>
          <p>Open for applications</p>
        </div>
        <div className="company-stat-card">
          <span>Completed Drives</span>
          <strong>{totalDrives - activeDrives}</strong>
          <p>Finished recruitment</p>
        </div>
        <div className="company-stat-card">
          <span>Total Applicants</span>
          <strong style={{ color: '#2563eb' }}>{totalApplicants}</strong>
          <p>Student applications</p>
        </div>
      </div>

      {/* Drives Directory */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Placement Drives Roster</h2>
            <p>View drive status, minimum CGPA eligibility, compensation, and active applicants.</p>
          </div>
          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search drive title, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Drive Title & Company</th>
                <th>Eligibility Criteria</th>
                <th>Package (CTC)</th>
                <th>Location</th>
                <th>Applicants</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrives.map((d) => (
                <tr key={d._id}>
                  <td>
                    <div className="student-name">
                      <strong>{d.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.company?.companyName || 'Recruiter'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>Min {d.eligibility?.minCGPA || 0} CGPA</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{(d.eligibility?.departments || []).join(', ')}</span>
                  </td>
                  <td><strong style={{ color: '#059669' }}>₹{(d.salary / 100000).toFixed(1)} LPA</strong></td>
                  <td>{d.location || 'Multiple'}</td>
                  <td>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {d.applicantCount || 0} Applied
                    </span>
                  </td>
                  <td>{d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusToggle(d._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #cbd5e1' }}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedDrive(d)}>
                      View JD
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="no-students">Loading placement drives...</div>}
          {!loading && filteredDrives.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No placement drives found.
            </div>
          )}
        </div>
      </div>

      {/* CREATE DRIVE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Post New Placement Drive</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateDrive}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div className="form-group">
                  <label>Drive Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Software Engineer Hiring 2026" required />
                </div>
                <div className="form-group">
                  <label>Recruiter / Company</label>
                  <select value={formData.companyId} onChange={(e) => setFormData({ ...formData, companyId: e.target.value })} required>
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName || c.userId?.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Job Role</label>
                  <input type="text" value={formData.jobRole} onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })} placeholder="e.g. Full Stack Developer" required />
                </div>
                <div className="form-group">
                  <label>Salary Package (INR per Annum)</label>
                  <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. 900000" required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Hyderabad / Remote" required />
                </div>
                <div className="form-group">
                  <label>Minimum CGPA Required</label>
                  <input type="number" step="0.1" value={formData.minCGPA} onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Eligible Departments</label>
                  <input type="text" value={formData.departments} onChange={(e) => setFormData({ ...formData, departments: e.target.value })} placeholder="CSE, IT, ECE" required />
                </div>
                <div className="form-group">
                  <label>Eligible Batches</label>
                  <input type="text" value={formData.batches} onChange={(e) => setFormData({ ...formData, batches: e.target.value })} placeholder="2025, 2026" required />
                </div>
                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input type="date" value={formData.registrationDeadline} onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Drive Conduct Date</label>
                  <input type="date" value={formData.driveDate} onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Job Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Overview of role, responsibilities, and team..." required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Skill Requirements (comma separated)</label>
                  <input type="text" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder="Java, React, Data Structures, SQL" required />
                </div>
              </div>

              <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="save-btn" style={{ background: '#64748b' }}>Cancel</button>
                <button type="submit" className="save-btn" disabled={submitting}>
                  {submitting ? "Publishing Drive..." : "Publish Placement Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DRIVE DETAILS MODAL */}
      {selectedDrive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '650px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedDrive.title}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{selectedDrive.company?.companyName} • {selectedDrive.location}</p>
              </div>
              <button onClick={() => setSelectedDrive(null)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Compensation Package</span>
                <p style={{ margin: 0, fontWeight: 600, color: '#059669' }}>₹{(selectedDrive.salary / 100000).toFixed(1)} LPA</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Min CGPA Required</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedDrive.eligibility?.minCGPA || 0}+ CGPA</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Eligible Departments</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{(selectedDrive.eligibility?.departments || []).join(', ')}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Applicants</span>
                <p style={{ margin: 0, fontWeight: 600, color: '#2563eb' }}>{selectedDrive.applicantCount || 0} Candidates</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Job Description</h4>
              <p style={{ margin: 0, background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                {selectedDrive.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Required Skills</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(selectedDrive.requirements || []).map((req, idx) => (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedDrive(null)} className="save-btn" style={{ background: '#475569' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </TPOLayout>
  );
}

export default PlacementDrives;
