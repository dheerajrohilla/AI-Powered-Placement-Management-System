function StatCard({ title, value, icon, description, trend, trendType = "up", color = "blue" }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div className="stat-icon">
          {icon}
        </div>
        {trend && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "12px",
              background: trendType === "up" ? "#ecfdf5" : "#eff6ff",
              color: trendType === "up" ? "#059669" : "#2563eb",
              border: `1px solid ${trendType === "up" ? "#a7f3d0" : "#bfdbfe"}`
            }}
          >
            {trend}
          </span>
        )}
      </div>

      <div>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          {title}
        </p>
        <h2 style={{ margin: "4px 0 2px", fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          {value}
        </h2>
        {description && (
          <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;