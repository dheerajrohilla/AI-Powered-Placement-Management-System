import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    tpoAPI.getInterviews()
      .then((res) => setInterviews(res.data || []))
      .catch((err) => console.error("Error loading interviews:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredInterviews = interviews.filter((i) => {
    const studentName = i.student?.userId?.name || "";
    const company = i.company?.companyName || "";
    const driveTitle = i.placementDrive?.title || "";
    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      driveTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInterviews = interviews.length;
  const scheduledCount = interviews.filter((i) => i.status === 'scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Recruitment Interview Schedule</h1>
          <p>Monitor interview schedules, technical/HR rounds, interviewer details, and interview feedback.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Interviews</span>
          <strong>{totalInterviews}</strong>
          <p>All interview rounds</p>
        </div>
        <div className="company-stat-card">
          <span>Upcoming / Scheduled</span>
          <strong style={{ color: '#2563eb' }}>{scheduledCount}</strong>
          <p>Active schedules</p>
        </div>
        <div className="company-stat-card">
          <span>Completed</span>
          <strong style={{ color: '#16a34a' }}>{completedCount}</strong>
          <p>Evaluated rounds</p>
        </div>
        <div className="company-stat-card">
          <span>Completion Rate</span>
          <strong style={{ color: '#059669' }}>{totalInterviews > 0 ? ((completedCount / totalInterviews) * 100).toFixed(0) : 0}%</strong>
          <p>Evaluation ratio</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Interview Schedule Roster</h2>
            <p>Track candidate interview time, round type, and interviewer contacts.</p>
          </div>
          <div className="student-filters" style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search candidate, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Student Candidate</th>
                <th>Company & Drive</th>
                <th>Round Type</th>
                <th>Scheduled Date & Time</th>
                <th>Interviewer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((i) => (
                <tr key={i._id}>
                  <td>
                    <div className="student-name">
                      <strong>{i.student?.userId?.name || 'Student Candidate'}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{i.student?.userId?.email}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: '#1e293b' }}>{i.placementDrive?.title || 'Drive'}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{i.company?.companyName || 'Company'}</span>
                  </td>
                  <td>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {i.round || 'Technical'} Round
                    </span>
                  </td>
                  <td>
                    <strong style={{ display: 'block' }}>{i.scheduledDate ? new Date(i.scheduledDate).toLocaleDateString() : 'N/A'}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{i.scheduledDate ? new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </td>
                  <td>
                    <span>{i.interviewer || 'HR Team'}</span>
                    {i.interviewerEmail && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{i.interviewerEmail}</span>}
                  </td>
                  <td>
                    <span className={`status-badge ${i.status === 'completed' ? 'placed' : i.status === 'scheduled' ? 'active' : 'unplaced'}`}>
                      {i.status}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedInterview(i)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="no-students">Loading interviews...</div>}
          {!loading && filteredInterviews.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No interview records found.
            </div>
          )}
        </div>
      </div>

      {/* INTERVIEW DETAIL MODAL */}
      {selectedInterview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedInterview.placementDrive?.title}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{selectedInterview.company?.companyName} • {selectedInterview.round} Round</p>
              </div>
              <button onClick={() => setSelectedInterview(null)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Candidate Name</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedInterview.student?.userId?.name}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Scheduled Date & Time</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{new Date(selectedInterview.scheduledDate).toLocaleString()}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Location / Venue</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedInterview.location || 'Online'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Interviewer Contact</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedInterview.interviewer || 'HR Team'}</p>
              </div>
            </div>

            {selectedInterview.joinLink && (
              <div style={{ marginBottom: '16px', background: '#e0f2fe', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>🔗 Virtual Interview Join Link:</span>
                <a href={selectedInterview.joinLink} target="_blank" rel="noreferrer" style={{ display: 'block', wordBreak: 'break-all', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                  {selectedInterview.joinLink}
                </a>
              </div>
            )}

            {selectedInterview.feedback && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Interviewer Feedback & Notes</h4>
                <p style={{ margin: 0, background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                  {selectedInterview.feedback}
                </p>
              </div>
            )}

            <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedInterview(null)} className="save-btn" style={{ background: '#475569' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </TPOLayout>
  );
}

export default Interviews;
