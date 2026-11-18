import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";

const formatDate = (value) => {
  if (!value) return "Date TBD";
  return new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = (value, interview) => {
  if (interview?.scheduledTime) return interview.scheduledTime;
  if (!value) return "Time TBD";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusBadge = (status) => {
  const s = (status || "scheduled").toLowerCase();
  switch (s) {
    case "in_progress":
      return { text: "🟢 In Progress", bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
    case "waiting":
      return { text: "⏳ Waiting Room", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    case "completed":
    case "passed":
      return { text: "✓ Completed", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
    case "cancelled":
    case "failed":
      return { text: "❌ Cancelled", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
    case "upcoming":
      return { text: "⏱️ Upcoming", bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
    case "scheduled":
    default:
      return { text: "📅 Scheduled", bg: "#f8fafc", color: "#334155", border: "#e2e8f0" };
  }
};

function StudentInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "history"

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getInterviews();
      setInterviews(res.data || []);
    } catch (err) {
      console.error("Error loading student interviews:", err);
      setMessage("Unable to load your interviews.");
    } finally {
      setLoading(false);
    }
  };

  const isCompletedOrCancelled = (interview) => {
    const s = (interview.status || "").toLowerCase();
    return s === "completed" || s === "cancelled" || s === "passed" || s === "failed";
  };

  const sorted = [...interviews].sort(
    (a, b) => new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0)
  );

  const upcomingInterviews = sorted.filter((i) => !isCompletedOrCancelled(i));
  const completedInterviews = sorted.filter((i) => isCompletedOrCancelled(i)).reverse();

  const nextInterview = upcomingInterviews[0];
  const displayedList = activeTab === "upcoming" ? upcomingInterviews : completedInterviews;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              My Interviews
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Join scheduled virtual interviews, review recruiter instructions, and track evaluation outcomes.
            </p>
          </div>
        </div>

        {/* FEATURED NEXT UPCOMING INTERVIEW HERO CARD */}
        {!loading && nextInterview && activeTab === "upcoming" && (
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            color: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              display: "inline-block",
              background: "rgba(56, 189, 248, 0.2)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "16px"
            }}>
              ⭐ Next Scheduled Session
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)"
                }}>
                  {nextInterview.company?.companyName?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#f8fafc" }}>
                    {nextInterview.title || `${nextInterview.round || "Technical"} Interview`}
                  </h2>
                  <div style={{ fontSize: "14px", color: "#38bdf8", fontWeight: 600, marginTop: "2px" }}>
                    {nextInterview.company?.companyName} • {nextInterview.placementDrive?.jobRole || nextInterview.placementDrive?.title || "Recruitment Drive"}
                  </div>
                </div>
              </div>

              {/* ACTION: JOIN VIRTUAL ROOM BUTTON */}
              <div>
                <Link
                  to={`/interview/room/${nextInterview._id}`}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    padding: "12px 26px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  <span>📹</span>
                  <span>Join Virtual Interview</span>
                </Link>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                  📅 Scheduled Date
                </span>
                <strong style={{ fontSize: "14px", color: "#f8fafc", marginTop: "2px", display: "block" }}>
                  {formatDate(nextInterview.scheduledDate)}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                  🕒 Scheduled Time
                </span>
                <strong style={{ fontSize: "14px", color: "#f8fafc", marginTop: "2px", display: "block" }}>
                  {formatTime(nextInterview.scheduledDate, nextInterview)} ({nextInterview.timeZone || "Asia/Kolkata"})
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                  ⏱️ Estimated Duration
                </span>
                <strong style={{ fontSize: "14px", color: "#f8fafc", marginTop: "2px", display: "block" }}>
                  {nextInterview.durationMinutes ? `${nextInterview.durationMinutes} Minutes` : "45 Minutes"}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                  👨‍💼 Panel / Interviewer
                </span>
                <strong style={{ fontSize: "14px", color: "#f8fafc", marginTop: "2px", display: "block" }}>
                  {nextInterview.interviewer || "Technical Evaluation Panel"}
                </strong>
              </div>
            </div>

            {/* INSTRUCTIONS PREVIEW */}
            {nextInterview.instructions && (
              <div style={{
                marginTop: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "12.5px",
                color: "#cbd5e1"
              }}>
                💬 <strong>Candidate Instructions:</strong> {nextInterview.instructions}
              </div>
            )}
          </div>
        )}

        {/* TABS */}
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
            📅 Upcoming & Active ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              background: activeTab === "history" ? "#2563eb" : "transparent",
              color: activeTab === "history" ? "#ffffff" : "#475569",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer"
            }}
          >
            📜 Completed Interview History ({completedInterviews.length})
          </button>
        </div>

        {/* LIST SECTION */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading your placement interviews...
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
              {activeTab === "upcoming" ? "No upcoming interviews" : "No interview history yet"}
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              {activeTab === "upcoming"
                ? "When companies shortlist your profile and schedule rounds, they will appear here with live virtual room links."
                : "Completed interviews and assessment records will be preserved here."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedList.map((interview) => {
              const companyName = interview.company?.companyName || "Recruiter";
              const title = interview.title || `${interview.round || "Technical"} Interview`;
              const role = interview.placementDrive?.jobRole || interview.placementDrive?.title || "Campus Placement";
              const dateStr = formatDate(interview.scheduledDate);
              const timeStr = formatTime(interview.scheduledDate, interview);
              const durationStr = interview.durationMinutes ? `${interview.durationMinutes} mins` : "45 mins";
              const badge = getStatusBadge(interview.status);
              const isPast = isCompletedOrCancelled(interview);
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
                  {/* COMPANY & TITLE */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "260px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "18px"
                    }}>
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        {title}
                      </h3>
                      <div style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>
                        {companyName} • {role}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Round: {interview.round || "Technical"}
                      </div>
                    </div>
                  </div>

                  {/* TIMING & DURATION */}
                  <div style={{ display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Schedule
                      </span>
                      <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                        📅 {dateStr}
                      </strong>
                      <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                        🕒 {timeStr} • ⏱️ {durationStr}
                      </div>
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Status
                      </span>
                      <span style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        display: "inline-block",
                        marginTop: "2px",
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      onClick={() => setSelectedInterview(interview)}
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      ℹ️ Details
                    </button>

                    {isPast ? (
                      <Link
                        to={roomUrl}
                        style={{
                          background: "#f8fafc",
                          color: "#64748b",
                          border: "1px solid #e2e8f0",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          textDecoration: "none"
                        }}
                      >
                        Room Summary
                      </Link>
                    ) : (
                      <Link
                        to={roomUrl}
                        style={{
                          background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                          color: "#ffffff",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)"
                        }}
                      >
                        <span>📹</span>
                        <span>Join Interview</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INTERVIEW DETAILS MODAL */}
        {selectedInterview && (
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
              maxWidth: "540px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Interview Session Details
                </h3>
                <button
                  onClick={() => setSelectedInterview(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13.5px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                    Interview Title
                  </span>
                  <strong style={{ color: "#0f172a" }}>
                    {selectedInterview.title || `${selectedInterview.round || "Technical"} Round`}
                  </strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                    Company & Position
                  </span>
                  <div style={{ color: "#2563eb", fontWeight: 600 }}>
                    {selectedInterview.company?.companyName} • {selectedInterview.placementDrive?.jobRole || selectedInterview.placementDrive?.title || "Recruitment Drive"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                      Date & Time
                    </span>
                    <strong style={{ color: "#0f172a" }}>
                      {formatDate(selectedInterview.scheduledDate)} at {formatTime(selectedInterview.scheduledDate, selectedInterview)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                      Duration
                    </span>
                    <strong style={{ color: "#0f172a" }}>
                      {selectedInterview.durationMinutes ? `${selectedInterview.durationMinutes} Minutes` : "45 Minutes"}
                    </strong>
                  </div>
                </div>

                {selectedInterview.description && (
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                      Description
                    </span>
                    <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155" }}>
                      {selectedInterview.description}
                    </div>
                  </div>
                )}

                {selectedInterview.instructions && (
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                      Recruiter Instructions
                    </span>
                    <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "8px", border: "1px solid #bfdbfe", color: "#1e40af" }}>
                      {selectedInterview.instructions}
                    </div>
                  </div>
                )}

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 600 }}>
                    Interviewer
                  </span>
                  <strong style={{ color: "#0f172a" }}>
                    {selectedInterview.interviewer || "Technical Panel"}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  onClick={() => setSelectedInterview(null)}
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
                  Close
                </button>

                {!isCompletedOrCancelled(selectedInterview) && (
                  <Link
                    to={`/interview/room/${selectedInterview._id}`}
                    style={{
                      background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                      color: "#ffffff",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "13px",
                      textDecoration: "none"
                    }}
                  >
                    Join Room Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StudentInterviews;
