import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI, getAssetUrl } from "../../services/api";
import "../../styles/aiFeatures.css";

function AIResumeAnalysis() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("breakdown"); // "breakdown" | "driveMatch" | "recommendations" | "draftTester"
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState("");
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Draft Tester states
  const [draftText, setDraftText] = useState("");
  const [testingDraft, setTestingDraft] = useState(false);
  const [draftResult, setDraftResult] = useState(null);

  const fileInputRef = useRef(null);

  const fetchATSData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await studentAPI.getATSAnalysis();
      setData(res.data);
      if (res.data.isValidResume === false || res.data.validationError) {
        setValidationError(res.data.validationError || {
          type: 'invalid_resume',
          title: 'Document Validation Failed',
          message: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
          details: `Document identified as ${res.data.documentType || 'unrelated document'}. Missing essential resume components (Contact details, Education, Skills, or Projects).`,
          documentType: res.data.documentType || 'unrelated_document'
        });
      }
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
    fetchATSData(false);
  }, []);

  const processUploadedFile = async (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValid = fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".doc") ||
      (file.type && (file.type.includes("pdf") || file.type.includes("word") || file.type.includes("officedocument")));
    if (!isValid) {
      alert("Please upload a valid PDF (.pdf) or Word (.docx) resume file.");
      return;
    }

    try {
      setUploading(true);
      setValidationError(null);
      setUploadToast("Validating document structure & parsing ATS criteria...");
      const res = await studentAPI.uploadResume(file);
      if (res.data) {
        setData(res.data);
      }
      const skillCount = res.data.extractedSkillsCount || res.data.skills?.length || res.data.allExtractedSkills?.length || 0;
      setUploadToast(`✓ Resume validated & uploaded successfully! ATS Score: ${res.data.atsScore}%. Extracted ${skillCount} skills synchronized to your profile!`);
      setValidationError(null);
      await fetchATSData();
    } catch (err) {
      console.error("Upload error:", err);
      const errData = err.response?.data;
      const msg = errData?.error || err.message || "Failed to upload or parse resume.";

      if (err.response?.status === 422 || errData?.isValidResume === false) {
        setValidationError({
          type: 'invalid_resume',
          title: 'Document Validation Failed',
          message: msg,
          details: errData?.details || 'The uploaded file does not contain necessary resume sections (Contact details, Education, Skills, or Projects).',
          documentType: errData?.documentType || 'unrelated_document'
        });
        // Immediately reset state to percentage 0
        setData((prev) => ({
          ...prev,
          atsScore: 0,
          isValidResume: false,
          analysis: {
            ...(prev?.analysis || {}),
            score: 0,
            overallScore: 0,
            isValidResume: false,
            grade: 'N/A',
            statusText: 'Document Validation Failed (Not a Resume)',
            wordCount: 0,
            breakdown: {
              impact: { actionVerbsCount: 0, metricsCount: 0 },
              contact: { score: 0 },
              sections: { score: 0 },
              skills: { score: 0, skills: [] },
              formatting: { score: 0 }
            },
            sectionBreakdown: {
              contact: { score: 0 },
              summary: { score: 0 },
              education: { score: 0 },
              technicalSkills: { score: 0 },
              workExperience: { score: 0 },
              internships: { score: 0 },
              projects: { score: 0 },
              certifications: { score: 0 },
              relevantKeywords: { score: 0 },
              formatting: { score: 0 },
              atsCompatibility: { score: 0 }
            }
          }
        }));
      } else if (errData?.errorType === 'extraction_failed' || err.response?.status === 400) {
        setValidationError({
          type: 'extraction_failed',
          title: 'Text Extraction Failed',
          message: msg,
          details: 'The document could not be read. Please ensure it is an unencrypted, uncorrupted PDF or Word (.docx) document.'
        });
      } else {
        const isBadGateway = err.response?.status === 502;
        const isConnRefused = err.code === 'ECONNREFUSED' || msg.includes('Network Error');
        const errorDetail = isBadGateway || isConnRefused
          ? 'Backend server at http://localhost:5000 is unreachable. Please ensure the backend server process is started and running.'
          : 'An unexpected error occurred during processing. Please check backend logs or try again.';

        setValidationError({
          type: 'generic_error',
          title: isBadGateway ? '502 Bad Gateway (Backend Offline)' : 'Upload Error',
          message: msg,
          details: errorDetail
        });
      }

      setUploadToast(`✕ ${msg}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadToast(""), 10000);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
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

  const isNotResume = (validationError && validationError.type === 'invalid_resume') ||
    (data?.isValidResume === false && !data?.resumeParsedText && !data?.analysis?.score) ||
    (data?.resumeProcessingStatus === 'rejected') ||
    (data?.documentType && data?.documentType !== 'resume' && data?.documentType !== 'pdf' && data?.documentType !== 'docx') ||
    Boolean(data?.analysis?.statusText?.includes("Document Validation Failed"));
  const analysis = data?.analysis || {};
  const breakdown = isNotResume ? {} : (analysis.breakdown || {});
  const score = isNotResume ? 0 : (data?.atsScore ?? analysis.score ?? 0);
  const grade = isNotResume ? "N/A" : (analysis.grade || (score >= 80 ? "A" : score >= 60 ? "B" : "C"));
  const driveMatches = isNotResume ? [] : (data?.driveMatches || []);
  const selectedDrive = driveMatches.find((d) => d.driveId === selectedDriveId) || driveMatches[0];
  const rawResumePath = data?.resumeUrl || data?.resume;
  const resumeFullUrl = getAssetUrl(rawResumePath);

  // Score dynamic colors: red if not a resume, otherwise dynamic
  const scoreColor = isNotResume ? "#EF4444" : (score >= 80 ? "#10B981" : score >= 60 ? "#38BDF8" : "#F59E0B");

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎯</div>
          <h3 style={{ fontSize: "18px", color: "#0F172A", fontWeight: "700" }}>Analyzing Resume ATS Criteria...</h3>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
            Running multi-point audit against formatting, power verbs, metrics, and drive keywords.
          </p>
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
            <h1>🎯 Real ATS Resume Checker</h1>
            <p>
              Industry-standard ATS screening algorithm analyzing contact information, section headers, power action verbs, quantifiable metrics, and active campus drive compatibility.
            </p>
          </div>

          <div className="ai-header-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button
              className="ai-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              📄 {uploading ? "Analyzing Document & Extracting Skills..." : "Upload Resume (PDF/DOCX)"}
            </button>
            <Link
              to="/student/skills"
              className="ai-btn-secondary"
              style={{ textDecoration: "none" }}
              title="View extracted and synchronized skills"
            >
              ⚡ View Skill Analysis
            </Link>
            {resumeFullUrl && (
              <>
                <button
                  type="button"
                  className="ai-btn-secondary"
                  onClick={() => setShowViewerModal(true)}
                >
                  👁️ View Uploaded Resume
                </button>
                <a
                  href={resumeFullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ai-btn-secondary"
                  style={{ textDecoration: "none" }}
                  title="Open in new window"
                >
                  ↗️ Open in New Tab
                </a>
              </>
            )}
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? "2px dashed #3B82F6" : "2px dashed #CBD5E1",
            background: isDragging
              ? "rgba(59, 130, 246, 0.05)"
              : "#FFFFFF",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: isDragging ? "0 10px 25px -5px rgba(59, 130, 246, 0.15)" : "0 1px 3px rgba(0,0,0,0.03)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: isDragging ? "#DBEAFE" : "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              color: "#2563EB"
            }}>
              {uploading ? "⏳" : "📤"}
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px" }}>
                {uploading
                  ? "Analyzing document & synchronizing skills to profile..."
                  : isDragging
                  ? "Drop your resume file here to analyze"
                  : "Drag and drop your resume here, or click to browse"}
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                Supports standard applicant formats: <strong style={{ color: "#2563EB" }}>PDF (.pdf)</strong> and <strong style={{ color: "#2563EB" }}>Word (.docx)</strong> up to 10MB.
              </p>
            </div>
            {resumeFullUrl && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: isNotResume ? "#FEF2F2" : "#F0FDF4",
                borderRadius: "20px",
                border: `1px solid ${isNotResume ? "#FECACA" : "#BBF7D0"}`,
                fontSize: "12px",
                color: isNotResume ? "#991B1B" : "#166534",
                fontWeight: "600",
                marginTop: "4px"
              }}>
                <span>{isNotResume ? "❌ Invalid Document (Not a Resume):" : "✓ Active File:"}</span>
                <span style={{ textDecoration: "underline" }}>{rawResumePath.split('/').pop()}</span>
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK NOTIFICATION TOAST */}
        {uploadToast && (
          <div
            style={{
              padding: "14px 20px",
              background: uploadToast.startsWith("✓") ? "#ECFDF5" : "#FEF2F2",
              color: uploadToast.startsWith("✓") ? "#065F46" : "#991B1B",
              borderRadius: "12px",
              marginBottom: "24px",
              border: `1px solid ${uploadToast.startsWith("✓") ? "#A7F3D0" : "#FECACA"}`,
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{uploadToast}</span>
            <button
              onClick={() => setUploadToast("")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* VALIDATION ERROR ALERT BOX */}
        {validationError && (
          <div
            style={{
              padding: "20px 24px",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "16px",
              marginBottom: "24px",
              boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#991B1B", margin: 0 }}>
                    {validationError.title}
                  </h3>
                  <button
                    onClick={() => setValidationError(null)}
                    style={{ background: "none", border: "none", color: "#991B1B", cursor: "pointer", fontSize: "18px" }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#B91C1C", margin: "0 0 6px" }}>
                  {validationError.message}
                </p>
                <p style={{ fontSize: "13px", color: "#7F1D1D", margin: "0 0 14px", lineHeight: "1.5" }}>
                  {validationError.details}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "#DC2626",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>📤</span>
                  <span>Upload Another Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO ATS SCORE BANNER */}
        <div className="ats-score-hero" style={{
          background: "radial-gradient(ellipse at 85% 15%, rgba(99, 102, 241, 0.2) 0%, transparent 60%), linear-gradient(135deg, #0B0F19 0%, #111827 50%, #0F172A 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 20px 35px -10px rgba(11, 15, 25, 0.5), 0 0 20px rgba(59, 130, 246, 0.08)"
        }}>
          <div className="ats-hero-layout">
            <div className="ats-gauge-container">
              <div
                className="ats-radial-gauge"
                style={{
                  "--gauge-percent": isNotResume ? 0 : score,
                  background: isNotResume
                    ? `conic-gradient(#EF4444 0%, rgba(255, 255, 255, 0.12) 0%)`
                    : `conic-gradient(${scoreColor} calc(var(--gauge-percent, 0) * 1%), rgba(255, 255, 255, 0.12) calc(var(--gauge-percent, 0) * 1%))`,
                  boxShadow: `0 0 25px ${scoreColor}40`
                }}
              >
                <div className="ats-radial-inner">
                  <span className="ats-radial-score">{isNotResume ? 0 : score}%</span>
                  <span className="ats-radial-score-sub">ATS Score</span>
                </div>
              </div>

              <div className="ats-hero-details">
                <h2>
                  Grade {grade}
                  <span
                    className={`ats-grade-badge ${
                      isNotResume ? "fail" : score >= 75 ? "pass" : score >= 60 ? "warning" : "fail"
                    }`}
                  >
                    {isNotResume ? "Document Validation Failed" : (analysis.statusText || "Compatibility Checked")}
                  </span>
                </h2>
                <p>
                  {isNotResume
                    ? "The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or Word (.docx) format to calculate your ATS score."
                    : score >= 80
                    ? "Exceptional resume structure! Fully compatible with major corporate ATS screeners (Workday, Greenhouse, Taleo) and placement partner requirements."
                    : score >= 60
                    ? "Solid candidate foundation. Adding quantified metrics and recommended drive keywords will push your profile into the top 10% shortlist tier."
                    : "Low ATS compatibility detected. Key sections or developer profiles are missing, risking automated screening filters."}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="ats-quick-metrics" style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Word Count</span>
                <span className="ats-metric-val">{isNotResume ? 0 : (analysis.wordCount || 0)} words</span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Action Verbs</span>
                <span className="ats-metric-val">
                  {isNotResume ? 0 : (breakdown.impact?.actionVerbsCount ?? 0)} found
                </span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Impact Metrics</span>
                <span className="ats-metric-val">
                  {isNotResume ? 0 : (breakdown.impact?.metricsCount ?? 0)} numbers
                </span>
              </div>
              <div className="ats-metric-item">
                <span className="ats-metric-label">Skills Detected</span>
                <span className="ats-metric-val">
                  {isNotResume ? 0 : (breakdown.skills?.count ?? data?.studentSkills?.length ?? 0)} tech
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
          isNotResume ? (
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid #FECACA",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#991B1B", margin: "0 0 8px" }}>
                No ATS Breakdown Available
              </h3>
              <p style={{ color: "#7F1D1D", fontSize: "14px", maxWidth: "620px", margin: "0 auto 18px", lineHeight: "1.6" }}>
                The uploaded document was not recognized as a resume ({validationError?.documentType?.replace("_", " ") || "invalid document"}). The ATS analysis engine only evaluates authentic resumes containing contact information, education, technical skills, and project experience.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer"
                }}
              >
                Upload Valid Resume (PDF / DOCX)
              </button>
            </div>
          ) : (
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
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px" }}>
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
                    <span style={{ fontSize: "13px", color: "#94A3B8" }}>
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
                    <span style={{ fontSize: "13px", color: "#94A3B8" }}>
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
          )
        )}

        {/* TAB 2: TARGET DRIVE MATCH */}
        {activeTab === "driveMatch" && (
          isNotResume ? (
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid #FECACA",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>🏢</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#991B1B", margin: "0 0 8px" }}>
                Drive Matching Unavailable
              </h3>
              <p style={{ color: "#7F1D1D", fontSize: "14px", maxWidth: "620px", margin: "0 auto", lineHeight: "1.6" }}>
                Matching against campus placement drives requires a genuine applicant resume. Please upload a valid resume in PDF or DOCX format.
              </p>
            </div>
          ) : (
          <div>
            <div className="ai-card" style={{ marginBottom: "20px" }}>
              <div className="ai-card-header">
                <h3>🏢 Select Campus Drive to Compare</h3>
              </div>
              <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "14px" }}>
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
                        <span style={{ fontSize: "13px", color: "#94A3B8" }}>No direct requirement matches found.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#D97706", marginBottom: "8px" }}>
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
          )
        )}

        {/* TAB 3: STRENGTHS & RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          isNotResume ? (
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid #FECACA",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>🚫</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#991B1B", margin: "0 0 8px" }}>
                Recommendations Unavailable for Non-Resume Files
              </h3>
              <p style={{ color: "#7F1D1D", fontSize: "14px", maxWidth: "620px", margin: "0 auto", lineHeight: "1.6" }}>
                ATS recommendations, strengths, and keyword suggestions are only generated for genuine applicant resumes. Please upload a valid resume.
              </p>
            </div>
          ) : (
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
          )
        )}

        {/* TAB 4: LIVE DRAFT TESTER */}
        {activeTab === "draftTester" && (
          <div className="ai-card">
            <div className="ai-card-header">
              <h3>✏️ Test Resume Draft Text Live</h3>
            </div>
            <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "16px" }}>
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
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontFamily: "var(--font-mono)",
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
              <div style={{ marginTop: "24px", padding: "20px", background: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "#2563EB" }}>
                    {draftResult.atsResult?.score}%
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                      Grade: {draftResult.atsResult?.grade} ({draftResult.atsResult?.statusText})
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B" }}>
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

        {/* MODAL RESUME VIEWER */}
        {showViewerModal && resumeFullUrl && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={() => setShowViewerModal(false)}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "960px",
                height: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid #E2E8F0",
                  background: "#F8FAFC"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>📄</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#0F172A", fontWeight: "700" }}>Uploaded PDF Resume</h3>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Live rendering from server storage</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <a
                    href={resumeFullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-btn-secondary"
                    style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px" }}
                  >
                    ↗️ Open in New Tab
                  </a>
                  <a
                    href={resumeFullUrl}
                    download="my_resume.pdf"
                    className="ai-btn-primary"
                    style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px" }}
                  >
                    📥 Download PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowViewerModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: "4px 8px"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: "#334155", position: "relative" }}>
                <iframe
                  src={resumeFullUrl}
                  title="Resume PDF Viewer"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AIResumeAnalysis;