import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = () => {
    setLoading(true);
    tpoAPI.getNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch((err) => console.error("Error loading notifications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await tpoAPI.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <TPOLayout>
      <div className="company-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>TPO Notification Center</h1>
          <p>Real-time alerts for recruiter registrations, drive updates, candidate applications, and system notices.</p>
        </div>

        <button className="create-drive-btn" style={{ background: '#475569' }} onClick={() => handleMarkRead('all')}>
          ✓ Mark All as Read
        </button>
      </div>

      <div className="company-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Alert Log</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter("all")}
              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: filter === "all" ? "#2563eb" : "#f1f5f9", color: filter === "all" ? "#ffffff" : "#475569", cursor: 'pointer', fontWeight: 600 }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: filter === "unread" ? "#2563eb" : "#f1f5f9", color: filter === "unread" ? "#ffffff" : "#475569", cursor: 'pointer', fontWeight: 600 }}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifs.map((n) => (
            <div
              key={n._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: n.isRead ? '#ffffff' : '#f0f9ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  background: n.type === 'alert' ? '#fee2e2' : n.type === 'success' ? '#dcfce7' : '#e0f2fe',
                  color: n.type === 'alert' ? '#b91c1c' : n.type === 'success' ? '#15803d' : '#0369a1'
                }}>
                  {n.type === 'alert' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#1e293b' }}>{n.title}</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}

          {loading && <p className="no-students">Loading notifications...</p>}
          {!loading && filteredNotifs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No notifications found in this view.
            </div>
          )}
        </div>
      </div>
    </TPOLayout>
  );
}

export default Notifications;
