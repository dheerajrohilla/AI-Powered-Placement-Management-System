import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";

function PeerBenchmarking() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getPeerBenchmark();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load peer benchmarking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>Anonymous Peer Benchmarking</h1>
        <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
          Compare your placement readiness metrics against cohort peers targeting similar engineering roles. Zero individual PII is exposed.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Aggregating anonymous cohort percentiles...</p>
        </div>
      ) : data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Privacy Guarantee & Standing Banner */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            color: "white",
            padding: "26px 30px",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div>
              <span style={{
                background: "rgba(255,255,255,0.2)",
                padding: "3px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                🔒 100% Anonymized Aggregation
              </span>
              <h2 style={{ fontSize: "24px", marginTop: "10px" }}>{data.cohortStanding}</h2>
              <p style={{ fontSize: "14px", opacity: 0.85, marginTop: "4px" }}>
                Benchmarked across {data.cohortSize} students in your active batch & department.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", padding: "14px 20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#a5b4fc" }}>{data.overallUserScore}</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Your Composite Score</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.15)", padding: "14px 20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: 800 }}>{data.overallPeerAverage}</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Cohort Average</div>
              </div>
            </div>
          </div>

          {/* Dimension Comparison Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
            {data.dimensions.map((dim) => {
              const isAhead = dim.user >= dim.peerAverage;

              return (
                <div key={dim.id} className="card" style={{ padding: "22px", background: "#fff", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{dim.name}</h3>
                    <span style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background: isAhead ? "#dcfce7" : "#fef3c7",
                      color: isAhead ? "#166534" : "#92400e"
                    }}>
                      {dim.percentileRank}th Percentile
                    </span>
                  </div>

                  {/* Score Numbers */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "14px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#6b7280", display: "block" }}>YOU</span>
                      <span style={{ fontSize: "22px", fontWeight: 800, color: isAhead ? "#16a34a" : "#ea580c" }}>{dim.user}</span>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280", display: "block" }}>PEER AVG</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, color: "#4b5563" }}>{dim.peerAverage}</span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280", display: "block" }}>TOP 10%</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, color: "#2563eb" }}>{dim.top10Percentile}</span>
                    </div>
                  </div>

                  {/* Comparison Visual Bar */}
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>
                      <span>Your Level ({dim.user})</span>
                      <span>Target ({dim.top10Percentile})</span>
                    </div>
                    <div style={{ background: "#f1f5f9", height: "8px", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                      <div style={{
                        background: isAhead ? "#10b981" : "#f97316",
                        height: "100%",
                        width: `${Math.min(100, dim.user)}%`,
                        borderRadius: "4px"
                      }}></div>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                    {isAhead ? `✓ +${dim.user - dim.peerAverage} points above peer average` : `⚠️ ${dim.peerAverage - dim.user} points below peer average`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actionable Delta Insights Section */}
          <div className="card" style={{ padding: "26px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              💡 Strategic Delta Upgrades to Boost Placement Odds
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.actionableInsights.map((insight, idx) => (
                <div key={idx} style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: insight.severity === "positive" ? "#f0fdf4" : insight.severity === "high" ? "#fef2f2" : "#fffbeb",
                  border: insight.severity === "positive" ? "1px solid #bbf7d0" : insight.severity === "high" ? "1px solid #fecaca" : "1px solid #fde68a",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px"
                }}>
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>
                    {insight.severity === "positive" ? "⭐" : "🎯"}
                  </span>
                  <div>
                    <h4 style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: insight.severity === "positive" ? "#166534" : insight.severity === "high" ? "#991b1b" : "#92400e",
                      marginBottom: "3px"
                    }}>
                      {insight.dimension}
                    </h4>
                    <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: "1.4" }}>
                      {insight.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default PeerBenchmarking;
