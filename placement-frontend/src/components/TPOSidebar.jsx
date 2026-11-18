import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

function TPOSidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => {
    if (path === "/tpo" && location.pathname === "/tpo") return "active";
    return location.pathname.startsWith(path) && path !== "/tpo" ? "active" : "";
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/", { replace: true });
  };

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { path: "/tpo", label: "Operations Center", icon: "⚡", badge: "Live" },
        { path: "/tpo/profile", label: "TPO Profile", icon: "👤" }
      ]
    },
    {
      title: "CAMPUS TALENT & CORPS",
      items: [
        { path: "/tpo/students", label: "Students Directory", icon: "👨‍🎓" },
        { path: "/tpo/companies", label: "Company Registry", icon: "🏢" }
      ]
    },
    {
      title: "DRIVES & PIPELINE",
      items: [
        { path: "/tpo/drives", label: "Placement Drives", icon: "📢", badge: "Approvals" },
        { path: "/tpo/applications", label: "Application Tracker", icon: "📋" },
        { path: "/tpo/interviews", label: "Interview Sessions", icon: "📅" },
        { path: "/tpo/conflicts", label: "Conflict Detector", icon: "⚠️", badge: "AI" }
      ]
    },
    {
      title: "INSIGHTS & REPORTS",
      items: [
        { path: "/tpo/analytics", label: "Placement Analytics", icon: "📈" },
        { path: "/tpo/reports", label: "Official Reports", icon: "📊" },
        { path: "/tpo/notifications", label: "Announcements", icon: "🔔" }
      ]
    }
  ];

  const displayName = user?.name || "TPO Officer";
  const userInitials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "TP";

  return (
    <>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9998
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* BRAND LOGO */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/tpo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
                }}
              >
                🎓
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px", color: "#ffffff" }}>
                    Campus<span style={{ color: "#34d399" }}>AI</span>
                  </h2>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      padding: "1px 6px",
                      borderRadius: "6px",
                      border: "1px solid rgba(52, 211, 153, 0.3)"
                    }}
                  >
                    TPO
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  Training & Placement Operations
                </p>
              </div>
            </Link>

            {mobileOpen && (
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <nav className="sidebar-menu" style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  color: "#475569",
                  textTransform: "uppercase",
                  padding: "0 10px 6px",
                  userSelect: "none"
                }}
              >
                {sec.title}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {sec.items.map((item, itemIdx) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => mobileOpen && onClose && onClose()}
                      className={`sidebar-nav-item ${active ? "active" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: active ? "#ffffff" : "#94a3b8",
                        background: active
                          ? "linear-gradient(90deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.12) 100%)"
                          : "transparent",
                        borderLeft: active ? "3px solid #34d399" : "3px solid transparent",
                        fontWeight: active ? 600 : 500,
                        fontSize: "13.5px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "15px", display: "flex", alignItems: "center" }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "10px",
                            background: active
                              ? "rgba(52, 211, 153, 0.2)"
                              : "rgba(255, 255, 255, 0.06)",
                            color: active ? "#34d399" : "#64748b",
                            border: `1px solid ${active ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.08)"}`
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* BOTTOM USER PROFILE CARD */}
        <div
          style={{
            padding: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(10, 15, 29, 0.95)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#ffffff",
                  flexShrink: 0
                }}
              >
                {userInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {displayName}
                </div>
                <div style={{ fontSize: "11px", color: "#34d399" }}>
                  Placement Officer
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              title="Logout from Portal"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease"
              }}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userRole="TPO"
      />
    </>
  );
}

export default TPOSidebar;