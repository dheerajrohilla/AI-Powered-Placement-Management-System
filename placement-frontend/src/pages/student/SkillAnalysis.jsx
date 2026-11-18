import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import "../../styles/aiFeatures.css";

function SkillAnalysis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState("");
  const [selectedSkillEvidence, setSelectedSkillEvidence] = useState(null);

  const fetchSkillData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const res = await studentAPI.getSkillAnalysis();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load skill analysis:", err);
      setError(err.response?.data?.error || err.message || "Failed to load skill analysis data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillData(true);
  }, []);

  const handleSyncToProfile = async () => {
    const extractedSkills = data?.allExtractedSkills || [];
    if (extractedSkills.length === 0) {
      alert("No extracted skills available to synchronize. Please upload your resume first.");
      return;
    }

    try {
      setSyncing(true);
      const res = await studentAPI.syncSkills(extractedSkills);
      setSyncToast(`✓ Successfully synchronized ${res.data.skills?.length || extractedSkills.length} skills to your student profile!`);
      await fetchSkillData();
    } catch (err) {
      console.error("Sync error:", err);
      setSyncToast("Failed to synchronize skills.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncToast(""), 5000);
    }
  };

  const hasResume = Boolean(data?.hasResume);
  const processingStatus = data?.resumeProcessingStatus || (hasResume ? "completed" : "idle");
  const lastSyncAt = data?.lastSkillSyncAt
    ? new Date(data.lastSkillSyncAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  const categorized = data?.categorizedSkills || {};
  const allExtractedSkills = data?.allExtractedSkills || [];
  const profileSkills = data?.profileSkills || [];
  const roleReadiness = data?.roleReadiness || [];
  const driveMatches = data?.driveMatches || [];
  const roadmap = data?.roadmap || [];
  const evidence = data?.evidence || {};

  const topRole = roleReadiness[0] || null;
  const topScore = allExtractedSkills.length > 0 ? (topRole?.readinessScore || 0) : 0;

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

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
          <h3 style={{ fontSize: "18px", color: "#1e293b", fontWeight: "600" }}>Analyzing Skill Taxonomy & Role Benchmarks...</h3>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Parsing verified resume technologies against 2026 technical recruitment requirements.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
          <h3 style={{ fontSize: "18px", color: "#1e293b", fontWeight: "600" }}>Unable to Load Skill Analysis</h3>
          <p style={{ fontSize: "14px", color: "#ef4444", marginTop: "4px", maxWidth: "500px", margin: "4px auto 16px" }}>
            {error}
          </p>
          <button
            onClick={() => fetchSkillData(true)}
            className="ai-btn-primary"
          >
            🔄 Retry Loading
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="ai-portal-container">
        {/* HEADER */}
        <div className="ai-header">
          <div className="ai-header-title">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ margin: 0 }}>📊 Skill Analysis & Industry Benchmarks</h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  background: processingStatus === "completed" ? "#ecfdf5" : processingStatus === "processing" ? "#eff6ff" : "#f1f5f9",
                  color: processingStatus === "completed" ? "#059669" : processingStatus === "processing" ? "#2563eb" : "#64748b",
                  border: `1px solid ${processingStatus === "completed" ? "#a7f3d0" : "#cbd5e1"}`
                }}
              >
                ● Status: {processingStatus}
              </span>
            </div>
            <p>
              Evidence-backed skill extraction directly from your uploaded resume, mapped transparently to university placement roles.
            </p>
          </div>

          <div className="ai-header-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="ai-btn-secondary"
              onClick={() => fetchSkillData(true)}
              title="Refresh Skill Benchmarks"
            >
              🔄 Refresh
            </button>
            <button
              className="ai-btn-emerald"
              onClick={handleSyncToProfile}
              disabled={syncing || allExtractedSkills.length === 0}
            >
              ⚡ {syncing ? "Synchronizing..." : "Sync Skills to Profile"}
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {syncToast && (
          <div
            style={{
              padding: "12px 18px",
              background: "#ecfdf5",
              color: "#065f46",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #a7f3d0",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>{syncToast}</span>
            <button
              onClick={() => setSyncToast("")}
              style={{ background: "none", border: "none", color: "#065f46", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* EMPTY STATE BANNER IF NO RESUME PROCESSED */}
        {!hasResume && (
          <div
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
              border: "1px solid #c7d2fe",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div style={{ maxWidth: "600px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "20px" }}>📄</span>
                <h3 style={{ margin: 0, fontSize: "17px", color: "#1e1b4b", fontWeight: "700" }}>
                  No Resume Synchronized Yet
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                Upload your PDF or Word DOCX resume in Real ATS Checker. The parsing pipeline will automatically extract all technical skills, verify contextual evidence, and calculate real role-fit percentages.
              </p>
            </div>
            <Link
              to="/student/ats"
              className="ai-btn-primary"
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Upload Resume in Real ATS Checker →
            </Link>
          </div>
        )}

        {/* HERO STATS OVERVIEW */}
        <div className="ats-score-hero" style={{
          background: "radial-gradient(ellipse at 85% 15%, rgba(139, 92, 246, 0.25) 0%, transparent 60%), linear-gradient(135deg, #0B0F19 0%, #111827 50%, #1E1B4B 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 20px 35px -10px rgba(11, 15, 25, 0.5), 0 0 20px rgba(139, 92, 246, 0.1)"
        }}>
          <div className="ats-hero-layout">
            <div className="ats-gauge-container">
              <div
                className="ats-radial-gauge"
                style={{
                  "--gauge-percent": topScore,
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.4)",
                  background: `conic-gradient(#8B5CF6 calc(${topScore} * 1%), rgba(255, 255, 255, 0.12) 0%)`
                }}
              >
                <div className="ats-radial-inner">
                  <span className="ats-radial-score">{topScore}%</span>
                  <span className="ats-radial-score-sub">Top Match</span>
                </div>
              </div>

              <div className="ats-hero-details">
                <h2>
                  Primary Track: {allExtractedSkills.length > 0 ? (topRole?.role || "Software Developer") : "No Resume Skills Yet"}
                </h2>
                <p>
                  {allExtractedSkills.length > 0
                    ? `Your resume demonstrates verified technical competence across ${allExtractedSkills.length} technologies extracted from your active resume.`
                    : "Upload your resume in Real ATS Checker to view evidence-backed skill extraction and industry role readiness."}
                </p>
                {lastSyncAt && (
                  <span style={{ fontSize: "11px", color: "#94A3B8", display: "inline-block", marginTop: "6px" }}>
                    Last Synchronized: {lastSyncAt}
                  </span>
                )}
              </div>
            </div>

            <div className="ats-quick-metrics" style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
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
                  {driveMatches.length > 0 && allExtractedSkills.length > 0
                    ? Math.round(
                        driveMatches.reduce((acc, d) => acc + (d.matchPercent || 0), 0) / driveMatches.length
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: ROLE READINESS BENCHMARKS */}
        <div className="ai-card" style={{ marginBottom: "24px" }}>
          <div className="ai-card-header">
            <div>
              <h3 style={{ margin: 0 }}>🎯 Industry Role Readiness Benchmarks</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                Transparently calculated from weighted skill coverage required for university placements.
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
              Taxonomy: 2026 Campus Standards
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {roleReadiness.map((roleItem, idx) => (
              <div key={idx} className="role-bench-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
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
                            : roleItem.readinessScore >= 45
                            ? "linear-gradient(90deg, #3b82f6, #2563eb)"
                            : roleItem.readinessScore > 0
                            ? "linear-gradient(90deg, #f59e0b, #d97706)"
                            : "#e2e8f0"
                      }}
                    />
                  </div>

                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                    {roleItem.description}
                  </p>

                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#059669", marginBottom: "4px" }}>
                      ✓ Matched Skills ({roleItem.matchedSkills.length}):
                    </div>
                    <div className="skill-chips-wrap" style={{ marginTop: "2px" }}>
                      {roleItem.matchedSkills.length > 0 ? (
                        roleItem.matchedSkills.map((s, i) => (
                          <span key={i} className="skill-chip emerald" style={{ fontSize: "11px", padding: "3px 8px" }}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>No matching skills detected</span>
                      )}
                    </div>
                  </div>

                  {roleItem.missingSkills.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#d97706", marginBottom: "4px" }}>
                        ⚠️ Missing Skills to Target ({roleItem.missingSkills.length}):
                      </div>
                      <div className="skill-chips-wrap" style={{ marginTop: "2px" }}>
                        {roleItem.missingSkills.slice(0, 5).map((s, i) => (
                          <span key={i} className="skill-chip amber" style={{ fontSize: "11px", padding: "3px 8px" }}>
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {roleItem.recommendedNextSkills && roleItem.recommendedNextSkills.length > 0 && (
                  <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px dashed #e2e8f0", fontSize: "11px", color: "#475569" }}>
                    💡 <strong>Next high-impact skill:</strong> <span style={{ color: "#4f46e5", fontWeight: "600" }}>{roleItem.recommendedNextSkills[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: CATEGORIZED SKILLS DETECTED & EVIDENCE MODAL */}
        <div className="ai-card" style={{ marginBottom: "24px" }}>
          <div className="ai-card-header">
            <div>
              <h3 style={{ margin: 0 }}>🧩 Categorized Skills Extracted from Resume</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                Click on any skill chip to inspect the exact context snippet extracted from your resume.
              </p>
            </div>
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
                  <span
                    key={idx}
                    className="skill-chip primary"
                    style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
                    onClick={() => setSelectedSkillEvidence({ skill: s, snippet: evidence[s] || "Extracted from verified resume text." })}
                    title="Click to view extraction evidence snippet"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                  No skills extracted yet. Upload a PDF or Word DOCX resume to populate.
                </p>
              )
            ) : (categorized[activeCategory] || []).length > 0 ? (
              categorized[activeCategory].map((s, idx) => (
                <span
                  key={idx}
                  className="skill-chip purple"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedSkillEvidence({ skill: s, snippet: evidence[s] || "Extracted from verified resume text." })}
                  title="Click to view extraction evidence snippet"
                >
                  ✓ {s}
                </span>
              ))
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No skills detected in this category.</p>
            )}
          </div>

          {/* EVIDENCE SNIPPET POPOVER */}
          {selectedSkillEvidence && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 18px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px"
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Resume Evidence Verification
                </span>
                <h4 style={{ margin: "2px 0 6px 0", fontSize: "14px", color: "#1e293b" }}>
                  Skill: <span style={{ color: "#4f46e5" }}>{selectedSkillEvidence.skill}</span>
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#334155", fontStyle: "italic", background: "#ffffff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  "...{selectedSkillEvidence.snippet}..."
                </p>
              </div>
              <button
                onClick={() => setSelectedSkillEvidence(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: CAMPUS DRIVES FIT MATRIX & ROADMAP */}
        <div className="ai-grid-2">
          {/* Drives Matrix */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3 style={{ margin: 0 }}>🏢 Active Campus Drives Fit</h3>
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
              <h3 style={{ margin: 0 }}>🚀 Recommended Learning Roadmap</h3>
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
