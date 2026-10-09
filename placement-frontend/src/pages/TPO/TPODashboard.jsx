import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function TPODashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    tpoAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error loading TPO dashboard stats:", err));

    tpoAPI.getDrives()
      .then((res) => setDrives(res.data || []))
      .catch((err) => console.error("Error loading drives:", err));
  }, []);

  const totalStudents = stats?.totalStudents || 0;
  const placedStudents = stats?.selectedStudents || stats?.placedStudents || 0;
  const placementRate = stats?.placementRate || (totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : "0.0");

  return (
    <TPOLayout>
      <div className="tpo-page">

        {/* HEADER CONTROL CENTER BANNER */}
        <div className="company-heading" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <div>
            <span style={{ background: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Operations Control Center
            </span>
            <h1 style={{ color: '#ffffff', margin: '8px 0 4px 0' }}>Welcome, {user?.name || "Training & Placement Officer"}</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Centralized placement lifecycle management: monitor student applications, company drives, shortlist status & selection analytics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="create-drive-btn" style={{ background: '#2563eb' }} onClick={() => navigate('/tpo/drives')}>
              ➕ Post Drive
            </button>
            <button className="create-drive-btn" style={{ background: '#059669' }} onClick={() => navigate('/tpo/analytics')}>
              📈 View Analytics
            </button>
          </div>
        </div>

        {/* STATS GRID - 8 SUMMARY CARDS */}
        <div className="company-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>👨‍🎓</div>
            <div>
              <span>Total Students</span>
              <strong>{totalStudents}</strong>
              <p>Registered candidates</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>🏢</div>
            <div>
              <span>Registered Companies</span>
              <strong>{stats?.totalCompanies || 0}</strong>
              <p>Active recruiters</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📢</div>
            <div>
              <span>Active Placement Drives</span>
              <strong>{stats?.activeDrives || stats?.totalDrives || 0}</strong>
              <p>Live drive campaigns</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#fae8ff', color: '#c026d3' }}>📋</div>
            <div>
              <span>Total Applications</span>
              <strong>{stats?.totalApplications || 0}</strong>
              <p>Student submissions</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>⭐</div>
            <div>
              <span>Shortlisted Students</span>
              <strong>{stats?.shortlistedStudents || 0}</strong>
              <p>Next round qualified</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>📅</div>
            <div>
              <span>Scheduled Interviews</span>
              <strong>{stats?.scheduledInterviews || 0}</strong>
              <p>Interview rounds</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>🎉</div>
            <div>
              <span>Selected Students</span>
              <strong>{placedStudents}</strong>
              <p>Confirmed job offers</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>📊</div>
            <div>
              <span>Placement Rate</span>
              <strong>{placementRate}%</strong>
              <p>Selection efficiency</p>
            </div>
          </div>

        </div>

        {/* PLACEMENT ACTIVITY CONFLICT SCANNER ALERT */}
        <div style={{
          marginTop: '24px',
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fef2f2', margin: 0 }}>
                Placement Conflict Detector Engine Active
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#fecaca', margin: 0 }}>
              Automated calendar intelligence: detects overlapping interviews, coding tests, and campus drives with smart rescheduling.
            </p>
          </div>

          <button
            onClick={() => navigate('/tpo/conflicts')}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔍 Review Schedule Conflicts →
          </button>
        </div>

        {/* QUICK ACTIONS & RECENT DRIVES */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>

          {/* ACTIVE PLACEMENT DRIVES */}
          <section className="company-section">
            <div className="company-section-header">
              <div>
                <h2>Active Placement Drives</h2>
                <p>Real-time drive status & applicant tracking</p>
              </div>
              <button className="create-drive-btn" style={{ background: '#475569' }} onClick={() => navigate('/tpo/drives')}>
                View All Drives ({drives.length})
              </button>
            </div>

            <table className="drives-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>Role & Company</th>
                  <th style={{ padding: '12px' }}>Min CGPA</th>
                  <th style={{ padding: '12px' }}>CTC</th>
                  <th style={{ padding: '12px' }}>Applicants</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drives.slice(0, 5).map((drive) => (
                  <tr key={drive._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ display: 'block', color: '#1e293b' }}>{drive.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{drive.company?.companyName || 'Company'}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{drive.eligibility?.minCGPA || 0}+</td>
                    <td style={{ padding: '12px', color: '#059669', fontWeight: 600 }}>₹{(drive.salary / 100000).toFixed(1)} LPA</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {drive.applicantCount || 0} Applied
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: drive.status === 'upcoming' ? '#fef3c7' : drive.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                        color: drive.status === 'upcoming' ? '#d97706' : drive.status === 'ongoing' ? '#15803d' : '#64748b'
                      }}>
                        {drive.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {drives.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No placement drives found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* QUICK MANAGEMENT SHORTCUTS */}
          <section className="company-section">
            <div className="company-section-header">
              <h2>Operational Shortcuts</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/tpo/students')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                👨‍🎓 <span>Student Directory & Resume Search</span>
              </button>
              <button onClick={() => navigate('/tpo/companies')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🏢 <span>Recruiter Verification & Companies</span>
              </button>
              <button onClick={() => navigate('/tpo/applications')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📋 <span>Application & Shortlisting Monitor</span>
              </button>
              <button onClick={() => navigate('/tpo/analytics')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📈 <span>Department & Skill Gap Analytics</span>
              </button>
              <button onClick={() => navigate('/tpo/reports')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 <span>Export Reports (CSV / Print PDF)</span>
              </button>
              <button onClick={() => navigate('/tpo/notifications')} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔔 <span>TPO Notification Center</span>
              </button>
            </div>
          </section>

        </div>

      </div>
    </TPOLayout>
  );
}

export default TPODashboard;