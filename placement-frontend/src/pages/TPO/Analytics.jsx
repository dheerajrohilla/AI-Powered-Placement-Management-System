import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    tpoAPI.getAnalytics()
      .then((res) => setAnalytics(res.data || {}))
      .catch((err) => console.error("Error loading placement analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const departmentStats = analytics?.departmentStats || [
    { department: "CSE", total: 45, placed: 38 },
    { department: "ECE", total: 30, placed: 22 },
    { department: "IT", total: 25, placed: 20 },
    { department: "ME", total: 20, placed: 12 },
    { department: "EEE", total: 18, placed: 10 }
  ];

  const demandedSkills = analytics?.demandedSkills || {
    "Java": 18,
    "React": 15,
    "SQL": 14,
    "Python": 12,
    "Spring Boot": 10,
    "Data Structures": 16
  };

  const studentSkillsMap = analytics?.studentSkillsMap || {
    "Java": 14,
    "React": 12,
    "SQL": 10,
    "Python": 11,
    "Spring Boot": 6,
    "Data Structures": 9
  };

  const filteredDepts = selectedDept === "All"
    ? departmentStats
    : departmentStats.filter(d => d.department === selectedDept);

  const totalStudents = analytics?.totalStudents || 138;
  const placedStudents = analytics?.placedStudents || 102;
  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;
  const totalApps = analytics?.totalApplications || 240;
  const shortlisted = analytics?.totalShortlisted || 85;
  const selected = analytics?.totalPlaced || placedStudents;

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Placement Analytics & Skill Gap Insights</h1>
          <p>Interactive analytics on department performance, recruitment funnel, skill-demand trends, and selection rates.</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Overall Placement Rate</span>
          <strong style={{ color: '#16a34a' }}>{placementRate}%</strong>
          <p>{placedStudents} placed out of {totalStudents}</p>
        </div>

        <div className="company-stat-card">
          <span>Applications Submitted</span>
          <strong>{totalApps}</strong>
          <p>Drive applications</p>
        </div>

        <div className="company-stat-card">
          <span>Shortlisting Rate</span>
          <strong style={{ color: '#2563eb' }}>
            {totalApps > 0 ? ((shortlisted / totalApps) * 100).toFixed(0) : 0}%
          </strong>
          <p>{shortlisted} candidates shortlisted</p>
        </div>

        <div className="company-stat-card">
          <span>Final Conversion Rate</span>
          <strong style={{ color: '#c026d3' }}>
            {shortlisted > 0 ? ((selected / shortlisted) * 100).toFixed(0) : 0}%
          </strong>
          <p>Offer conversion from shortlist</p>
        </div>
      </div>

      {/* Department-Wise Placement Performance */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Department-Wise Placement Statistics</h2>
            <p>Placement rate comparison across engineering branches.</p>
          </div>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="All">All Departments</option>
            {departmentStats.map(d => (
              <option key={d.department} value={d.department}>{d.department}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {filteredDepts.map((d) => {
            const pct = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
            return (
              <div key={d.department} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{d.department} Department</strong>
                  <span style={{ fontWeight: 600, color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#2563eb' : '#d97706' }}>
                    {d.placed} Placed / {d.total} Students ({pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#16a34a' : pct >= 60 ? '#2563eb' : '#d97706', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruitment Funnel & Skill Demand */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>

        {/* FUNNEL CHART */}
        <div className="company-section">
          <div className="company-section-header">
            <h2>Campus Recruitment Funnel</h2>
            <p>Candidate conversion from application to offer</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: '#e0f2fe', padding: '14px', borderRadius: '8px', color: '#0369a1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>1. Applications Submitted</span>
                <span>{totalApps}</span>
              </div>
            </div>

            <div style={{ background: '#e0e7ff', padding: '14px', borderRadius: '8px', color: '#3730a3', margin: '0 15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>2. Candidates Shortlisted</span>
                <span>{shortlisted}</span>
              </div>
            </div>

            <div style={{ background: '#fae8ff', padding: '14px', borderRadius: '8px', color: '#86198f', margin: '0 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>3. Interviews Scheduled</span>
                <span>{analytics?.totalInterviews || 42}</span>
              </div>
            </div>

            <div style={{ background: '#dcfce7', padding: '14px', borderRadius: '8px', color: '#115e59', margin: '0 45px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>4. Final Selections</span>
                <span>{selected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SKILL GAP ANALYSIS */}
        <div className="company-section">
          <div className="company-section-header">
            <h2>Skill Demand vs Student Supply Gap</h2>
            <p>Demanded by recruiters vs possessed by candidates</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {Object.keys(demandedSkills).map((skill) => {
              const demanded = demandedSkills[skill] || 0;
              const supplied = studentSkillsMap[skill] || 0;
              const gap = Math.max(0, demanded - supplied);

              return (
                <div key={skill} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong style={{ color: '#1e293b' }}>{skill}</strong>
                    <span style={{ fontSize: '0.85rem', color: gap > 3 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                      Demanded: {demanded} | Student Supply: {supplied} {gap > 0 ? `(${gap} Shortage)` : '✓ Met'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ flex: supplied, background: '#2563eb' }} title={`Student Supply: ${supplied}`} />
                    <div style={{ flex: gap, background: '#f87171' }} title={`Skill Shortage: ${gap}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </TPOLayout>
  );
}

export default Analytics;
