import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { useParams, Link } from "react-router-dom";

function CompanyPrepMode() {
  const { driveId } = useParams();

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveId || "");
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);

  // Fetch drives list
  useEffect(() => {
    studentAPI.getPlacementDrives()
      .then((res) => {
        const driveList = res.data || [];
        setDrives(driveList);
        if (!driveId && driveList.length > 0) {
          setSelectedDriveId(driveList[0]._id);
        }
      })
      .catch((err) => console.error("Failed to load drives:", err));
  }, [driveId]);

  // Fetch prep plan when selectedDriveId changes
  useEffect(() => {
    const targetId = selectedDriveId || driveId || "default";
    setLoading(true);
    studentAPI.getCompanyPrepMode(targetId)
      .then((res) => {
        setPrepData(res.data);
        setChecklist(res.data?.readinessChecklist || []);
      })
      .catch((err) => console.error("Failed to load company prep mode:", err))
      .finally(() => setLoading(false));
  }, [selectedDriveId, driveId]);

  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>Company-Specific Preparation Mode</h1>
          <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
            Tailored recruitment intelligence, interview rounds breakdown, skill gap audit, and preparation timeline.
          </p>
        </div>

        {/* Company Selector Dropdown */}
        <div style={{ minWidth: "260px" }}>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: 600 }}
          >
            {drives.map(d => (
              <option key={d._id} value={d._id}>
                {d.company?.companyName || d.title} — {d.jobRole || d.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Synthesizing company interview intelligence and skill gaps...</p>
        </div>
      ) : prepData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Company Target Header Banner */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            color: "white",
            padding: "28px",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{ maxWidth: "600px" }}>
              <span style={{ background: "#2563eb", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                Target Recruitment Drive
              </span>
              <h2 style={{ fontSize: "26px", marginTop: "10px" }}>{prepData.companyName}</h2>
              <p style={{ fontSize: "16px", opacity: 0.9, marginTop: "2px" }}>
                {prepData.roleTitle} • ₹{(prepData.salary / 100000).toFixed(1)} LPA • {prepData.location}
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "10px" }}>
                💡 <strong>Recruiter Tip:</strong> {prepData.tips}
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", padding: "16px 20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#93c5fd" }}>{prepData.difficulty}</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Expected Difficulty</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.15)", padding: "16px 20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: prepData.matchScore >= 70 ? "#86efac" : "#fde047" }}>
                  {prepData.matchScore}%
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Resume-to-JD Match</div>
              </div>
            </div>
          </div>

          {/* Quick Launch Action Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to={`/student/mock-interview?company=${encodeURIComponent(prepData.companyName)}&category=company_specific`}
              className="ai-btn-primary"
              style={{ padding: "12px 24px", fontSize: "15px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}
            >
              🚀 Start Verified {prepData.companyName} AI Assessment →
            </Link>
          </div>

          {/* Skills Match vs Skill Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            <div className="card" style={{ padding: "22px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#166534", marginBottom: "12px" }}>
                ✅ Matched Skills in Your Profile ({prepData.matchedSkills?.length || 0})
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(prepData.matchedSkills || []).map((sk, idx) => (
                  <span key={idx} style={{ padding: "6px 14px", borderRadius: "20px", background: "#dcfce7", color: "#15803d", fontSize: "13px", fontWeight: 600 }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: "22px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#991b1b", marginBottom: "12px" }}>
                ⚠️ Missing Skill Gaps to Cover ({prepData.missingSkills?.length || 0})
              </h3>
              {prepData.missingSkills?.length === 0 ? (
                <p style={{ color: "#166534", fontSize: "13px" }}>✓ You possess all required technical skills for this drive!</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {prepData.missingSkills.map((sk, idx) => (
                    <span key={idx} style={{ padding: "6px 14px", borderRadius: "20px", background: "#fee2e2", color: "#991b1b", fontSize: "13px", fontWeight: 600 }}>
                      + {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Previous Interview Topics & Rounds Breakdown */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              🏢 Selection Process & Interview Rounds Pattern
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {(prepData.rounds || []).map((r, idx) => (
                <div key={idx} style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "15px" }}>Round {idx + 1}: {r.name}</span>
                    <span style={{ fontSize: "11px", background: "#e2e8f0", padding: "2px 8px", borderRadius: "6px" }}>{r.duration}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>{r.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Preparation Roadmap */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              📅 Recommended 6-Day Preparation Timeline
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(prepData.preparationRoadmap || []).map((step, idx) => (
                <div key={idx} style={{ padding: "16px", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "15px", marginBottom: "4px" }}>
                    {step.phase} — {step.focus}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#374151" }}>
                    {step.tasks.map((task, tIdx) => (
                      <li key={tIdx} style={{ marginTop: "3px" }}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* High Frequency Mock Questions & Readiness Checklist */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>

            {/* High-frequency questions */}
            <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
                🎯 High-Frequency Interview Questions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(prepData.sampleQuestions || []).map((q, idx) => (
                  <div key={idx} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155" }}>
                    <span style={{ fontWeight: 700, color: "#2563eb", display: "block", marginBottom: "3px" }}>Q{idx + 1}:</span>
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Checklist */}
            <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
                ☑️ Interview Readiness Checklist
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {checklist.map((item) => (
                  <label key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: item.completed ? "#f0fdf4" : "#f8fafc",
                    border: item.completed ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{
                      fontSize: "13px",
                      color: item.completed ? "#166534" : "#374151",
                      textDecoration: item.completed ? "line-through" : "none",
                      fontWeight: item.completed ? 600 : 500
                    }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default CompanyPrepMode;
