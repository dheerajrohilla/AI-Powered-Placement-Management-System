import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI, getAssetUrl } from "../../services/api";

function Applicants() {
  const [searchParams] = useSearchParams();
  const driveFilterParam = searchParams.get("driveId");

  const [applicants, setApplicants] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(driveFilterParam || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal states
  const [viewCandidate, setViewCandidate] = useState(null);
  const [interviewModal, setInterviewModal] = useState(null); // application object
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: "",
    scheduledTime: "10:00",
    round: "Technical Interview Round 1",
    mode: "virtual",
    joinLink: "",
    location: "Google Meet",
    timeZone: "Asia/Kolkata"
  });
  const [submittingInterview, setSubmittingInterview] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [appRes, driveRes] = await Promise.all([
        companyAPI.getApplicants(),
        companyAPI.getDrives()
      ]);
      setApplicants(appRes.data || []);
      setDrives(driveRes.data || []);
    } catch (err) {
      console.error("Error loading applicants:", err);
      setErrorMsg("Failed to load candidate applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus, feedbackText = "") => {
    try {
      setMessage("");
      setErrorMsg("");
      const response = await companyAPI.updateApplicationStatus(id, newStatus, feedbackText);
      setApplicants((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: response.data.status } : app))
      );
      setMessage(`Candidate status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
      if (viewCandidate && viewCandidate._id === id) {
        setViewCandidate({ ...viewCandidate, status: response.data.status });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update candidate status.");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModal) return;

    try {
      setSubmittingInterview(true);
      setErrorMsg("");

      const combinedDateTime = new Date(`${interviewForm.scheduledDate}T${interviewForm.scheduledTime}:00`);

      await companyAPI.scheduleInterview({
        applicationId: interviewModal._id,
        scheduledDate: combinedDateTime,
        round: interviewForm.round,
        mode: interviewForm.mode,
        joinLink: interviewForm.joinLink,
        location: interviewForm.mode === "virtual" ? (interviewForm.joinLink || "Online Meeting") : interviewForm.location,
        timeZone: interviewForm.timeZone
      });

      // Update local state to interview_scheduled
      setApplicants((prev) =>
        prev.map((a) => (a._id === interviewModal._id ? { ...a, status: "interview_scheduled" } : a))
      );

      setMessage(`Interview successfully scheduled for ${interviewModal.student?.userId?.name || "Candidate"}. Notification sent!`);
      setInterviewModal(null);
    } catch (err) {
      console.error("Schedule error:", err);
      setErrorMsg(err.response?.data?.error || "Failed to schedule interview.");
    } finally {
      setSubmittingInterview(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Candidate Name", "Email", "Drive Role", "CGPA", "ATS Score", "Status", "Applied Date"]
    ];

    filteredApplicants.forEach((a) => {
      rows.push([
        a.student?.userId?.name || "N/A",
        a.student?.userId?.email || "N/A",
        a.placementDrive?.jobRole || a.placementDrive?.title || "N/A",
        a.student?.cgpa ?? "N/A",
        a.student?.atsScore ?? "N/A",
        a.status || "N/A",
        a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "N/A"
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `applicants_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApplicants = applicants.filter((app) => {
    // Drive filter
    if (selectedDrive !== "all") {
      const driveId = app.placementDrive?._id || app.placementDrive;
      if (driveId !== selectedDrive) return false;
    }
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (app.student?.userId?.name || "").toLowerCase();
      const email = (app.student?.userId?.email || "").toLowerCase();
      const role = (app.placementDrive?.jobRole || app.placementDrive?.title || "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "selected":
        return { label: "Selected / Offered", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "interview_scheduled":
        return { label: "Interview Scheduled", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" };
      case "shortlisted":
        return { label: "Shortlisted", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "under_review":
        return { label: "Under Review", bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
      case "rejected":
        return { label: "Rejected", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
      default:
        return { label: "Applied", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Candidate Talent Pipeline
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Screen student profiles, evaluate ATS resumes, advance applicants, and schedule interview rounds.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={exportCSV}
              disabled={filteredApplicants.length === 0}
              style={{
                background: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: filteredApplicants.length === 0 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTICES */}
        {message && (
          <div style={{ padding: "12px 18px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", color: "#065f46", fontSize: "14px", fontWeight: 600 }}>
            ✓ {message}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "12px 18px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#991b1b", fontSize: "14px", fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* FILTER & SEARCH BAR */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "16px 20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            <div style={{ minWidth: "200px" }}>
              <input
                type="text"
                placeholder="Search candidates, skills, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px"
                }}
              />
            </div>

            <select
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
                color: "#334155"
              }}
            >
              <option value="all">All Placement Drives</option>
              {drives.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.jobRole || d.title} (₹{(d.salary / 100000).toFixed(1)} LPA)
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
                color: "#334155"
              }}
            >
              <option value="all">All Stages</option>
              <option value="applied">Applied / Pending Review</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Selected / Offered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
            Showing {filteredApplicants.length} of {applicants.length} candidates
          </div>
        </div>

        {/* CANDIDATES TABLE / LIST */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading candidate pipeline...
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              No candidates matching current criteria
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              Try adjusting your drive or stage filters above.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredApplicants.map((app) => {
              const name = app.student?.userId?.name || "Student Candidate";
              const email = app.student?.userId?.email || "N/A";
              const role = app.placementDrive?.jobRole || app.placementDrive?.title || "Role";
              const cgpa = app.student?.cgpa ?? "N/A";
              const ats = app.student?.atsScore ?? null;
              const skills = app.student?.skills || [];
              const resumeUrl = getAssetUrl(app.student?.resume || app.student?.resumeUrl);
              const badge = getStatusBadge(app.status);

              return (
                <div
                  key={app._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px 24px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "18px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                  }}
                >
                  {/* CANDIDATE INFO */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "260px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "16px",
                        flexShrink: 0
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        {name}
                      </h3>
                      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                        {email}
                      </div>
                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginTop: "2px" }}>
                        Applied for: {role}
                      </div>
                    </div>
                  </div>

                  {/* ACADEMICS & ATS */}
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        CGPA
                      </span>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                        {cgpa}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        ATS Fit
                      </span>
                      {ats != null ? (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            background: ats >= 75 ? "#ecfdf5" : "#eff6ff",
                            color: ats >= 75 ? "#059669" : "#2563eb",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {ats}%
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>N/A</span>
                      )}
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Stage
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "10px",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          padding: "7px 12px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          textDecoration: "none",
                          border: "1px solid #cbd5e1"
                        }}
                      >
                        📄 Resume
                      </a>
                    )}

                    <button
                      onClick={() => setViewCandidate(app)}
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        border: "1px solid #bfdbfe",
                        cursor: "pointer"
                      }}
                    >
                      Profile
                    </button>

                    {/* STAGE ADVANCEMENT BUTTONS */}
                    {app.status !== "shortlisted" && app.status !== "interview_scheduled" && app.status !== "selected" && (
                      <button
                        onClick={() => updateStatus(app._id, "shortlisted")}
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Shortlist ✓
                      </button>
                    )}

                    {(app.status === "shortlisted" || app.status === "interview_scheduled") && (
                      <button
                        onClick={() => {
                          setInterviewModal(app);
                          setInterviewForm({
                            ...interviewForm,
                            round: `${role} - Technical Round`
                          });
                        }}
                        style={{
                          background: "#7c3aed",
                          color: "#ffffff",
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        📅 Schedule Interview
                      </button>
                    )}

                    {app.status === "interview_scheduled" && (
                      <button
                        onClick={() => updateStatus(app._id, "selected")}
                        style={{
                          background: "#10b981",
                          color: "#ffffff",
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        🎉 Select / Offer
                      </button>
                    )}

                    {app.status !== "rejected" && app.status !== "selected" && (
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        style={{
                          background: "#ffffff",
                          color: "#dc2626",
                          padding: "7px 12px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          border: "1px solid #fecaca",
                          cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CANDIDATE PROFILE MODAL */}
        {viewCandidate && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                maxWidth: "640px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    {viewCandidate.student?.userId?.name || "Student Candidate"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    {viewCandidate.student?.userId?.email || "No email"} • Roll: {viewCandidate.student?.rollNumber || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setViewCandidate(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px", background: "#f8fafc", padding: "14px", borderRadius: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Department</span>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>{viewCandidate.student?.department || "General"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>CGPA</span>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>{viewCandidate.student?.cgpa ?? "N/A"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>ATS Score</span>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#2563eb" }}>{viewCandidate.student?.atsScore != null ? `${viewCandidate.student.atsScore}%` : "Not evaluated"}</div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: "8px" }}>
                  Verified Skills
                </h4>
                {viewCandidate.student?.skills && viewCandidate.student.skills.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {viewCandidate.student.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>No extracted skills recorded.</p>
                )}
              </div>

              {viewCandidate.student?.resume && (
                <div style={{ marginBottom: "24px" }}>
                  <a
                    href={getAssetUrl(viewCandidate.student.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#2563eb",
                      color: "#ffffff",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 600
                    }}
                  >
                    <span>📄</span>
                    <span>Download Full Resume</span>
                  </a>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setViewCandidate(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEW SCHEDULING MODAL */}
        {interviewModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <form
              onSubmit={handleScheduleInterview}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                maxWidth: "520px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Schedule Interview Round
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    Candidate: {interviewModal.student?.userId?.name || "Candidate"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInterviewModal(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                    Interview Round Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={interviewForm.round}
                    onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={interviewForm.scheduledDate}
                      onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={interviewForm.scheduledTime}
                      onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                    Interview Mode
                  </label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#ffffff" }}
                  >
                    <option value="virtual">Virtual (Online Video Call)</option>
                    <option value="in_person">In-Person (On-Campus)</option>
                    <option value="telephonic">Telephonic Screening</option>
                  </select>
                </div>

                {interviewForm.mode === "virtual" ? (
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                      Meeting Link (Google Meet / Zoom / Teams)
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xyz-abc-def"
                      value={interviewForm.joinLink}
                      onChange={(e) => setInterviewForm({ ...interviewForm, joinLink: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                      Physical Location / Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Placement Cell Interview Room 3"
                      value={interviewForm.location}
                      onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setInterviewModal(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingInterview}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: submittingInterview ? "not-allowed" : "pointer"
                  }}
                >
                  {submittingInterview ? "Scheduling..." : "Confirm & Notify Candidate"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default Applicants;