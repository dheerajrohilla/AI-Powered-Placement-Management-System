import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI, getAssetUrl } from "../../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minCgpaFilter, setMinCgpaFilter] = useState("0");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    tpoAPI.getStudents()
      .then((res) => setStudents(res.data || []))
      .catch((err) => console.error("Error loading TPO students:", err));
  }, []);

  const departments = ["All", ...new Set(students.map(s => s.department).filter(Boolean))];

  const filteredStudents = students.filter((s) => {
    const name = s.userId?.name || "";
    const email = s.userId?.email || "";
    const roll = s.rollNumber || "";
    const skills = (s.skills || []).join(" ");
    
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      roll.toLowerCase().includes(search.toLowerCase()) ||
      skills.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === "All" || s.department === deptFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Placed" && s.isPlaced) ||
      (statusFilter === "Unplaced" && !s.isPlaced);

    const matchesCgpa = Number(s.cgpa || 0) >= Number(minCgpaFilter);

    return matchesSearch && matchesDept && matchesStatus && matchesCgpa;
  });

  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.isPlaced).length;
  const unplacedStudents = students.filter((s) => !s.isPlaced).length;
  const averageCGPA = totalStudents > 0
    ? students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) / totalStudents
    : 0;

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Registered Students Directory</h1>
          <p>Search, filter, monitor placement progress, and view extracted student resumes & profiles.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="company-stats">
        <div className="company-stat-card">
          <span>Total Students</span>
          <strong>{totalStudents}</strong>
          <p>Registered candidates</p>
        </div>

        <div className="company-stat-card">
          <span>Placed Students</span>
          <strong style={{ color: '#16a34a' }}>{placedStudents}</strong>
          <p>Offers secured</p>
        </div>

        <div className="company-stat-card">
          <span>Unplaced Students</span>
          <strong style={{ color: '#dc2626' }}>{unplacedStudents}</strong>
          <p>Seeking placement</p>
        </div>

        <div className="company-stat-card">
          <span>Average CGPA</span>
          <strong style={{ color: '#2563eb' }}>{averageCGPA.toFixed(2)}</strong>
          <p>Academic average</p>
        </div>
      </div>

      {/* Student List */}
      <div className="company-section">
        <div className="student-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h2>Candidate Roster</h2>
              <p>Filter by department, CGPA threshold, placement status, or skill keywords.</p>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Showing {filteredStudents.length} of {totalStudents} students
            </span>
          </div>

          <div className="student-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search name, roll, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 2, minWidth: '220px' }}
            />

            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.filter(d => d !== "All").map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Placed">Placed Only</option>
              <option value="Unplaced">Unplaced Only</option>
            </select>

            <select value={minCgpaFilter} onChange={(e) => setMinCgpaFilter(e.target.value)}>
              <option value="0">All CGPA</option>
              <option value="6.0">Min 6.0 CGPA</option>
              <option value="7.0">Min 7.0 CGPA</option>
              <option value="7.5">Min 7.5 CGPA</option>
              <option value="8.0">Min 8.0 CGPA</option>
              <option value="8.5">Min 8.5 CGPA</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Student & Roll</th>
                <th>Department</th>
                <th>Batch</th>
                <th>CGPA</th>
                <th>ATS Score</th>
                <th>Status</th>
                <th>Company Offer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>
                    <div className="student-name">
                      <strong>{student.userId?.name || 'Student Candidate'}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Roll: {student.rollNumber || 'N/A'} • {student.userId?.email}</span>
                    </div>
                  </td>
                  <td>{student.department || 'N/A'}</td>
                  <td>{student.batch || 'N/A'}</td>
                  <td><strong style={{ color: '#0f172a' }}>{student.cgpa != null ? student.cgpa : 'N/A'}</strong></td>
                  <td>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {student.atsScore || 80}% ATS
                    </span>
                  </td>
                  <td>
                    <span className={student.isPlaced ? "status-badge placed" : "status-badge unplaced"}>
                      {student.isPlaced ? "Placed" : "Unplaced"}
                    </span>
                  </td>
                  <td>
                    {student.isPlaced ? (
                      <div>
                        <strong style={{ color: '#16a34a', display: 'block' }}>{student.placedCompany?.companyName || 'Recruiter'}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{((student.salary || 800000) / 100000).toFixed(1)} LPA</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedStudent(student)}>
                      🔍 Detailed Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="no-students" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No students matched the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* STUDENT PROFILE DETAIL MODAL */}
      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedStudent.userId?.name}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Roll No: {selectedStudent.rollNumber} • {selectedStudent.department} ({selectedStudent.batch})</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Contact Email</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedStudent.userId?.email}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>CGPA & ATS Score</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedStudent.cgpa} CGPA (ATS Match: {selectedStudent.atsScore || 85}%)</p>
              </div>
            </div>

            {selectedStudent.bio && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Bio / Summary</h4>
                <p style={{ margin: 0, background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>{selectedStudent.bio}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Technical Skills</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(selectedStudent.skills || []).map((skill, idx) => (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Key Projects</h4>
                {selectedStudent.projects.map((p, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{p.title}</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>{p.description}</p>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb' }}>🔗 Project Repository</a>}
                  </div>
                ))}
              </div>
            )}

            {selectedStudent.socialLinks && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Coding & Professional Profiles</h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                  {selectedStudent.socialLinks.github && <a href={selectedStudent.socialLinks.github} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>💻 GitHub</a>}
                  {selectedStudent.socialLinks.linkedin && <a href={selectedStudent.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>👔 LinkedIn</a>}
                  {selectedStudent.socialLinks.leetcode && <a href={selectedStudent.socialLinks.leetcode} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>⚡ LeetCode</a>}
                </div>
              </div>
            )}

            {selectedStudent.resume && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ color: '#166534', fontSize: '0.9rem', display: 'block' }}>📄 Uploaded Student Resume</strong>
                  <span style={{ color: '#15803d', fontSize: '0.8rem' }}>Official PDF resume available for verification</span>
                </div>
                <a
                  href={getAssetUrl(selectedStudent.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  👁️ View Resume PDF
                </a>
              </div>
            )}

            <div style={{ marginTop: '20px', pt: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedStudent(null)} className="save-btn" style={{ background: '#475569' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </TPOLayout>
  );
}

export default Students;