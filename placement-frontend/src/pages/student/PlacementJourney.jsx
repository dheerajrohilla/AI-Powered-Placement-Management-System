import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { Link } from "react-router-dom";

function PlacementJourney() {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getPlacementJourney();
        setJourney(res.data);
      } catch (err) {
        console.error("Failed to load placement journey:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, []);

  const getStatusBadge = (status) => {
    if (status === "completed") return <span className="badge badge-success">✓ Completed</span>;
    if (status === "in_progress") return <span className="badge badge-warning">⚡ In Progress</span>;
    return <span className="badge badge-secondary" style={{ opacity: 0.6 }}>🔒 Next Milestone</span>;
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>Placement Journey & Skill Roadmap</h1>
        <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
          Your end-to-end milestone tracker from student onboarding to campus job offer.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Mapping your placement journey milestones...</p>
        </div>
      ) : journey && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Overall Progress Banner */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            color: "white",
            padding: "26px 30px",
            borderRadius: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <div>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                  MILESTONE TRACKER
                </span>
                <h2 style={{ fontSize: "24px", marginTop: "8px" }}>
                  {journey.completedStagesCount} of {journey.totalStagesCount} Stages Completed ({journey.overallPercentage}%)
                </h2>
                <p style={{ opacity: 0.9, fontSize: "14px", marginTop: "4px" }}>
                  {journey.nextActionGuidance}
                </p>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.15)",
                padding: "16px 24px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800 }}>{journey.overallPercentage}%</div>
                <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase" }}>Overall Completion</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.2)", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{
                background: "#34d399",
                height: "100%",
                width: `${journey.overallPercentage}%`,
                transition: "width 0.5s ease"
              }}></div>
            </div>
          </div>

          {/* 9-Stage Visual Pipeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
              🗺️ 9-Stage Placement Progression Pipeline
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {journey.stages.map((stage) => {
                const isCurrent = journey.currentStage?.id === stage.id;
                const isCompleted = stage.status === "completed";

                return (
                  <div key={stage.id} className="card" style={{
                    padding: "20px 24px",
                    background: isCurrent ? "#f0f7ff" : "#fff",
                    borderRadius: "12px",
                    border: isCurrent ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    transition: "all 0.2s ease"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* Step Circle */}
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: isCompleted ? "#10b981" : isCurrent ? "#2563eb" : "#f1f5f9",
                        color: isCompleted || isCurrent ? "white" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "16px",
                        flexShrink: 0
                      }}>
                        {isCompleted ? "✓" : stage.number}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                            {stage.name}
                          </h4>
                          {getStatusBadge(stage.status)}
                        </div>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: isCompleted ? "#10b981" : "#1e40af" }}>
                          {stage.metricLabel}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Stage Status</div>
                      </div>

                      <Link
                        to={stage.actionLink}
                        className={isCurrent ? "btn-primary" : "btn-secondary"}
                        style={{ padding: "8px 16px", fontSize: "13px", textDecoration: "none" }}
                      >
                        {stage.actionText} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default PlacementJourney;
