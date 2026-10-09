import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import "../../styles/aiFeatures.css";

function SkillAnalysis() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState("");

  const fetchSkillData = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getSkillAnalysis();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load skill analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillData();
  }, []);

  const handleSyncToProfile = async () => {
    const extractedSkills = data?.allExtractedSkills || [];
    if (extractedSkills.length === 0) {
      alert("No extracted skills available to sync.");
      return;
    }

    try {
      setSyncing(true);
      await studentAPI.syncSkills(extractedSkills);
      setSyncToast(`✓ Successfully synced ${extractedSkills.length} skills to your student profile!`);
      await fetchSkillData();
    } catch (err) {
      console.error("Sync error:", err);
      setSyncToast("Failed to sync skills.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncToast(""), 5000);
    }
  };

  const categorized = data?.categorizedSkills || {};
  const allExtractedSkills = data?.allExtractedSkills || [];
  const profileSkills = data?.profileSkills || [];
  const roleReadiness = data?.roleReadiness || [];
  const driveMatches = data?.driveMatches || [];
  const roadmap = data?.roadmap || [];

  const categoryLabels = {
    languages: "💻 Languages",
    frontend: "🎨 Frontend",
    backend: "⚙️ Backend & APIs",
    databases: "🗄️ Databases",
    cloudDevops: "☁️ Cloud & DevOps",
    aiMlData: "🧠 AI / ML & Data",
    coreCs: "📐 Core CS",
    tools: "🛠️ Tools"
  };

  return (
    <DashboardLayout>
      <div className="ai-portal-container">
        {/* HEADER */}
        <div className="ai-header">
          <div className="ai-header-title">
            <h1>📊 Skill Analysis & Industry Benchmarks</h1>
            <p>
              Automated skill taxonomy parsing extracted directly from your resume, mapped against top recruiter expectations and campus placement drives.
            </p>
          </div>

          <div className="ai-header-actions">
            <button
              className="ai-btn-emerald"
              onClick={handleSyncToProfile}
              disabled={syncing || allExtractedSkills.length === 0}
            >
              🔄 {syncing ? "Syncing..." : "Sync Extracted Skills to Profile"}
            </button>
          </div>
        </div>

        {syncToast && (
          <div
            style={{
              padding: "12px 18px",
              background: "#ecfdf5",
              color: "#065f46",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #a7f3d0",
              fontWeight: "600"
            }}
          >
            {syncToast}
          </div>
        )}

        {/* HERO STATS OVERVIEW */}
        <div className="ats-score-hero" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)" }}>
          <div className="ats-hero-layout">
            <div className="ats-gauge-container">
              <div
                className="ats-radial-gauge"
                style={{
                  "--gauge-percent": roleReadiness[0]?.readinessScore || 70,
                  boxShadow: "0 0 25px rgba(124, 58, 237, 0.4)",
                  background: `conic-gradient(#7c3aed calc(${roleReadiness[0]?.readinessScore || 70} * 1%), rgba(255,255,255,0.12) 0%)`
                }}
              >
                <div className="ats-radial-inner">
                  <span className="ats-radial-score">{roleReadiness[0]?.readinessScore || 0}%</span>
                  <span className="ats-radial-score-sub">Top Match</span>
                </div>
              </div>

              <div className="ats-hero-details">
                <h2>
                  Primary Track: {roleReadiness[0]?.role || "Software Developer"}
                </h2>
                <p>
                  Your resume demonstrates strong technical competence with {allExtractedSkills.length} verified technologies detected across core categories.
                </p>
              </div>
            </div>

            <div className="ats-quick-metrics">
              <div className="ats-metric-item">
                <span className="ats-metric-label">Detected Skills</span>
                <span className="ats-metric-val">{allExtractedSkills.length} total</span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Profile Skills</span>
                <span className="ats-metric-val">{profileSkills.length} listed</span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Active Drives</span>
                <span className="ats-metric-val">{driveMatches.length} hiring</span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Average Fit</span>
                <span className="ats-metric-val">
                  {driveMatches.length > 0
                    ? Math.round(
                        driveMatches.reduce((acc, d) => acc + d.matchPercent, 0) / driveMatches.length
                      )
                    : 80}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: ROLE READINESS BENCHMARKS */}
        <div className="ai-card" style={{ marginBottom: "24px" }}>
          <div className="ai-card-header">
            <h3>🎯 Industry Role Readiness Benchmarks</h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Benchmarked against 2026 hiring standards
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {roleReadiness.map((roleItem, idx) => (
              <div key={idx} className="role-bench-card">
                <div className="role-bench-top">
                  <span className="role-bench-title">{roleItem.role}</span>
                  <span className="role-bench-score">{roleItem.readinessScore}%</span>
                </div>

                <div className="role-progress-bar">
                  <div
                    className="role-progress-fill"
                    style={{
                      width: `${roleItem.readinessScore}%`,
                      background:
                        roleItem.readinessScore >= 75
                          ? "linear-gradient(90deg, #10b981, #059669)"
                          : roleItem.readinessScore >= 50
                          ? "linear-gradient(90deg, #3b82f6, #2563eb)"
                          : "linear-gradient(90deg, #f59e0b, #d97706)"
                    }}
                  />
                </div>

                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                  {roleItem.description}
                </p>

                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#059669", marginBottom: "4px" }}>
                    ✓ Matched Skills ({roleItem.matchedSkills.length}):
                  </div>
                  <div className="skill-chips-wrap" style={{ marginTop: "2px" }}>
                    {roleItem.matchedSkills.map((s, i) => (
                      <span key={i} className="skill-chip emerald" style={{ fontSize: "11px", padding: "3px 8px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {roleItem.missingSkills.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#d97706", marginBottom: "4px" }}>
                      ⚠️ Missing Skills to Target:
                    </div>
                    <div className="skill-chips-wrap" style={{ marginTop: "2px" }}>
                      {roleItem.missingSkills.slice(0, 4).map((s, i) => (
                        <span key={i} className="skill-chip amber" style={{ fontSize: "11px", padding: "3px 8px" }}>
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: CATEGORIZED SKILLS DETECTED */}
        <div className="ai-card" style={{ marginBottom: "24px" }}>
          <div className="ai-card-header">
            <h3>🧩 Categorized Skills Extracted from Resume</h3>
            <span className="status-badge pass">{allExtractedSkills.length} Total Verified</span>
          </div>

          <div className="ai-tabs" style={{ marginBottom: "16px" }}>
            <button
              className={`ai-tab-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All Skills ({allExtractedSkills.length})
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = (categorized[key] || []).length;
              return (
                <button
                  key={key}
                  className={`ai-tab-btn ${activeCategory === key ? "active" : ""}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <div className="skill-chips-wrap" style={{ minHeight: "60px" }}>
            {activeCategory === "all" ? (
              allExtractedSkills.length > 0 ? (
                allExtractedSkills.map((s, idx) => (
                  <span key={idx} className="skill-chip primary">
                    ✓ {s}
                  </span>
                ))
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>No skills extracted yet. Upload a PDF resume to populate.</p>
              )
            ) : (categorized[activeCategory] || []).length > 0 ? (
              categorized[activeCategory].map((s, idx) => (
                <span key={idx} className="skill-chip purple">
                  ✓ {s}
                </span>
              ))
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No skills detected in this category.</p>
            )}
          </div>
        </div>

        {/* SECTION 3: CAMPUS DRIVES FIT MATRIX & ROADMAP */}
        <div className="ai-grid-2">
          {/* Drives Matrix */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3>🏢 Active Campus Drives Fit</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
              How your resume skills stack up against open company postings on campus:
            </p>

            <div className="audit-list">
              {driveMatches.slice(0, 4).map((d) => (
                <div key={d.driveId} className="audit-item pass">
                  <div className="audit-item-info">
                    <h4>{d.companyName} — {d.jobRole}</h4>
                    <p>
                      Package: <strong>₹{(d.salary / 100000).toFixed(1)} LPA</strong> • Match: <strong>{d.matchPercent}%</strong>
                    </p>
                    <div className="skill-chips-wrap" style={{ marginTop: "6px" }}>
                      {d.matchedSkills.slice(0, 3).map((ms, i) => (
                        <span key={i} className="skill-chip emerald" style={{ fontSize: "11px", padding: "2px 7px" }}>
                          {ms}
                        </span>
                      ))}
                      {d.missingSkills.length > 0 && (
                        <span className="skill-chip amber" style={{ fontSize: "11px", padding: "2px 7px" }}>
                          Missing: {d.missingSkills[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="status-badge pass">{d.matchPercent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Targeted Learning Roadmap */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3>🚀 Recommended Learning Roadmap</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
              High-value skills to master next to unlock maximum placement shortlists:
            </p>

            <div className="audit-list">
              {roadmap.map((item, idx) => (
                <div key={idx} className="audit-item warning">
                  <div className="audit-item-info">
                    <h4>{item.skill} ({item.category})</h4>
                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      {item.reason}
                    </p>
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                      ⏱️ Estimated Time: <strong>{item.estimatedDays}</strong> • Topics: {item.keyTopics.join(", ")}
                    </p>
                  </div>
                  <span className="status-badge warning">{item.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SkillAnalysis;
