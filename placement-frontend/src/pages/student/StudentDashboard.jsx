import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { studentAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [readinessSummary, setReadinessSummary] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Unable to load dashboard:", error));

    studentAPI.getPlacementDrives()
      .then((response) => setDrives(response.data || []))
      .catch((error) => console.error("Unable to load drives:", error));

    studentAPI.getInterviews()
      .then((response) => setInterviews(response.data || []))
      .catch((error) => console.error("Unable to load interviews:", error));

    studentAPI.getAiReadinessSummary()
      .then((response) => setReadinessSummary(response.data))
      .catch((error) => console.error("Unable to load AI readiness summary:", error))
      .finally(() => setReadinessLoading(false));
  }, []);

  const readinessScore = readinessSummary?.readinessScore ?? stats?.atsScore ?? 0;
  const readinessTier = readinessSummary?.readinessTier || (readinessScore >= 80 ? "Placement Ready" : readinessScore >= 60 ? "Developing" : "Needs Attention");

  // Determine accent color for score
  const scoreColor = readinessScore >= 80 ? "#10B981" : readinessScore >= 60 ? "#38BDF8" : "#F59E0B";

  return (
    <DashboardLayout>
      {/* TOP GREETING & COMMAND BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
              Welcome back, {user?.name || "Student"}!
            </h1>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "#ECFDF5",
              color: "#059669",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "700",
              border: "1px solid #A7F3D0"
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
              Active Season 2026
            </span>
          </div>
          <p style={{ color: "#64748B", fontSize: "14px", margin: 0 }}>
            Your real-time AI placement command center and career progression dashboard.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/student/ats" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.25)",
              transition: "all 0.2s"
            }}>
              🎯 Run ATS Audit
            </button>
          </Link>
          <Link to="/student/study-material" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(135deg, #059669, #10B981)",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
              transition: "all 0.2s"
            }}>
              📚 Study Material
            </button>
          </Link>
          <Link to="/student/quiz" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 10px rgba(124, 58, 237, 0.25)",
              transition: "all 0.2s"
            }}>
              📝 Subject Quizzes
            </button>
          </Link>
          <Link to="/student/chatbot" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#0F172A",
              color: "#F8FAFC",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
              transition: "all 0.2s"
            }}>
              💬 Ask AI Copilot
            </button>
          </Link>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="stats-grid">
        <StatCard
          title="ATS Score"
          value={stats ? `${stats.atsScore}%` : "--"}
          icon="🎯"
          description="Resume ATS Compatibility"
        />
        <StatCard
          title="Applications"
          value={stats ? stats.applications : "--"}
          icon="📋"
          description="Total active applications"
        />
        <StatCard
          title="Interviews"
          value={stats ? stats.interviews : "--"}
          icon="📅"
          description="Scheduled interviews"
        />
        <StatCard
          title="Profile Strength"
          value={stats ? `${stats.profileStrength}%` : "--"}
          icon="👤"
          description="Overall profile completeness"
        />
      </div>

      {/* AI PLACEMENT-READINESS COMMAND CENTER (HERO) */}
      <div style={{
        margin: "24px 0",
        padding: "28px 32px",
        background: "radial-gradient(ellipse at 85% 15%, rgba(99, 102, 241, 0.2) 0%, transparent 60%), linear-gradient(135deg, #0B0F19 0%, #111827 50%, #0F172A 100%)",
        borderRadius: "20px",
        color: "#FFFFFF",
        boxShadow: "0 20px 35px -10px rgba(11, 15, 25, 0.5), 0 0 20px rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow ambient background element */}
        <div style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "240px",
          height: "240px",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }} />

        {/* Header line with badge and status */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
          position: "relative",
          zIndex: 1
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "22px" }}>⚡</span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#F8FAFC", letterSpacing: "-0.3px" }}>
                AI Placement-Readiness Command Center
              </h2>
              <span style={{
                background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                boxShadow: "0 0 10px rgba(59, 130, 246, 0.4)"
              }}>
                Gemini Intelligence
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0, maxWidth: "680px" }}>
              Continuously calibrated against verified assessment performance, real ATS audit criteria, and target company profiles.
            </p>
          </div>

          {/* Radial score gauge indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
            padding: "10px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                Readiness Tier
              </div>
              <div style={{ fontSize: "14px", color: scoreColor, fontWeight: 800 }}>
                {readinessTier}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `conic-gradient(${scoreColor} ${readinessScore}%, rgba(255, 255, 255, 0.1) 0%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${scoreColor}40`
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 800,
                color: "#FFFFFF"
              }}>
                {readinessScore}%
              </div>
            </div>
          </div>
        </div>

        {readinessLoading ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "#94A3B8" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            <p style={{ margin: 0, fontSize: "14px" }}>Synthesizing real placement metrics, ATS audit & skill matches...</p>
          </div>
        ) : readinessSummary ? (
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Executive brief callout */}
            {readinessSummary.headline && (
              <div style={{
                background: "rgba(56, 189, 248, 0.08)",
                borderLeft: "4px solid #38BDF8",
                padding: "14px 18px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#E2E8F0"
              }}>
                <strong style={{ color: "#38BDF8" }}>Executive Brief: </strong>
                {readinessSummary.headline}
              </div>
            )}

            {/* Strengths & Skill Gaps Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "18px"
            }}>
              {/* Verified Strengths */}
              <div style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "16px",
                borderRadius: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.5px" }}>
                  <span>✓</span> Verified Strengths
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(readinessSummary.strengths || []).map((s, idx) => (
                    <span key={idx} style={{
                      background: "rgba(16, 185, 129, 0.18)",
                      color: "#A7F3D0",
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}>
                      ✓ {s}
                    </span>
                  ))}
                  {(!readinessSummary.strengths || readinessSummary.strengths.length === 0) && (
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>Complete assessments to record verified strengths.</span>
                  )}
                </div>
              </div>

              {/* Critical Skill Gaps */}
              <div style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                padding: "16px",
                borderRadius: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, color: "#FBBF24", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.5px" }}>
                  <span>⚡</span> High-Impact Skill Gaps
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(readinessSummary.criticalSkillGaps || []).map((g, idx) => (
                    <span key={idx} style={{
                      background: "rgba(245, 158, 11, 0.18)",
                      color: "#FDE68A",
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      border: "1px solid rgba(245, 158, 11, 0.3)"
                    }}>
                      ⚡ {g}
                    </span>
                  ))}
                  {(!readinessSummary.criticalSkillGaps || readinessSummary.criticalSkillGaps.length === 0) && (
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>No critical skill gaps flagged.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Trend & Next Action */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "16px"
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "14px 18px",
                borderRadius: "12px",
                fontSize: "13px"
              }}>
                <span style={{ color: "#94A3B8", fontWeight: 700, display: "block", marginBottom: "4px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📈 Performance Trajectory
                </span>
                <span style={{ color: "#E2E8F0", lineHeight: 1.5 }}>
                  {readinessSummary.recentTrend || "Trending steadily across campus benchmarks."}
                </span>
              </div>

              <div style={{
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "14px 18px",
                borderRadius: "12px",
                fontSize: "13px"
              }}>
                <span style={{ color: "#60A5FA", fontWeight: 800, display: "block", marginBottom: "4px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🎯 Recommended Next Action
                </span>
                <span style={{ color: "#F8FAFC", fontWeight: 500, lineHeight: 1.5 }}>
                  {readinessSummary.recommendedNextAction || "Run a real ATS audit on your latest resume to verify keyword alignment."}
                </span>
              </div>
            </div>

            {/* Suggested Goals */}
            {readinessSummary.upcomingGoals && readinessSummary.upcomingGoals.length > 0 && (
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                  🎯 Active Milestone Targets
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
                  {readinessSummary.upcomingGoals.map((goal, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#CBD5E1" }}>
                      <span style={{ color: "#38BDF8", fontSize: "16px" }}>▫</span>
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
            Upload a resume in Real ATS Checker to generate your AI Placement Readiness report.
          </div>
        )}
      </div>

      {/* PLACEMENT ACCELERATORS & AI TOOLS */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.3px" }}>
              🚀 Placement Accelerators & Career Copilot
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Specialized AI workflows designed to advance you from application to offer.
            </p>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {/* Real ATS Checker */}
          <Link to="/student/ats" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(59, 130, 246, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🎯
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: "8px" }}>
                    Multi-Point ATS
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  Real ATS Checker
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Audit resume against contact completeness, power verbs, quantifiable metrics & drive keywords.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#2563EB", display: "flex", alignItems: "center", gap: "4px" }}>
                Launch ATS Audit ➔
              </div>
            </div>
          </Link>

          {/* Skill Analysis */}
          <Link to="/student/skills" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#8B5CF6";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(139, 92, 246, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    📊
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#7C3AED", background: "#F5F3FF", padding: "2px 8px", borderRadius: "8px" }}>
                    Verified Taxonomy
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  Skill Analysis
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Resume-derived skill extraction with evidence quotes, role-fit comparisons, and profile synchronization.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#7C3AED", display: "flex", alignItems: "center", gap: "4px" }}>
                View Skill Taxonomy ➔
              </div>
            </div>
          </Link>

          {/* Peer Collaboration */}
          <Link to="/student/collaborate" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#10B981";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(16, 185, 129, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🤝
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "8px" }}>
                    Live Workspaces
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  Peer Collaboration Lab
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Real-time study channels, collaborative code sandbox, goal roadmaps, and peer exercise generator.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                Open Workspace ➔
              </div>
            </div>
          </Link>

          {/* Company Prep Mode */}
          <Link to="/student/company-prep" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#0284C7";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(2, 132, 199, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🏢
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#0284C7", background: "#F0F9FF", padding: "2px 8px", borderRadius: "8px" }}>
                    Target Prep
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  Company Prep Mode
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Targeted interview patterns, technical rounds breakdown, difficulty ratings, and focused drill sets.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#0284C7", display: "flex", alignItems: "center", gap: "4px" }}>
                Target Companies ➔
              </div>
            </div>
          </Link>

          {/* Placement Journey */}
          <Link to="/student/journey" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#6366F1";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(99, 102, 241, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🗺️
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#4F46E5", background: "#EEF2FF", padding: "2px 8px", borderRadius: "8px" }}>
                    9-Stage Map
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  Placement Journey
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Step-by-step career progression pipeline tracking registration, resume building, assessments, and offers.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#4F46E5", display: "flex", alignItems: "center", gap: "4px" }}>
                Track Roadmap ➔
              </div>
            </div>
          </Link>

          {/* AI Mock Interview */}
          <Link to="/student/mock-interview" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#EC4899";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(236, 72, 153, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.03)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #FDF2F8, #FCE7F3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🎙️
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#DB2777", background: "#FDF2F8", padding: "2px 8px", borderRadius: "8px" }}>
                    Live Simulation
                  </span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px" }}>
                  AI Mock Interview
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Simulated real-time technical and behavioral interview with adaptive follow-ups and performance grading.
                </p>
              </div>
              <div style={{ marginTop: "16px", fontSize: "13px", fontWeight: "700", color: "#DB2777", display: "flex", alignItems: "center", gap: "4px" }}>
                Start Interview ➔
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* RECOMMENDED OPPORTUNITIES SECTION */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recommended Opportunities</h2>
            <p>Placement drives verified for your branch, CGPA, and skill profile</p>
          </div>
          <Link to="/student/jobs">
            <button>View All Drives ({drives.length})</button>
          </Link>
        </div>

        <div className="job-list">
          {drives.length > 0 ? (
            drives.slice(0, 3).map((drive) => {
              const salaryLPA = drive.salary ? (drive.salary / 100000).toFixed(1) : "Negotiable";
              const companyName = drive.company?.companyName || "Recruiter Partner";
              const initial = companyName.charAt(0).toUpperCase();

              return (
                <div key={drive._id} className="job-card" style={{ padding: "18px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #0F172A, #1E293B)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "18px"
                    }}>
                      {initial}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px" }}>
                        {drive.jobRole || drive.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                        {companyName} • <span style={{ color: "#0284C7", fontWeight: 600 }}>{drive.location || "On-Campus / Hybrid"}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "6px 12px",
                      background: "#F0F9FF",
                      color: "#0369A1",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      border: "1px solid #BAE6FD"
                    }}>
                      ₹{salaryLPA} LPA
                    </span>
                    <span className="match-score">
                      Active Drive
                    </span>
                    <Link to="/student/jobs">
                      <button style={{
                        background: "#2563EB",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}>
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">No placement drives currently active.</p>
          )}
        </div>
      </section>

      {/* UPCOMING INTERVIEW SECTION */}
      <section className="dashboard-section" style={{ marginTop: "24px" }}>
        <div className="section-header">
          <div>
            <h2>Upcoming Interview</h2>
            <p>Your next confirmed interview schedule</p>
          </div>
          {interviews.length > 0 && (
            <Link to="/student/interviews">
              <button>Manage Schedule</button>
            </Link>
          )}
        </div>

        {interviews.length > 0 ? (
          <div className="interview-card" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            background: "linear-gradient(135deg, #FFFFFF, #F8FAFC)",
            borderRadius: "12px",
            border: "1px solid #E2E8F0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                📅
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px" }}>
                  {interviews[0].placementDrive?.jobRole || interviews[0].round} — {interviews[0].company?.companyName || "Recruiter"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  Round: <strong style={{ color: "#2563EB" }}>{interviews[0].round.toUpperCase()}</strong> ({interviews[0].status})
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong style={{ display: "block", fontSize: "15px", color: "#0F172A" }}>
                {new Date(interviews[0].scheduledDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </strong>
              <span style={{ fontSize: "13px", color: "#64748B" }}>
                {new Date(interviews[0].scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ) : (
          <p className="no-data">No interviews scheduled yet. Keep applying to drives!</p>
        )}
      </section>
    </DashboardLayout>
  );
}

export default StudentDashboard;