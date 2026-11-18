import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

function Sidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => {
    if (path === "/student" && location.pathname === "/student") return "active";
    return location.pathname.startsWith(path) && path !== "/student" ? "active" : "";
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/", { replace: true });
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { path: "/student", label: "Command Center", icon: "⚡", badge: "Live" },
        { path: "/student/journey", label: "Placement Journey", icon: "🗺️" }
      ]
    },
    {
      title: "AI INTELLIGENCE & ATS",
      items: [
        { path: "/student/ats", label: "Real ATS Checker", icon: "🎯", badge: "AI" },
        { path: "/student/skills", label: "Skill Intelligence", icon: "📊" },
        { path: "/student/credibility", label: "Credibility Audit", icon: "🔍" },
        { path: "/student/rejection-analyzer", label: "Shortlist Analyzer", icon: "📉" }
      ]
    },
    {
      title: "PREP & COLLABORATION",
      items: [
        { path: "/student/study-material", label: "Study Material", icon: "📚", badge: "Hub" },
        { path: "/student/quiz", label: "Subject Quizzes", icon: "📝", badge: "MCQ" },
        { path: "/student/mock-interview", label: "AI Prep & Assessment", icon: "🤖", badge: "v2.5" },
        { path: "/student/collaborate", label: "Peer Collaboration", icon: "👥", badge: "Sync" },
        { path: "/student/benchmarking", label: "Peer Benchmarking", icon: "📈" },
        { path: "/student/company-prep", label: "Company Prep Mode", icon: "🏢" }
      ]
    },
    {
      title: "DRIVES & OPPORTUNITIES",
      items: [
        { path: "/student/jobs", label: "Placement Drives", icon: "💼" },
        { path: "/student/applications", label: "Applications", icon: "📋" },
        { path: "/student/interviews", label: "Interview Schedule", icon: "📅" },
        { path: "/student/chatbot", label: "AI Copilot", icon: "✨" }
      ]
    }
  ];

  const displayName = user?.name || "Student";
  const userInitials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "ST";

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
            <Link to="/student" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)"
                }}
              >
                🚀
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px", color: "#ffffff" }}>
                    Campus<span style={{ color: "#38bdf8" }}>AI</span>
                  </h2>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "rgba(59, 130, 246, 0.15)",
                      color: "#60a5fa",
                      padding: "1px 6px",
                      borderRadius: "6px",
                      border: "1px solid rgba(96, 165, 250, 0.3)"
                    }}
                  >
                    PRO
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  Placement Intelligence Platform
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
                          ? "linear-gradient(90deg, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.08) 100%)"
                          : "transparent",
                        borderLeft: active ? "3px solid #38bdf8" : "3px solid transparent",
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
                              ? "rgba(56, 189, 248, 0.2)"
                              : "rgba(255, 255, 255, 0.06)",
                            color: active ? "#38bdf8" : "#64748b",
                            border: `1px solid ${active ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.08)"}`
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

        {/* SIDEBAR FOOTER: USER PROFILE & LOGOUT */}
        <div
          className="sidebar-bottom"
          style={{
            padding: "14px 14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(10, 15, 29, 0.4)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                  position: "relative",
                  flexShrink: 0
                }}
              >
                {userInitials}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                    border: "2px solid #0b0f19"
                  }}
                />
              </div>

              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {displayName}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {user?.role ? user.role.toUpperCase() : "STUDENT"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              title="Sign out of CampusAI"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
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
        userRole={user?.role || "Student"}
      />
    </>
  );
}

export default Sidebar;