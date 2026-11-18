import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI, getAssetUrl } from "../../services/api";

function Shortlisted() {
  const [shortlistedStudents, setShortlistedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewModal, setInterviewModal] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: "",
    scheduledTime: "11:00",
    round: "Technical Interview Round 1",
    mode: "virtual",
    joinLink: "",
    location: "Google Meet",
    timeZone: "Asia/Kolkata"
  });
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getShortlisted();
      setShortlistedStudents(res.data || []);
    } catch (err) {
      console.error("Error loading shortlisted students:", err);
      setErrorMsg("Failed to load shortlisted candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModal) return;

    try {
      setScheduling(true);
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

      setMessage(`Interview successfully scheduled for ${interviewModal.student?.userId?.name || "Candidate"}!`);
      setInterviewModal(null);
      fetchShortlisted();
    } catch (err) {
      console.error("Schedule interview error:", err);
      setErrorMsg(err.response?.data?.error || "Failed to schedule interview.");
    } finally {
      setScheduling(false);
    }
  };

  const totalShortlisted = shortlistedStudents.length;
  const avgAts = totalShortlisted > 0
    ? Math.round(shortlistedStudents.reduce((sum, s) => sum + (s.student?.atsScore || 0), 0) / totalShortlisted)
    : 0;

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Shortlisted Talent
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              High-potential candidates approved for technical screening and formal interview panels.
            </p>
          </div>

          <Link
            to="/company/applicants"
            style={{
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1",
              padding: "9px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none"
            }}
          >
            ← View All Applicants
          </Link>
        </div>

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

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Shortlisted
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {totalShortlisted}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Qualified for interviews</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Average ATS Score
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
              {avgAts}%
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Average resume match</div>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading shortlisted candidates...
          </div>
        ) : shortlistedStudents.length === 0 ? (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⭐</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              No candidates shortlisted yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              Visit the <Link to="/company/applicants" style={{ color: "#2563eb", fontWeight: 600 }}>Applicants Pipeline</Link> to screen resumes and shortlist candidates.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {shortlistedStudents.map((app) => {
              const name = app.student?.userId?.name || "Student Candidate";
              const email = app.student?.userId?.email || "N/A";
              const role = app.placementDrive?.jobRole || app.placementDrive?.title || "Role";
              const cgpa = app.student?.cgpa ?? "N/A";
              const ats = app.student?.atsScore ?? null;
              const skills = app.student?.skills || [];
              const resumeUrl = getAssetUrl(app.student?.resume || app.student?.resumeUrl);

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
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "260px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "16px"
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        {name}
                      </h3>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>{email}</div>
                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginTop: "2px" }}>
                        Drive: {role}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>CGPA</span>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{cgpa}</strong>
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>ATS Score</span>
                      <strong style={{ fontSize: "14px", color: "#059669" }}>{ats != null ? `${ats}%` : "N/A"}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "none",
                          border: "1px solid #cbd5e1"
                        }}
                      >
                        📄 Resume
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedCandidate(app)}
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: "1px solid #bfdbfe",
                        cursor: "pointer"
                      }}
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setInterviewModal(app);
                        setInterviewForm({
                          ...interviewForm,
                          round: `${role} - Technical Interview`
                        });
                      }}
                      style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(124, 58, 237, 0.25)"
                      }}
                    >
                      📅 Schedule Interview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE MODAL */}
        {selectedCandidate && (
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
                maxWidth: "600px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    {selectedCandidate.student?.userId?.name || "Student Candidate"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    {selectedCandidate.student?.userId?.email} • Department: {selectedCandidate.student?.department || "General"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: "8px" }}>
                  Skills
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(selectedCandidate.student?.skills || []).map((s, i) => (
                    <span key={i} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "6px", fontSize: "12px" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  style={{ background: "#f1f5f9", color: "#475569", padding: "9px 18px", borderRadius: "8px", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEW MODAL */}
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
                maxWidth: "500px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Schedule Interview
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    Candidate: {interviewModal.student?.userId?.name}
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
                    Round Title *
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
                    Mode
                  </label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#ffffff" }}
                  >
                    <option value="virtual">Virtual (Video Meeting)</option>
                    <option value="in_person">In-Person (On-Campus)</option>
                    <option value="telephonic">Telephonic Screening</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                    {interviewForm.mode === "virtual" ? "Video Link (Meet / Teams / Zoom)" : "Room / Location"}
                  </label>
                  <input
                    type="text"
                    placeholder={interviewForm.mode === "virtual" ? "https://meet.google.com/..." : "Placement Cell Cabin 2"}
                    value={interviewForm.mode === "virtual" ? interviewForm.joinLink : interviewForm.location}
                    onChange={(e) => {
                      if (interviewForm.mode === "virtual") {
                        setInterviewForm({ ...interviewForm, joinLink: e.target.value });
                      } else {
                        setInterviewForm({ ...interviewForm, location: e.target.value });
                      }
                    }}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setInterviewModal(null)}
                  style={{ background: "#f1f5f9", color: "#475569", padding: "9px 16px", borderRadius: "8px", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: scheduling ? "not-allowed" : "pointer"
                  }}
                >
                  {scheduling ? "Scheduling..." : "Confirm & Schedule"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default Shortlisted;