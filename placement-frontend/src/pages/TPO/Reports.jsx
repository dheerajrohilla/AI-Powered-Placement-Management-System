import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

const toLpa = (value) => (value ? (value / 100000).toFixed(1) : "0.0");

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tpoAPI.generateReports()
      .then((res) => setReport(res.data))
      .catch((err) => console.error("Error loading reports:", err))
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["Placement Season Report", new Date().toLocaleDateString()],
      [],
      ["Metric", "Value"],
      ["Total Registered Students", report.totalStudents],
      ["Students Placed", report.placedStudents],
      ["Students Unplaced", report.unplacedStudents],
      ["Placement Rate (%)", `${report.placementRate}%`],
      ["Average Package (INR)", report.averagePackage],
      ["Highest Package (INR)", report.highestPackage],
      ["Total Companies", report.totalCompanies],
      ["Total Applications", report.totalApplications]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Placement_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Placement_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const totalStudents = report?.totalStudents || 0;
  const placedStudents = report?.placedStudents || 0;
  const unplacedStudents = report?.unplacedStudents || 0;
  const placementRate = report?.placementRate || 0;
  const placedPct = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;
  const unplacedPct = totalStudents > 0 ? (unplacedStudents / totalStudents) * 100 : 0;
  const packageDistribution = report?.packageDistribution || [];
  const topCompanies = report?.topCompanies || [];

  return (
    <TPOLayout>
      <div className="company-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Placement Summary Reports & Export</h1>
          <p>Generate, export, and print comprehensive campus placement data reports.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="create-drive-btn" style={{ background: '#2563eb' }} onClick={exportCSV}>
            📥 Export CSV
          </button>
          <button className="create-drive-btn" style={{ background: '#059669' }} onClick={exportJSON}>
            📄 Export JSON
          </button>
          <button className="create-drive-btn" style={{ background: '#475569' }} onClick={handlePrint}>
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {loading && <p className="no-data">Loading report data...</p>}

      {!loading && (
        <>
          <div className="company-stats">
            <div className="company-stat-card">
              <span>Placement Rate</span>
              <strong style={{ color: '#16a34a' }}>{placementRate}%</strong>
              <p>{placedStudents} students placed</p>
            </div>

            <div className="company-stat-card">
              <span>Average Package</span>
              <strong style={{ color: '#2563eb' }}>₹{toLpa(report?.averagePackage)} LPA</strong>
              <p>Average student salary</p>
            </div>

            <div className="company-stat-card">
              <span>Highest Package</span>
              <strong style={{ color: '#c026d3' }}>₹{toLpa(report?.highestPackage)} LPA</strong>
              <p>Highest salary offered</p>
            </div>

            <div className="company-stat-card">
              <span>Recruiting Partners</span>
              <strong>{report?.totalCompanies || 0}</strong>
              <p>{report?.verifiedCompanies || 0} verified companies</p>
            </div>
          </div>

          <div className="tpo-report-grid">
            <div className="company-section">
              <h2>Placement Season Overview</h2>
              <p className="report-subtitle">Student placement statistics for current season.</p>

              <div className="report-bars" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className="report-bar-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Total Registered Candidates</span>
                    <strong>{totalStudents}</strong>
                  </div>
                  <div className="report-bar" style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                    <div className="report-bar-fill" style={{ width: "100%", height: '100%', background: '#64748b' }}></div>
                  </div>
                </div>

                <div className="report-bar-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Students Placed</span>
                    <strong>{placedStudents} ({placedPct.toFixed(1)}%)</strong>
                  </div>
                  <div className="report-bar" style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                    <div className="report-bar-fill" style={{ width: `${placedPct}%`, height: '100%', background: '#16a34a' }}></div>
                  </div>
                </div>

                <div className="report-bar-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Students Unplaced</span>
                    <strong>{unplacedStudents} ({unplacedPct.toFixed(1)}%)</strong>
                  </div>
                  <div className="report-bar" style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                    <div className="report-bar-fill" style={{ width: `${unplacedPct}%`, height: '100%', background: '#dc2626' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="company-section">
              <h2>Salary Package Distribution</h2>
              <p className="report-subtitle">Distribution of CTC packages offered.</p>

              <div className="package-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {packageDistribution.map((bucket) => (
                  <div className="package-item" key={bucket.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span>{bucket.label}</span>
                    <strong style={{ color: '#2563eb' }}>{bucket.count} Offers</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="company-section" style={{ marginTop: '24px' }}>
            <h2>Top Recruiting Companies</h2>
            <p className="report-subtitle">Companies with the highest student selections.</p>

            <div className="report-company-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
              {topCompanies.length > 0 ? (
                topCompanies.map((company) => (
                  <div className="report-company-card" key={company.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div className="company-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block' }}>{company.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{company.applicants} applicants</span>
                    </div>
                    <b style={{ color: '#16a34a' }}>{company.placed} Placed</b>
                  </div>
                ))
              ) : (
                <p className="no-data">No recruitment data available yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </TPOLayout>
  );
}

export default Reports;
