import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AdminNavbar({ onToggleMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const displayName = user?.name || "System Administrator";
  const initial = displayName.charAt(0).toUpperCase();

  const getPageInfo = () => {
    const p = location.pathname;
    if (p === "/admin") return { title: "Platform System Overview", tag: "Overview" };
    if (p.includes("/profile")) return { title: "Root Admin Profile", tag: "Security" };
    if (p.includes("/users")) return { title: "User Account & Role Governance", tag: "RBAC" };
    if (p.includes("/roles-permissions")) return { title: "Role Definitions & Access Matrix", tag: "Permissions" };
    if (p.includes("/configuration")) return { title: "Global Platform Configuration", tag: "Settings" };
    if (p.includes("/monitoring")) return { title: "Security Audit & System Health", tag: "Monitoring" };
    if (p.includes("/analytics")) return { title: "Platform Usage & Recruitment Metrics", tag: "Analytics" };
    if (p.includes("/notifications")) return { title: "System Broadcasts & Policy Alerts", tag: "Broadcasts" };
    return { title: "System Administration", tag: "Admin" };
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
                background: "linear-gradient(90deg, #f5f3ff 0%, #ede9fe 100%)",
                color: "#7c3aed",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid #ddd6fe"
              }}
            >
              {pageInfo.tag}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
            Platform infrastructure, security & global access control
          </p>
        </div>
      </div>

      {/* RIGHT: QUICK ACTION & PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link
          to="/admin/users"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)"
          }}
        >
          <span>👥</span>
          <span>Manage Users</span>
        </Link>

        <Link
          to="/admin/notifications"
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
          title="Notifications & Broadcasts"
        >
          🔔
        </Link>

        <div className="navbar-profile" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="profile-circle"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            {initial}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>
              {displayName}
            </strong>
            <span style={{ fontSize: "11px", color: "#7c3aed" }}>
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;