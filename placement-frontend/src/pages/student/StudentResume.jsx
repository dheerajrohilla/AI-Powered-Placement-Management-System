import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI, getAssetUrl } from "../../services/api";

function StudentResume() {
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showViewerModal, setShowViewerModal] = useState(false);

  const loadResumeData = () => {
    studentAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error loading dashboard stats:", err));

    studentAPI.getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Error loading profile:", err));
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  const isNotResume = profile?.resumeProcessingStatus === 'rejected' ||
    profile?.resumeAnalysis?.isValidResume === false ||
    stats?.isValidResume === false;
  const atsScore = isNotResume ? 0 : (stats?.atsScore ?? profile?.atsScore ?? 0);
  const uploadedResume = profile?.resumeUrl || profile?.resume;
  const resumeFullUrl = getAssetUrl(uploadedResume);
  const hasResume = Boolean(resumeFullUrl);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setUploadMessage("");
    }
  };

  const handleUpload = async () => {
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput?.files[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isValidFormat = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx") || lowerName.endsWith(".doc") ||
      (file.type && (file.type.includes("pdf") || file.type.includes("word") || file.type.includes("officedocument")));
    if (!isValidFormat) {
      setUploadMessage("Please select a valid PDF (.pdf) or Word (.docx) resume file.");
      return;
    }

    setUploading(true);
    try {
      await studentAPI.uploadResume(file);
      setUploadMessage("✓ Resume validated, uploaded, and analyzed successfully.");
      setFileName("");
      if (fileInput) fileInput.value = "";
      loadResumeData();
    } catch (error) {
      const msg = error.response?.data?.error || "Resume upload failed.";
      setUploadMessage(`✕ ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="resume-page">

        <div className="resume-heading">
          <div>
            <h1>My Resume</h1>
            <p>Upload and manage your resume for placement opportunities.</p>
          </div>
        </div>

        <div className="resume-upload-card">
          <div className="upload-icon">📄</div>

          <h2>Upload Your Resume</h2>

          <p>
            Upload your latest resume in PDF or Word (DOCX) format.
          </p>

          <label className="upload-btn">
            Choose Resume
            <input
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {fileName && (
            <div>
              <div className="selected-file">
                <span>📎 {fileName}</span>
                <span className="file-status">Selected</span>
              </div>
              <button type="button" className="upload-btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          )}
          {uploadMessage && <p style={{ fontWeight: 600, color: uploadMessage.startsWith("✓") ? "#16a34a" : "#dc2626" }}>{uploadMessage}</p>}
        </div>

        <div className="resume-grid">

          <section className="resume-card">
            <h2>Resume Status</h2>

            <div className="resume-status">
              <div>
                <span>Status</span>
                <strong>
                  {hasResume ? "Resume Uploaded" : "No Resume Uploaded"}
                </strong>
              </div>

              <div>
                <span>Format</span>
                <strong>PDF</strong>
              </div>
            </div>
            {hasResume && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowViewerModal(true)}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    👁️ Preview Resume
                  </button>
                  <a
                    href={resumeFullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    ↗️ Open in New Tab
                  </a>
                  <a
                    href={resumeFullUrl}
                    download="my_resume.pdf"
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    📥 Download
                  </a>
                </div>
              </div>
            )}
          </section>

          <section className="resume-card">
            <h2>AI Resume Analysis</h2>

            <div className="ats-score">
              <div
                className="score-circle"
                style={isNotResume ? { borderColor: "#ef4444", color: "#ef4444", background: "#fef2f2" } : {}}
              >
                {atsScore}%
              </div>

              <div>
                <h3 style={isNotResume ? { color: "#dc2626" } : {}}>
                  {isNotResume
                    ? "Document Validation Failed (Not a Resume)"
                    : atsScore >= 80 ? "Excellent Resume" : atsScore >= 60 ? "Good Resume" : "Needs Improvement"}
                </h3>
                <p>
                  {isNotResume
                    ? "The uploaded document is not a valid resume. Upload a valid resume in PDF or DOCX format to calculate your ATS score."
                    : hasResume
                    ? "Real multi-factor ATS compatibility score."
                    : "Upload a resume to generate your real ATS score."}
                </p>
                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link to="/student/ats">
                    <button type="button" className="upload-btn" style={{ fontSize: "13px", padding: "8px 14px" }}>
                      🎯 Open Real ATS Checker
                    </button>
                  </Link>
                  <Link to="/student/skills">
                    <button type="button" className="upload-btn" style={{ fontSize: "13px", padding: "8px 14px", background: "#7c3aed" }}>
                      📊 Skill Analysis
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </div>

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
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "920px",
                height: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>📄</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>My Uploaded PDF Resume</h3>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Placement portal active resume</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <a
                    href={resumeFullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upload-btn"
                    style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                  >
                    ↗️ Open in New Tab
                  </a>
                  <a
                    href={resumeFullUrl}
                    download="my_resume.pdf"
                    className="upload-btn"
                    style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px", background: "#2563eb", color: "#ffffff" }}
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
                      color: "#64748b",
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

export default StudentResume;
