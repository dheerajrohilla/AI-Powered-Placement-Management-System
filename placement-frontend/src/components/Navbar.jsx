import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar({ onToggleMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const displayName = user?.name || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  // Determine current page friendly title
  const getPageInfo = () => {
    const p = location.pathname;
    if (p === "/student") return { title: "Executive Command Center", tag: "Overview" };
    if (p.includes("/ats")) return { title: "Real ATS Resume Checker", tag: "AI Screening" };
    if (p.includes("/skills")) return { title: "Skill Analysis & Taxonomy", tag: "Intelligence" };
    if (p.includes("/journey")) return { title: "Placement Roadmap & Milestones", tag: "Journey" };
    if (p.includes("/credibility")) return { title: "Resume Credibility Audit", tag: "Verification" };
    if (p.includes("/mock-interview") || p.includes("/ai-prep")) return { title: "AI Prep & Adaptive Assessment", tag: "Evaluation" };
    if (p.includes("/rejection-analyzer")) return { title: "Shortlist Probability Analyzer", tag: "Analytics" };
    if (p.includes("/company-prep")) return { title: "Company-Specific Prep Mode", tag: "Target Prep" };
    if (p.includes("/benchmarking")) return { title: "Cohort Peer Benchmarking", tag: "Insights" };
    if (p.includes("/collaborate")) return { title: "Peer Collaboration Workspaces", tag: "Live Collab" };
    if (p.includes("/jobs")) return { title: "Campus Placement Drives", tag: "Opportunities" };
    if (p.includes("/applications")) return { title: "Application Tracking System", tag: "Pipeline" };
    if (p.includes("/interviews")) return { title: "Interview Coordination", tag: "Schedule" };
    if (p.includes("/chatbot")) return { title: "CampusAI Copilot", tag: "Assistant" };
    return { title: "Student Placement Portal", tag: "Portal" };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="navbar">
      {/* LEFT: MOBILE TOGGLE & BREADCRUMB */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          onClick={onToggleMenu}
          className="mobile-nav-toggle"
          style={{
            background: "rgba(15, 23, 42, 0.06)",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: "8px",
            padding: "8px 10px",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#0f172a"
          }}
          title="Toggle Navigation Menu"
        >
          ☰
        </button>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.2px" }}>
              {pageInfo.title}
            </h2>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                background: "linear-gradient(90deg, #eff6ff 0%, #f5f3ff 100%)",
                color: "#4f46e5",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid #c7d2fe"
              }}
            >
              {pageInfo.tag}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
            Active Session: 2026 Campus Placement Season • Automated AI Engine
          </p>
        </div>
      </div>

      {/* RIGHT: QUICK ACCESS & PROFILE PILL */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* QUICK SHORTCUT CHIPS */}
        <div className="navbar-quick-links" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link
            to="/student/ats"
            style={{
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: "6px",
              background: "#f1f5f9",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.15s ease"
            }}
          >
            <span>🎯</span> ATS Audit
          </Link>

          <Link
            to="/student/collaborate"
            style={{
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: "6px",
              background: "#f1f5f9",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.15s ease"
            }}
          >
            <span>👥</span> Collab Lab
          </Link>
        </div>

        {/* PROFILE BADGE */}
        <div
          className="navbar-profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#ffffff",
            padding: "4px 10px 4px 6px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <div
            className="profile-circle"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700
            }}
          >
            {initial}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>
              {displayName}
            </strong>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              {user?.role ? user.role.toUpperCase() : "STUDENT"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;