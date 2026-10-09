import { useState, useEffect } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function PlacementConflicts() {
  const [conflictData, setConflictData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const res = await tpoAPI.getPlacementConflicts();
      setConflictData(res.data);
    } catch (err) {
      console.error("Failed to load placement conflicts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleResolveSlot = async (conflict, slot) => {
    try {
      setResolvingId(conflict.id);
      await tpoAPI.resolveConflictSlot({
        interviewId: conflict.targetItemToReschedule,
        newScheduledDate: slot.newDate,
        reason: `Auto-resolved by TPO using suggested alternative slot: ${slot.slotLabel}`
      });
      setSuccessMsg(`✓ Successfully rescheduled activity to ${slot.slotLabel} and notified student!`);
      setTimeout(() => setSuccessMsg(""), 5000);
      await fetchConflicts();
    } catch (err) {
      console.error("Failed to resolve conflict:", err);
      alert("Failed to reschedule interview slot. Please try again.");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <TPOLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>
            Placement Activity Conflict Detector
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
            Automated collision detection across student interviews, online coding tests, and campus drive schedules.
          </p>
        </div>

        <button
          onClick={fetchConflicts}
          className="btn-primary"
          style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          🔄 Re-Scan Schedules
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: "14px 20px", background: "#dcfce7", color: "#15803d", borderRadius: "10px", marginBottom: "20px", fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Scanning interview calendar across all active students and company drives...</p>
        </div>
      ) : conflictData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Conflict Summary Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div className="card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", borderLeft: "5px solid #ef4444" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>TOTAL CONFLICTS</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: conflictData.totalConflicts > 0 ? "#ef4444" : "#10b981", marginTop: "4px" }}>
                {conflictData.totalConflicts}
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>Detected collisions</p>
            </div>

            <div className="card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", borderLeft: "5px solid #dc2626" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>CRITICAL OVERLAPS</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
                {conflictData.criticalCount || 0}
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>Direct time clashes (&lt;15m)</p>
            </div>

            <div className="card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", borderLeft: "5px solid #f59e0b" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>BUFFER WARNINGS</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>
                {conflictData.warningCount || 0}
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>Tight transit buffer (&lt;45m)</p>
            </div>

            <div className="card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", borderLeft: "5px solid #3b82f6" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>SCANNED SESSIONS</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>
                {conflictData.scannedInterviewsCount}
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>Interviews & tests scanned</p>
            </div>
          </div>

          {/* Conflict List */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              ⚠️ Detected Schedule Collisions ({conflictData.conflicts?.length || 0})
            </h3>

            {(!conflictData.conflicts || conflictData.conflicts.length === 0) ? (
              <div style={{ padding: "35px", textAlign: "center", background: "#f0fdf4", borderRadius: "10px", color: "#15803d" }}>
                ✓ Zero scheduling conflicts detected! All student interviews and placement drive windows are cleanly separated.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {conflictData.conflicts.map((conf) => (
                  <div key={conf.id} style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: conf.severity === "critical" ? "#fef2f2" : "#fffbeb",
                    border: conf.severity === "critical" ? "1px solid #fecaca" : "1px solid #fde68a"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: conf.severity === "critical" ? "#ef4444" : "#f59e0b",
                            color: "white",
                            textTransform: "uppercase"
                          }}>
                            {conf.severity} • {conf.conflictType}
                          </span>
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>{conf.date}</span>
                        </div>

                        <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginTop: "6px" }}>
                          {conf.scope === "student" ? `Student: ${conf.studentName}` : "Placement Drive Clash"}
                        </h4>
                      </div>

                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#7f1d1d", background: "white", padding: "4px 10px", borderRadius: "6px", border: "1px solid #fca5a5" }}>
                        Time Collision Window: {conf.timeWindow}
                      </span>
                    </div>

                    <p style={{ fontSize: "14px", color: "#374151", marginBottom: "14px", lineHeight: "1.5" }}>
                      {conf.description}
                    </p>

                    {/* Overlapping Activities Breakdown */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                      {(conf.itemsInvolved || []).map((item, idx) => (
                        <div key={idx} style={{ background: "white", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                            ACTIVITY {idx + 1} ({item.activityType || "interview"})
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>
                            {item.company} — {item.round} round
                          </div>
                          <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px", fontWeight: 600 }}>
                            Scheduled at {item.time || new Date(item.scheduledDate || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Reschedule Suggestions */}
                    {conf.suggestedReschedule?.length > 0 && (
                      <div style={{ background: "white", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#15803d", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                          🤖 AI Rescheduling Assistant (Conflict-Free Alternatives):
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {conf.suggestedReschedule.map((slot, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleResolveSlot(conf, slot)}
                              disabled={resolvingId === conf.id}
                              className="btn-primary"
                              style={{
                                padding: "8px 14px",
                                fontSize: "13px",
                                background: "#2563eb",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "2px"
                              }}
                            >
                              <span>⚡ {slot.slotLabel}</span>
                              {slot.benefit && <span style={{ fontSize: "10px", opacity: 0.85 }}>{slot.benefit}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </TPOLayout>
  );
}

export default PlacementConflicts;
