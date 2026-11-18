import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAssetUrl } from "../services/api";

function CompanyNavbar({ onToggleMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const displayName = user?.name || "Company Recruiter";
  const initial = displayName.charAt(0).toUpperCase();

  const getPageInfo = () => {
    const p = location.pathname;
    if (p === "/company") return { title: "Recruitment Command Center", tag: "Overview" };
    if (p.includes("/profile")) return { title: "Organization & Recruiter Profile", tag: "Settings" };
    if (p.includes("/create-drive")) return { title: "Draft New Placement Drive", tag: "Creation" };
    if (p.includes("/drives")) return { title: "Placement Drives & Approval Tracker", tag: "Drives" };
    if (p.includes("/applicants")) return { title: "Candidate Talent Pipeline", tag: "Evaluation" };
    if (p.includes("/shortlisted")) return { title: "Shortlisted Candidates", tag: "Talent" };
    if (p.includes("/interviews")) return { title: "Interview Scheduling & Panel Coordination", tag: "Interviews" };
    if (p.includes("/notifications")) return { title: "Recruitment Alerts & TPO Updates", tag: "Notifications" };
    return { title: "Enterprise Recruitment Portal", tag: "Company" };
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
                background: "linear-gradient(90deg, #eff6ff 0%, #e0f2fe 100%)",
                color: "#0284c7",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid #bae6fd"
              }}
            >
              {pageInfo.tag}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
            Enterprise recruitment & placement operations console
          </p>
        </div>
      </div>

      {/* RIGHT: QUICK ACTION & PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link
          to="/company/create-drive"
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
          }}
        >
          <span>➕</span>
          <span>Post Drive</span>
        </Link>

        <Link
          to="/company/notifications"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: "#475569",
            fontSize: "15px"
          }}
          title="Notifications"
        >
          🔔
        </Link>

        <Link
          to="/company/profile"
          className="navbar-profile"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#ffffff",
            padding: "4px 10px 4px 6px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0284c7"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
        >
          <div
            className="profile-circle"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              overflow: "hidden"
            }}
          >
            {user?.profilePicture ? (
              <img
                src={getAssetUrl(user.profilePicture)}
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#ffffff" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              initial
            )}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>
              {displayName}
            </strong>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Recruiter
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default CompanyNavbar;