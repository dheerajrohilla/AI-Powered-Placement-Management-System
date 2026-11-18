import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAssetUrl } from "../services/api";

function TPONavbar({ onToggleMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const displayName = user?.name || "TPO Officer";
  const initial = displayName.charAt(0).toUpperCase();

  const getPageInfo = () => {
    const p = location.pathname;
    if (p === "/tpo") return { title: "Campus Placement Operations", tag: "Overview" };
    if (p.includes("/profile")) return { title: "Placement Officer Profile", tag: "Settings" };
    if (p.includes("/students")) return { title: "Student Roster & Verification", tag: "Students" };
    if (p.includes("/companies")) return { title: "Company Registry & Accreditations", tag: "Corporate" };
    if (p.includes("/drives")) return { title: "Placement Drives & Approval Queue", tag: "Approvals" };
    if (p.includes("/applications")) return { title: "Application Monitor & Progress", tag: "Tracking" };
    if (p.includes("/interviews")) return { title: "Interview Scheduling & Slots", tag: "Interviews" };
    if (p.includes("/conflicts")) return { title: "AI Placement Conflict Detector", tag: "Optimization" };
    if (p.includes("/analytics")) return { title: "Placement Statistics & Department Insights", tag: "Analytics" };
    if (p.includes("/reports")) return { title: "Institutional Reports & Exports", tag: "Reporting" };
    if (p.includes("/notifications")) return { title: "Campus Placement Announcements", tag: "Broadcasts" };
    return { title: "TPO Placement Office", tag: "Operations" };
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
                background: "linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%)",
                color: "#059669",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid #a7f3d0"
              }}
            >
              {pageInfo.tag}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
            Institutional training & placement operations command
          </p>
        </div>
      </div>

      {/* RIGHT: QUICK ACTION & PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link
          to="/tpo/conflicts"
          style={{
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            padding: "7px 12px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
          title="Review interview clashes"
        >
          <span>⚠️</span>
          <span>Conflict Detector</span>
        </Link>

        <Link
          to="/tpo/notifications"
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
          title="Announcements & Alerts"
        >
          🔔
        </Link>

        <Link
          to="/tpo/profile"
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
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "#10b981"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
        >
          <div
            className="profile-circle"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              TPO Officer
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default TPONavbar;