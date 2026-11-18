import { useEffect, useState } from "react";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI } from "../../services/api";

function CompanyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setErrorMsg("Failed to load notification stream.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await companyAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || id === "all" ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Recruiter Notifications
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Stay updated on drive approvals, candidate submissions, and interview milestones.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead("all")}
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {errorMsg && (
          <div style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
            marginBottom: "20px"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading notification feed...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              No notifications yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              You will receive updates when the TPO reviews your placement drives or candidates apply.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  background: notif.isRead ? "#ffffff" : "#f8fafc",
                  border: notif.isRead ? "1px solid #e2e8f0" : "1px solid #93c5fd",
                  borderLeft: notif.isRead ? "4px solid #cbd5e1" : "4px solid #3b82f6",
                  borderRadius: "10px",
                  padding: "18px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "2px 8px",
                        borderRadius: "10px"
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "14px", color: "#475569", margin: "4px 0 8px" }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                    title="Mark as read"
                  >
                    Mark read ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default CompanyNotifications;
