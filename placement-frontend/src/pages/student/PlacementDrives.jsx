import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";

function PlacementDrives() {
  const [applied, setApplied] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [profileStrength, setProfileStrength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState(null);

  // AI Application Assistant states
  const [assistantDrive, setAssistantDrive] = useState(null);
  const [assistantTab, setAssistantTab] = useState("summary"); // "summary" | "coverLetter" | "recruiterEmail"
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [driveSummaryData, setDriveSummaryData] = useState(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [recruiterSubject, setRecruiterSubject] = useState("");
  const [recruiterBody, setRecruiterBody] = useState("");
  const [assistantError, setAssistantError] = useState("");
  const [copiedToast, setCopiedToast] = useState("");

  useEffect(() => {
    studentAPI.getPlacementDrives()
      .then((response) => setJobs(response.data))
      .catch(() => setMessage("Unable to load placement drives."))
      .finally(() => setLoading(false));

    studentAPI.getApplications()
      .then((response) => {
        const ids = (response.data || [])
          .map((a) => a.placementDrive?._id || a.placementDrive)
          .filter(Boolean);
        setApplied(ids);
      })
      .catch(() => {});

    studentAPI.getDashboard()
      .then((response) => setProfileStrength(response.data?.profileStrength ?? null))
      .catch(() => {});
  }, []);

  const handleApply = async (id) => {
    try {
      const res = await studentAPI.applyForDrive(id);
      setApplied((current) =>
        current.includes(id) ? current : [...current, id]
      );
      const targetJob = jobs.find((j) => j._id === id);
      setSuccessNotice({
        companyName: targetJob?.company?.companyName || "Company",
        jobRole: targetJob?.jobRole || targetJob?.title || "Role",
        recipient: res.data?.emailNotification?.recipient,
        message: res.data?.emailNotification?.message || "Application submitted successfully! Check your registered email for test details.",
        driveId: id
      });
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to apply for this drive.");
    }
  };

  const openAssistant = async (job) => {
    setAssistantDrive(job);
    setAssistantTab("summary");
    setAssistantLoading(true);
    setAssistantError("");
    setCoverLetterText("");
    setRecruiterSubject("");
    setRecruiterBody("");
    try {
      const res = await studentAPI.summarizeDrive(job._id);
      setDriveSummaryData(res.data);
    } catch (err) {
      setAssistantError(err.response?.data?.error || "Could not load drive summary.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!assistantDrive) return;
    setAssistantLoading(true);
    setAssistantError("");
    try {
      const res = await studentAPI.generateCoverLetter({ driveId: assistantDrive._id });
      setCoverLetterText(res.data?.coverLetter || "");
    } catch (err) {
      setAssistantError(err.response?.data?.error || "Failed to generate cover letter.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleGenerateRecruiterEmail = async () => {
    if (!assistantDrive) return;
    setAssistantLoading(true);
    setAssistantError("");
    try {
      const res = await studentAPI.generateRecruiterEmail({ driveId: assistantDrive._id });
      setRecruiterSubject(res.data?.emailSubject || "");
      setRecruiterBody(res.data?.emailBody || "");
    } catch (err) {
      setAssistantError(err.response?.data?.error || "Failed to generate recruiter email.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToast("✓ Copied to clipboard!");
    setTimeout(() => setCopiedToast(""), 3000);
  };

  return (
    <DashboardLayout>
      <div className="drives-page">
        <div className="drives-heading">
          <div>
            <h1>Placement Drives</h1>
            <p>Explore companies and apply for suitable opportunities.</p>
          </div>
        </div>

        {successNotice && (
          <div style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
            border: "1px solid #86efac",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "22px" }}>📬</span>
                  <h3 style={{ margin: 0, color: "#166534", fontSize: "17px", fontWeight: 700 }}>
                    Application Submitted & Confirmation Email Dispatched!
                  </h3>
                  <span style={{ background: "#bbf7d0", color: "#14532d", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "12px" }}>
                    ✓ Email Sent
                  </span>
                </div>
                <p style={{ margin: "0 0 12px 0", color: "#15803d", fontSize: "14px", lineHeight: 1.5 }}>
                  You have successfully applied for <strong>{successNotice.companyName}</strong> ({successNotice.jobRole}). A confirmation email has been delivered to your registered email address <strong>{successNotice.recipient}</strong> with the official notice: <em style={{ fontWeight: 600 }}>"Get ready for the test! All the best!"</em>
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <Link to={`/student/company-prep/${successNotice.driveId}`} style={{ textDecoration: "none" }}>
                    <button className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px", background: "#16a34a", border: "none" }}>
                      🎯 Open {successNotice.companyName} Prep Mode
                    </button>
                  </Link>
                  <Link to={`/student/mock-interview?driveId=${successNotice.driveId}`} style={{ textDecoration: "none" }}>
                    <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                      🎙️ Take AI Mock Interview
                    </button>
                  </Link>
                  <Link to="/student/applications" style={{ textDecoration: "none" }}>
                    <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                      📋 View Application Status
                    </button>
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setSuccessNotice(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", padding: "4px" }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="drive-summary">
          <div><span>Available Drives</span><strong>{jobs.length}</strong></div>
          <div><span>Applications</span><strong>{applied.length}</strong></div>
          <div>
            <span>Profile Strength</span>
            <strong>{profileStrength !== null ? `${profileStrength}%` : "--"}</strong>
          </div>
        </div>

        <div className="drives-list">
          {loading && <p>Loading placement drives...</p>}
          {!loading && jobs.length === 0 && <p>{message || "No placement drives are available right now."}</p>}
          {message && jobs.length > 0 && <p>{message}</p>}

          {jobs.map((job) => (
            <div className="drive-card" key={job._id}>
              <div className="company-logo">{job.company?.companyName?.charAt(0) || "C"}</div>
              <div className="drive-main">
                <div className="drive-top">
                  <div>
                    <h2>{job.jobRole || job.title}</h2>
                    <h3>{job.company?.companyName || "Company"}</h3>
                  </div>
                  <span className="job-type">{job.jobType || "Full Time"}</span>
                </div>
                <div className="drive-details">
                  <span>Salary: ₹{job.salary?.toLocaleString() || "Not specified"}</span>
                  <span>Location: {job.location || "Not specified"}</span>
                  <span>Eligibility: CGPA {job.eligibility?.minCGPA || 0}+</span>
                </div>
                <div className="drive-skills">
                  <strong>Required Skills:</strong>
                  <span>{job.requirements?.join(", ") || "See job description"}</span>
                </div>
              </div>
              <div className="drive-action" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  className={applied.includes(job._id) ? "applied-btn" : "apply-btn"}
                  onClick={() => handleApply(job._id)}
                  disabled={applied.includes(job._id)}
                >
                  {applied.includes(job._id) ? "Applied" : "Apply Now"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => openAssistant(job)}
                  style={{ width: "100%", padding: "7px 12px", fontSize: "12px", background: "#f8fafc", color: "#4338ca", border: "1px solid #c7d2fe", fontWeight: 600 }}
                >
                  ✨ AI Application Kit
                </button>
                <Link to={`/student/company-prep/${job._id}`}>
                  <button className="btn-secondary" style={{ width: "100%", padding: "7px 12px", fontSize: "12px" }}>
                    🎯 Prep Mode
                  </button>
                </Link>
                <Link to={`/student/mock-interview?driveId=${job._id}`}>
                  <button className="btn-secondary" style={{ width: "100%", padding: "7px 12px", fontSize: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                    🎙️ Mock Interview
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI APPLICATION ASSISTANT MODAL */}
      {assistantDrive && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "750px",
            maxWidth: "100%",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>✨</span>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                    AI Application Assistant
                  </h3>
                  <span style={{ background: "rgba(255,255,255,0.2)", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>
                    Gemini Powered
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#c7d2fe" }}>
                  {assistantDrive.jobRole || assistantDrive.title} at {assistantDrive.company?.companyName || "Company"}
                </p>
              </div>
              <button
                onClick={() => setAssistantDrive(null)}
                style={{ background: "transparent", border: "none", color: "#c7d2fe", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{
              display: "flex",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
              padding: "0 24px"
            }}>
              <button
                onClick={() => setAssistantTab("summary")}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  borderBottom: assistantTab === "summary" ? "2px solid #4f46e5" : "2px solid transparent",
                  color: assistantTab === "summary" ? "#4f46e5" : "#64748b",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                📋 JD Summary & Alignment
              </button>
              <button
                onClick={() => {
                  setAssistantTab("coverLetter");
                  if (!coverLetterText) handleGenerateCoverLetter();
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  borderBottom: assistantTab === "coverLetter" ? "2px solid #4f46e5" : "2px solid transparent",
                  color: assistantTab === "coverLetter" ? "#4f46e5" : "#64748b",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                ✉️ Cover Letter
              </button>
              <button
                onClick={() => {
                  setAssistantTab("recruiterEmail");
                  if (!recruiterSubject) handleGenerateRecruiterEmail();
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  borderBottom: assistantTab === "recruiterEmail" ? "2px solid #4f46e5" : "2px solid transparent",
                  color: assistantTab === "recruiterEmail" ? "#4f46e5" : "#64748b",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                📬 Recruiter Email
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {copiedToast && (
                <div style={{
                  padding: "10px 14px",
                  background: "#ecfdf5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 600
                }}>
                  {copiedToast}
                </div>
              )}

              {assistantError && (
                <div style={{
                  padding: "12px 16px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px"
                }}>
                  {assistantError}
                </div>
              )}

              {assistantLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
                  <p style={{ margin: 0 }}>Consulting Gemini AI with verified drive details...</p>
                </div>
              ) : assistantTab === "summary" ? (
                <div>
                  <div style={{
                    padding: "16px",
                    background: "#f1f5f9",
                    borderRadius: "10px",
                    marginBottom: "18px"
                  }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", color: "#0f172a", fontWeight: 700 }}>
                      Verified Job Role Overview
                    </h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
                      {driveSummaryData?.overview || assistantDrive.description || "Campus hiring drive."}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div style={{
                      padding: "14px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0"
                    }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: "6px" }}>
                        ✅ Matching Skills
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(driveSummaryData?.matchingSkills || assistantDrive.requirements?.slice(0, 4) || []).map((s, idx) => (
                          <span key={idx} style={{ background: "#dcfce7", color: "#14532d", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      padding: "14px",
                      background: "#fef3c7",
                      borderRadius: "8px",
                      border: "1px solid #fde68a"
                    }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: "6px" }}>
                        ⚠️ Skills to Highlight / Learn
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(driveSummaryData?.skillGaps || []).length > 0 ? (
                          driveSummaryData.skillGaps.map((g, idx) => (
                            <span key={idx} style={{ background: "#fef9c3", color: "#854d0e", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                              + {g}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "#64748b" }}>Review drive prerequisites carefully.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {driveSummaryData?.recommendation && (
                    <div style={{
                      padding: "12px 16px",
                      background: "#eff6ff",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe",
                      fontSize: "13px",
                      color: "#1e40af"
                    }}>
                      <strong>💡 AI Recommendation: </strong> {driveSummaryData.recommendation}
                    </div>
                  )}
                </div>
              ) : assistantTab === "coverLetter" ? (
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px"
                  }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                      Personalized Cover Letter (Editable Draft):
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleGenerateCoverLetter}
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        onClick={() => copyToClipboard(coverLetterText)}
                        disabled={!coverLetterText}
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                      >
                        📋 Copy Letter
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={12}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    placeholder="Click regenerate or wait for Gemini to draft your tailored letter..."
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#1f2937"
                    }}
                  />
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#64748b" }}>
                    ℹ️ You can edit any details in the box above before copying or submitting. Drafts are never submitted automatically.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px"
                  }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                      Recruiter Outreach Email (Editable Draft):
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleGenerateRecruiterEmail}
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${recruiterSubject}\n\n${recruiterBody}`)}
                        disabled={!recruiterBody}
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                      >
                        📋 Copy Subject & Email
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>Subject Line:</div>
                    <input
                      type="text"
                      value={recruiterSubject}
                      onChange={(e) => setRecruiterSubject(e.target.value)}
                      placeholder="Email Subject Line"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "13px",
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>Email Body:</div>
                    <textarea
                      rows={9}
                      value={recruiterBody}
                      onChange={(e) => setRecruiterBody(e.target.value)}
                      placeholder="Email Body Content..."
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontFamily: "inherit",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        color: "#1f2937"
                      }}
                    />
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#64748b" }}>
                    ℹ️ Real emails are never sent automatically. Always review and personalize with the recruiter's actual contact info.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={() => setAssistantDrive(null)}
                className="btn-secondary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PlacementDrives;