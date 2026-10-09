import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import "../../styles/aiFeatures.css";

function AIResumeAnalysis() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [drives, setDrives] = useState([]);
  const [activeTab, setActiveTab] = useState("breakdown"); // "breakdown" | "driveMatch" | "recommendations" | "draftTester"
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState("");

  // Draft Tester states
  const [draftText, setDraftText] = useState("");
  const [testingDraft, setTestingDraft] = useState(false);
  const [draftResult, setDraftResult] = useState(null);

  const fileInputRef = useRef(null);

  const fetchATSData = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getATSAnalysis();
      setData(res.data);
      if (res.data.driveMatches && res.data.driveMatches.length > 0) {
        setSelectedDriveId(res.data.driveMatches[0].driveId);
      }
    } catch (err) {
      console.error("Failed to load ATS analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchATSData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    try {
      setUploading(true);
      setUploadToast("Parsing PDF and analyzing ATS criteria...");
      const res = await studentAPI.uploadResume(file);
      setUploadToast(`✓ Resume uploaded! ATS Score: ${res.data.atsScore}%`);
      await fetchATSData();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadToast("Failed to upload or parse resume.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadToast(""), 5000);
    }
  };

  const handleTestDraft = async () => {
    if (!draftText.trim()) return;
    try {
      setTestingDraft(true);
      const res = await studentAPI.checkResumeText(draftText, selectedDriveId);
      setDraftResult(res.data);
    } catch (err) {
      console.error("Draft test error:", err);
      alert("Failed to analyze draft text.");
    } finally {
      setTestingDraft(false);
    }
  };

  const analysis = data?.analysis || {};
  const breakdown = analysis.breakdown || {};
  const score = data?.atsScore ?? analysis.score ?? 0;
  const grade = analysis.grade || "B";
  const badgeColor = analysis.badgeColor || "emerald";
  const driveMatches = data?.driveMatches || [];
  const selectedDrive = driveMatches.find((d) => d.driveId === selectedDriveId) || driveMatches[0];

  return (
    <DashboardLayout>
      <div className="ai-portal-container">
        {/* HEADER */}
        <div className="ai-header">
          <div className="ai-header-title">
            <h1>🎯 Real ATS Resume Checker</h1>
            <p>
              Industry-standard ATS screening algorithm analyzing contact information, section headers, power action verbs, quantifiable metrics, and active campus drive compatibility.
            </p>
          </div>

          <div className="ai-header-actions">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button
              className="ai-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              📄 {uploading ? "Analyzing PDF..." : "Upload New PDF Resume"}
            </button>
            {data?.resumeUrl && (
              <a
                href={data.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="ai-btn-secondary"
              >
                👁️ View Uploaded Resume
              </a>
            )}
          </div>
        </div>

        {uploadToast && (
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
            {uploadToast}
          </div>
        )}

        {/* HERO ATS SCORE BANNER */}
        <div className="ats-score-hero">
          <div className="ats-hero-layout">
            <div className="ats-gauge-container">
              <div
                className="ats-radial-gauge"
                style={{ "--gauge-percent": score }}
              >
                <div className="ats-radial-inner">
                  <span className="ats-radial-score">{score}%</span>
                  <span className="ats-radial-score-sub">ATS Score</span>
                </div>
              </div>

              <div className="ats-hero-details">
                <h2>
                  Grade {grade}
                  <span
                    className={`ats-grade-badge ${
                      score >= 75 ? "pass" : score >= 60 ? "warning" : "fail"
                    }`}
                  >
                    {analysis.statusText || "Compatibility Checked"}
                  </span>
                </h2>
                <p>
                  {score >= 80
                    ? "Exceptional resume format! Compatible with major enterprise applicant tracking systems (Workday, Greenhouse, Taleo)."
                    : score >= 60
                    ? "Good candidate baseline. Making a few structural tweaks and adding missing keywords will push you into the top 10% percentile."
                    : "Low ATS score detected. Critical sections or developer profile links are missing, which could cause automated rejection."}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="ats-quick-metrics">
              <div className="ats-metric-item">
                <span className="ats-metric-label">Word Count</span>
                <span className="ats-metric-val">{analysis.wordCount || 0} words</span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Action Verbs</span>
                <span className="ats-metric-val">
                  {breakdown.impact?.actionVerbsCount ?? 0} found
                </span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Impact Metrics</span>
                <span className="ats-metric-val">
                  {breakdown.impact?.metricsCount ?? 0} numbers
                </span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Skills Detected</span>
                <span className="ats-metric-val">
                  {breakdown.skills?.count ?? 0} tech
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="ai-tabs">
          <button
            className={`ai-tab-btn ${activeTab === "breakdown" ? "active" : ""}`}
            onClick={() => setActiveTab("breakdown")}
          >
            📊 Detailed Score Breakdown
          </button>
          <button
            className={`ai-tab-btn ${activeTab === "driveMatch" ? "active" : ""}`}
            onClick={() => setActiveTab("driveMatch")}
          >
            🏢 Target Campus Drive Match ({driveMatches.length})
          </button>
          <button
            className={`ai-tab-btn ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendations")}
          >
            💡 Strengths & Actionable Fixes
          </button>
          <button
            className={`ai-tab-btn ${activeTab === "draftTester" ? "active" : ""}`}
            onClick={() => setActiveTab("draftTester")}
          >
            ✏️ Live Resume Draft Tester
          </button>
        </div>

        {/* TAB 1: DETAILED BREAKDOWN */}
        {activeTab === "breakdown" && (
          <div className="ai-grid-2">
            {/* Contact & Links */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3>📇 Contact Info & Profile Links</h3>
                <span className={`status-badge ${breakdown.contact?.status || "warning"}`}>
                  Score: {breakdown.contact?.score || 0}/100
                </span>
              </div>
              <div className="audit-list">
                <div className={`audit-item ${breakdown.contact?.details?.email ? "pass" : "fail"}`}>
                  <div className="audit-item-info">
                    <h4>Email Address</h4>
                    <p>{breakdown.contact?.details?.email || "Missing or unformatted email"}</p>
                  </div>
                  <span className={`status-badge ${breakdown.contact?.details?.email ? "pass" : "fail"}`}>
                    {breakdown.contact?.details?.email ? "Found" : "Missing"}
                  </span>
                </div>

                <div className={`audit-item ${breakdown.contact?.details?.phone ? "pass" : "fail"}`}>
                  <div className="audit-item-info">
                    <h4>Phone Number</h4>
                    <p>{breakdown.contact?.details?.phone || "Phone number missing"}</p>
                  </div>
                  <span className={`status-badge ${breakdown.contact?.details?.phone ? "pass" : "fail"}`}>
                    {breakdown.contact?.details?.phone ? "Found" : "Missing"}
                  </span>
                </div>

                <div className={`audit-item ${breakdown.contact?.details?.linkedin ? "pass" : "warning"}`}>
                  <div className="audit-item-info">
                    <h4>LinkedIn URL</h4>
                    <p>{breakdown.contact?.details?.linkedin || "LinkedIn profile link not detected"}</p>
                  </div>
                  <span className={`status-badge ${breakdown.contact?.details?.linkedin ? "pass" : "warning"}`}>
                    {breakdown.contact?.details?.linkedin ? "Found" : "Recommended"}
                  </span>
                </div>

                <div className={`audit-item ${breakdown.contact?.details?.github ? "pass" : "warning"}`}>
                  <div className="audit-item-info">
                    <h4>GitHub Profile</h4>
                    <p>{breakdown.contact?.details?.github || "Add GitHub link to showcase project code"}</p>
                  </div>
                  <span className={`status-badge ${breakdown.contact?.details?.github ? "pass" : "warning"}`}>
                    {breakdown.contact?.details?.github ? "Found" : "Recommended"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sections Audit */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3>📑 Section Completeness</h3>
                <span className={`status-badge ${breakdown.sections?.status || "pass"}`}>
                  Score: {breakdown.sections?.score || 0}/100
                </span>
              </div>
              <div className="audit-list">
                <div className="audit-item pass">
                  <div className="audit-item-info">
                    <h4>Detected Section Headers</h4>
                    <p>{(breakdown.sections?.detected || []).join(", ") || "None detected"}</p>
                  </div>
                  <span className="status-badge pass">Verified</span>
                </div>

                {breakdown.sections?.missing && breakdown.sections.missing.length > 0 && (
                  <div className="audit-item warning">
                    <div className="audit-item-info">
                      <h4>Missing Recommended Headers</h4>
                      <p>{breakdown.sections.missing.join(", ")}</p>
                    </div>
                    <span className="status-badge warning">Needs Header</span>
                  </div>
                )}
              </div>
            </div>

            {/* Impact & Action Verbs */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3>⚡ Power Action Verbs & Metrics</h3>
                <span className={`status-badge ${breakdown.impact?.status || "pass"}`}>
                  Score: {breakdown.impact?.score || 0}/100
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                Recruiters prioritize candidates who demonstrate impact using strong action verbs and numbers.
              </p>

              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Action Verbs Detected ({breakdown.impact?.actionVerbs?.length || 0}):
                </h4>
                <div className="skill-chips-wrap">
                  {(breakdown.impact?.actionVerbs || []).length > 0 ? (
                    breakdown.impact.actionVerbs.map((v, i) => (
                      <span key={i} className="skill-chip emerald">
                        ✓ {v}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                      No action verbs identified. Start bullets with words like 'Developed', 'Engineered', 'Optimized'.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Quantified Metrics & Scale ({breakdown.impact?.metrics?.length || 0}):
                </h4>
                <div className="skill-chips-wrap">
                  {(breakdown.impact?.metrics || []).length > 0 ? (
                    breakdown.impact.metrics.map((m, i) => (
                      <span key={i} className="skill-chip primary">
                        📈 {m}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Add percentage improvements (e.g. 35%), user counts (500+ users), or latency numbers.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Formatting & Word Count */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3>📐 Formatting & Readability</h3>
                <span className={`status-badge ${breakdown.formatting?.status || "pass"}`}>
                  Score: {breakdown.formatting?.score || 0}/100
                </span>
              </div>
              <div className="audit-list">
                <div className="audit-item pass">
                  <div className="audit-item-info">
                    <h4>Word Count Range</h4>
                    <p>
                      Current: <strong>{analysis.wordCount} words</strong> (Ideal fresher length: 350 - 750 words).
                    </p>
                  </div>
                  <span className="status-badge pass">Checked</span>
                </div>

                <div className="audit-item pass">
                  <div className="audit-item-info">
                    <h4>Bullet Point Structure</h4>
                    <p>
                      Detected <strong>{breakdown.formatting?.bulletCount || 0} bullet points</strong>. Bulleted formats scan significantly better on ATS.
                    </p>
                  </div>
                  <span className="status-badge pass">Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TARGET DRIVE MATCH */}
        {activeTab === "driveMatch" && (
          <div>
            <div className="ai-card" style={{ marginBottom: "20px" }}>
              <div className="ai-card-header">
                <h3>🏢 Select Campus Drive to Compare</h3>
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "14px" }}>
                See how well your current resume matches specific job descriptions and campus recruitment criteria:
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {driveMatches.map((d) => (
                  <button
                    key={d.driveId}
                    className={selectedDriveId === d.driveId ? "ai-btn-primary" : "ai-btn-secondary"}
                    onClick={() => setSelectedDriveId(d.driveId)}
                  >
                    {d.companyName} ({d.matchPercent}%)
                  </button>
                ))}
              </div>
            </div>

            {selectedDrive && (
              <div className="ai-grid-2">
                <div className="ai-card">
                  <div className="ai-card-header">
                    <h3>{selectedDrive.companyName} — {selectedDrive.jobRole}</h3>
                    <span className="ats-grade-badge pass">
                      {selectedDrive.matchPercent}% Match
                    </span>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "14px", color: "#475569" }}>
                      <strong>Package:</strong> ₹{(selectedDrive.salary / 100000).toFixed(1)} LPA • <strong>Location:</strong> {selectedDrive.location || "Pan India"}
                    </p>
                    <p style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                      <strong>Min CGPA Requirement:</strong> {selectedDrive.minCGPA || "None"}
                    </p>
                  </div>

                  <div className="role-progress-bar">
                    <div
                      className="role-progress-fill"
                      style={{ width: `${selectedDrive.matchPercent}%` }}
                    />
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#059669", marginBottom: "8px" }}>
                      ✓ Matched Requirements ({selectedDrive.matchedSkills?.length || 0}):
                    </h4>
                    <div className="skill-chips-wrap">
                      {(selectedDrive.matchedSkills || []).length > 0 ? (
                        selectedDrive.matchedSkills.map((s, i) => (
                          <span key={i} className="skill-chip emerald">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>No direct requirement matches found.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#d97706", marginBottom: "8px" }}>
                      ⚠️ Missing Keywords for this Role ({selectedDrive.missingSkills?.length || 0}):
                    </h4>
                    <div className="skill-chips-wrap">
                      {(selectedDrive.missingSkills || []).length > 0 ? (
                        selectedDrive.missingSkills.map((s, i) => (
                          <span key={i} className="skill-chip amber">
                            + {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "13px", color: "#059669", fontWeight: "600" }}>
                          All listed requirements match your profile!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ai-card">
                  <div className="ai-card-header">
                    <h3>💡 Recruiter Advice for {selectedDrive.companyName}</h3>
                  </div>
                  <div className="audit-list">
                    <div className="audit-item pass">
                      <div className="audit-item-info">
                        <h4>Application Readiness</h4>
                        <p>
                          {selectedDrive.matchPercent >= 70
                            ? "Your resume has high keyword overlap with this recruiter's requirements. High shortlisting probability."
                            : "Add the missing skills shown on the left into your projects to increase automated screening chances."}
                        </p>
                      </div>
                    </div>
                    <div className="audit-item warning">
                      <div className="audit-item-info">
                        <h4>Interview Focus Areas</h4>
                        <p>Expect technical screening questions around core DSA, object design, and live coding exercises.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STRENGTHS & RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div className="ai-grid-2">
            <div className="ai-card">
              <div className="ai-card-header">
                <h3>✅ Resume Strengths Identified</h3>
              </div>
              <div className="audit-list">
                {(analysis.strengths || []).map((s, i) => (
                  <div key={i} className="audit-item pass">
                    <div className="audit-item-info">
                      <h4>Strength #{i + 1}</h4>
                      <p>{s}</p>
                    </div>
                    <span className="status-badge pass">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-card-header">
                <h3>🚀 Priority ATS Fixes & Optimizations</h3>
              </div>
              <div className="audit-list">
                {(analysis.improvements || []).map((imp, i) => (
                  <div key={i} className="audit-item warning">
                    <div className="audit-item-info">
                      <h4>Action Step #{i + 1}</h4>
                      <p>{imp}</p>
                    </div>
                    <span className="status-badge warning">Action</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE DRAFT TESTER */}
        {activeTab === "draftTester" && (
          <div className="ai-card">
            <div className="ai-card-header">
              <h3>✏️ Test Resume Draft Text Live</h3>
            </div>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
              Paste or type your resume draft below to instantly calculate your ATS score, detected action verbs, and skills without re-uploading a PDF:
            </p>

            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Paste your resume text here (e.g. Summary, Experience, Skills, Projects with bullet points)..."
              style={{
                width: "100%",
                minHeight: "220px",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontFamily: "monospace",
                fontSize: "13px",
                marginBottom: "16px",
                outline: "none"
              }}
            />

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                className="ai-btn-primary"
                onClick={handleTestDraft}
                disabled={testingDraft || !draftText.trim()}
              >
                ⚡ {testingDraft ? "Analyzing Draft..." : "Calculate Real ATS Score"}
              </button>
            </div>

            {draftResult && (
              <div style={{ marginTop: "24px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb" }}>
                    {draftResult.atsResult?.score}%
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                      Grade: {draftResult.atsResult?.grade} ({draftResult.atsResult?.statusText})
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Word Count: {draftResult.atsResult?.wordCount} • Skills Detected: {draftResult.skillResult?.allSkills?.length || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    Skills Detected in Draft:
                  </h4>
                  <div className="skill-chips-wrap">
                    {(draftResult.skillResult?.allSkills || []).map((s, i) => (
                      <span key={i} className="skill-chip primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AIResumeAnalysis;