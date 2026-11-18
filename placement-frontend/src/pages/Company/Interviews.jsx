import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI } from "../../services/api";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    placementDriveId: "",
    applicationId: "",
    title: "",
    round: "technical",
    scheduledDate: "",
    scheduledTime: "10:00",
    durationMinutes: 45,
    description: "",
    instructions: "Please ensure your camera and microphone are operational. Keep a quiet environment ready for coding assessments.",
    interviewer: "",
    interviewerEmail: ""
  });

  // Filter state
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "completed"

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await companyAPI.getInterviews();
      setInterviews(res.data || []);
    } catch (err) {
      console.error("Error loading company interviews:", err);
      setErrorMsg("Failed to load scheduled interviews.");
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = async () => {
    setIsModalOpen(true);
    setFormError("");
    try {
      setLoadingCandidates(true);
      const res = await companyAPI.getInterviewCandidates();
      setCandidates(res.data || []);
      if (res.data && res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          studentId: res.data[0].studentId,
          placementDriveId: res.data[0].placementDriveId || "",
          applicationId: res.data[0].applicationId || ""
        }));
      }
    } catch (err) {
      console.error("Failed to fetch interview candidates:", err);
      setFormError("Could not retrieve candidates list.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleCandidateChange = (e) => {
    const selectedId = e.target.value;
    const found = candidates.find((c) => String(c.studentId) === selectedId);
    setFormData((prev) => ({
      ...prev,
      studentId: selectedId,
      placementDriveId: found?.placementDriveId || "",
      applicationId: found?.applicationId || ""
    }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.studentId) {
      setFormError("Please select a candidate for the interview.");
      return;
    }
    if (!formData.scheduledDate) {
      setFormError("Please choose an interview date.");
      return;
    }

    try {
      setSubmitting(true);
      const dateTimeString = `${formData.scheduledDate}T${formData.scheduledTime || "10:00"}:00`;
      const fullDate = new Date(dateTimeString);

      const payload = {
        ...formData,
        scheduledDate: fullDate,
        mode: "virtual"
      };

      await companyAPI.scheduleInterview(payload);
      setSuccessMsg("Interview scheduled successfully! Virtual room created and candidate notified.");
      setIsModalOpen(false);
      fetchInterviews();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setFormError(err.response?.data?.error || "Failed to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const scheduledCount = interviews.filter((i) =>
    ["scheduled", "upcoming", "waiting", "in_progress"].includes((i.status || "").toLowerCase())
  ).length;

  const completedCount = interviews.filter((i) =>
    ["completed", "passed", "failed"].includes((i.status || "").toLowerCase())
  ).length;

  const upcomingInterviews = interviews.filter((i) =>
    ["scheduled", "upcoming", "waiting", "in_progress"].includes((i.status || "").toLowerCase())
  );

  const pastInterviews = interviews.filter((i) =>
    ["completed", "passed", "failed", "cancelled"].includes((i.status || "").toLowerCase())
  );

  const displayedList = activeTab === "upcoming" ? upcomingInterviews : pastInterviews;

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Virtual Interviews & Scheduling
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Conduct peer-to-peer WebRTC video screening, live coding interviews, and evaluate placement candidates.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={openScheduleModal}
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13.5px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
              }}
            >
              <span>📅</span>
              <span>Schedule Interview</span>
            </button>

            <Link
              to="/company/applicants"
              style={{
                background: "#f1f5f9",
                color: "#334155",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #e2e8f0"
              }}
            >
              <span>👥</span>
              <span>Applicants Pool</span>
            </Link>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div style={{ padding: "12px 18px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#166534", fontSize: "14px", fontWeight: 600 }}>
            ✅ {successMsg}
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
              Total Sessions
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {interviews.length}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Across all drives</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textTransform: "uppercase" }}>
              Upcoming / In Progress
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {scheduledCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Active virtual sessions</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669", textTransform: "uppercase" }}>
              Completed Interviews
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
              {completedCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Evaluations recorded</div>
          </div>
        </div>

        {/* TABS FOR SCHEDULED VS COMPLETED */}
        <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          <button
            onClick={() => setActiveTab("upcoming")}
            style={{
              background: activeTab === "upcoming" ? "#2563eb" : "transparent",
              color: activeTab === "upcoming" ? "#ffffff" : "#475569",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer"
            }}
          >
            📅 Scheduled & Upcoming ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              background: activeTab === "completed" ? "#2563eb" : "transparent",
              color: activeTab === "completed" ? "#ffffff" : "#475569",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer"
            }}
          >
            📋 Interview History ({pastInterviews.length})
          </button>
        </div>

        {/* INTERVIEW LIST */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading interview calendar...
          </div>
        ) : displayedList.length === 0 ? (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>
              {activeTab === "upcoming" ? "📅" : "📜"}
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              {activeTab === "upcoming" ? "No upcoming interviews scheduled" : "No interview history recorded yet"}
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              {activeTab === "upcoming"
                ? "Click 'Schedule Interview' above to set up a new virtual video assessment with a candidate."
                : "Completed interviews will appear here with timestamps and duration summaries."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedList.map((interview) => {
              const studentName = interview.student?.userId?.name || "Student Candidate";
              const studentEmail = interview.student?.userId?.email || "N/A";
              const studentPhone = interview.student?.userId?.phone || "";
              const role = interview.placementDrive?.jobRole || interview.placementDrive?.title || "Placement Role";
              const scheduledDate = interview.scheduledDate
                ? new Date(interview.scheduledDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                : "Date TBD";
              const scheduledTime = interview.scheduledTime || (interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time TBD");
              const duration = interview.durationMinutes ? `${interview.durationMinutes} mins` : "45 mins";
              const status = (interview.status || "scheduled").toLowerCase();
              const isVirtual = interview.mode !== "in_person";

              const roomUrl = `/interview/room/${interview._id}`;

              return (
                <div
                  key={interview._id}
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
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "17px"
                      }}
                    >
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        {studentName}
                      </h3>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {studentEmail} {studentPhone ? `• ${studentPhone}` : ""}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600, marginTop: "2px" }}>
                        {interview.title || `${interview.round || "Technical"} Round`} ({role})
                      </div>
                    </div>
                  </div>

                  {/* TIMING, DURATION & STATUS */}
                  <div style={{ display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Date & Time
                      </span>
                      <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                        📅 {scheduledDate}
                      </strong>
                      <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                        🕒 {scheduledTime} • ⏱️ {duration}
                      </div>
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Status
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          display: "inline-block",
                          marginTop: "2px",
                          background:
                            status === "completed" ? "#f0fdf4" :
                            status === "in_progress" ? "#ecfdf5" :
                            status === "waiting" ? "#eff6ff" :
                            status === "cancelled" ? "#fef2f2" : "#f8fafc",
                          color:
                            status === "completed" ? "#15803d" :
                            status === "in_progress" ? "#047857" :
                            status === "waiting" ? "#1d4ed8" :
                            status === "cancelled" ? "#b91c1c" : "#475569",
                          border: `1px solid ${
                            status === "completed" ? "#bbf7d0" :
                            status === "in_progress" ? "#a7f3d0" :
                            status === "waiting" ? "#bfdbfe" :
                            status === "cancelled" ? "#fecaca" : "#e2e8f0"
                          }`
                        }}
                      >
                        {status === "completed" && "✓ Completed"}
                        {status === "in_progress" && "🟢 In Progress"}
                        {status === "waiting" && "⏳ Waiting Room"}
                        {status === "scheduled" && "📅 Scheduled"}
                        {status === "upcoming" && "⏱️ Upcoming"}
                        {status === "cancelled" && "❌ Cancelled"}
                      </span>
                    </div>
                  </div>

                  {/* ACTION / JOIN VIRTUAL ROOM */}
                  <div>
                    {isVirtual ? (
                      status === "completed" ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                            ✓ Call Concluded
                          </span>
                          <Link
                            to={roomUrl}
                            style={{
                              fontSize: "12px",
                              color: "#2563eb",
                              textDecoration: "underline"
                            }}
                          >
                            View Room Summary
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={roomUrl}
                          style={{
                            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                            color: "#ffffff",
                            padding: "9px 18px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <span>📹</span>
                          <span>Join Virtual Interview</span>
                        </Link>
                      )
                    ) : (
                      <span style={{ fontSize: "13px", color: "#475569", background: "#f8fafc", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        📍 {interview.location || "Campus Venue TBD"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SCHEDULE INTERVIEW MODAL */}
        {isModalOpen && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Schedule Virtual Interview
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#991b1b", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* CANDIDATE SELECTION */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Select Candidate *
                  </label>
                  {loadingCandidates ? (
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Loading candidates list...</div>
                  ) : candidates.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "#dc2626" }}>
                      No registered candidates available.
                    </div>
                  ) : (
                    <select
                      value={formData.studentId}
                      onChange={handleCandidateChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        background: "#ffffff"
                      }}
                    >
                      {candidates.map((cand) => (
                        <option key={cand.studentId} value={cand.studentId}>
                          {cand.name} ({cand.email}) — {cand.driveTitle || "Campus Applicant"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* TITLE & ROUND */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Interview Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Round 1: DSA & Problem Solving"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Round Type
                    </label>
                    <select
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        background: "#ffffff"
                      }}
                    >
                      <option value="technical">Technical Screening</option>
                      <option value="coding">Live Coding & Architecture</option>
                      <option value="hr">HR & Cultural Fit</option>
                      <option value="managerial">Managerial Round</option>
                      <option value="final">Final Executive Round</option>
                    </select>
                  </div>
                </div>

                {/* DATE, TIME & DURATION */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Interview Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Duration
                    </label>
                    <select
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        background: "#ffffff"
                      }}
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Interview Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief agenda of topics, technologies to cover, and expected depth..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* INSTRUCTIONS */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Candidate Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific setup requirements, live code sharing instructions..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* WEBRTC NOTICE */}
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#1e40af" }}>
                  🔒 <strong>WebRTC Virtual Room:</strong> A unique peer-to-peer room will be automatically created. Both you and the candidate will receive full access links and dynamic email notifications.
                </div>

                {/* MODAL ACTIONS */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "9px 24px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
                    }}
                  >
                    {submitting ? "Scheduling Session..." : "Confirm Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default Interviews;
