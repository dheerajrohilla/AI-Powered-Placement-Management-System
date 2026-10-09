import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";

function StudentCollaboration() {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("discover"); // "discover" | "requests"
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [inviteModal, setInviteModal] = useState(null); // peer item
  const [inviteMsg, setInviteMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, reqsRes] = await Promise.all([
        studentAPI.getCollaborationMatches(),
        studentAPI.getCollaborationRequests()
      ]);
      setMatches(matchesRes.data || []);
      setRequests(reqsRes.data || []);
    } catch (err) {
      console.error("Failed to load collaboration data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInvite = async () => {
    if (!inviteModal) return;
    try {
      setSendingId(inviteModal.peerId);
      await studentAPI.sendCollaborationRequest({
        peerId: inviteModal.peerId,
        complementaryFocus: inviteModal.complementaryFocus,
        message: inviteMsg || `Hey! Let's connect and prepare for placements together.`
      });
      setInviteModal(null);
      setInviteMsg("");
      await fetchData();
    } catch (err) {
      console.error("Failed to send collaboration invite:", err);
      alert("Failed to send invite. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  const handleUpdateRequest = async (reqId, status) => {
    try {
      await studentAPI.updateCollaborationRequest(reqId, status);
      await fetchData();
    } catch (err) {
      console.error("Failed to update collaboration request:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>Skill-Based Student Collaboration</h1>
          <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
            Connect with peer study partners whose strengths bridge your skill gaps for mutual placement prep.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab("discover")}
            className={activeTab === "discover" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px" }}
          >
            🔍 Discover Study Partners ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={activeTab === "requests" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px" }}
          >
            📬 Study Invites ({requests.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Matching complementary skill profiles across your campus cohort...</p>
        </div>
      ) : activeTab === "requests" ? (
        /* Requests & Active Groups Tab */
        <div className="card" style={{ padding: "26px", background: "#fff", borderRadius: "14px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            📬 Study Partner Invitations ({requests.length})
          </h3>

          {requests.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No collaboration invites sent or received yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {requests.map((r) => (
                <div key={r._id} style={{
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                      {r.sender?.userId?.name || "Peer"} ⇄ {r.receiver?.userId?.name || "You"}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>
                      Focus: {r.complementaryFocus}
                    </span>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                      "{r.message}"
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={
                      r.status === "accepted" ? "badge badge-success" :
                      r.status === "declined" ? "badge badge-danger" :
                      "badge badge-warning"
                    }>
                      {r.status.toUpperCase()}
                    </span>

                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleUpdateRequest(r._id, "accepted")}
                          className="btn-primary"
                          style={{ padding: "6px 12px", fontSize: "12px", background: "#16a34a" }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateRequest(r._id, "declined")}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Discover Matches Grid */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Intro Matching Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
            color: "white",
            padding: "24px 28px",
            borderRadius: "14px"
          }}>
            <h2 style={{ fontSize: "20px", marginBottom: "6px" }}>🤝 Complementary Skill Matching Engine</h2>
            <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: "1.5", maxWidth: "800px" }}>
              Rather than studying in isolation, pair with peers who excel in areas where you want to grow. You teach what you are strong in, and learn their specialized strengths!
            </p>
          </div>

          {/* Matched Study Partners Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "18px" }}>
            {matches.map((peer) => (
              <div key={peer.peerId} className="card" style={{
                padding: "22px",
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>{peer.name}</h3>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        {peer.department} • {peer.targetRole} • CGPA {peer.cgpa}
                      </p>
                    </div>

                    <span style={{
                      background: "#dcfce7",
                      color: "#166534",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px"
                    }}>
                      {peer.compatibilityScore}% Match
                    </span>
                  </div>

                  {/* Complementary exchange highlight */}
                  <div style={{ padding: "12px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                      COMPLEMENTARY EXCHANGE
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#14532d", marginTop: "2px" }}>
                      {peer.complementaryFocus}
                    </div>
                  </div>

                  {/* Give & Take tags */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                      THEY CAN HELP YOU WITH:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {peer.youLearn.map((s, idx) => (
                        <span key={idx} style={{ padding: "3px 10px", borderRadius: "12px", background: "#eff6ff", color: "#1e40af", fontSize: "12px", fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                      YOU CAN HELP THEM WITH:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {peer.youTeach.map((s, idx) => (
                        <span key={idx} style={{ padding: "3px 10px", borderRadius: "12px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connect Action Button */}
                <div>
                  {peer.connectionStatus === "accepted" ? (
                    <div style={{ textAlign: "center", padding: "10px", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
                      ✓ Connected Study Partner
                    </div>
                  ) : peer.connectionStatus === "pending" ? (
                    <div style={{ textAlign: "center", padding: "10px", background: "#fef3c7", color: "#92400e", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
                      ⏳ Invite Pending Response
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setInviteModal(peer);
                        setInviteMsg(`Hey ${peer.name}! I noticed you're strong in ${peer.youLearn[0]}. I'd love to pair up for mock interviews and skill sharing.`);
                      }}
                      className="btn-primary"
                      style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                    >
                      🤝 Send Study Partner Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{ background: "white", padding: "28px", borderRadius: "14px", width: "480px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px", color: "#111827" }}>
              Collaborate with {inviteModal.name}
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
              Focus: {inviteModal.complementaryFocus}
            </p>

            <textarea
              rows="4"
              value={inviteMsg}
              onChange={(e) => setInviteMsg(e.target.value)}
              placeholder="Add a personalized message..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", marginBottom: "18px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setInviteModal(null)}
                className="btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={sendingId !== null}
                className="btn-primary"
                style={{ padding: "8px 18px" }}
              >
                {sendingId ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentCollaboration;
