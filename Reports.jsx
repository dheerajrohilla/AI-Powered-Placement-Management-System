import TPOLayout from "../../layouts/TPOLayout";

function Reports() {
  return (
    <TPOLayout>

      {/* Page Header */}

      <div className="company-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Analyze placement performance and recruitment activities.
          </p>
        </div>

        <button
          className="create-drive-btn"
          onClick={() => alert("Report generated successfully!")}
        >
          Generate Report
        </button>
      </div>

      {/* Main Statistics */}

      <div className="company-stats">

        <div className="company-stat-card">
          <h3>Placement Rate</h3>
          <strong>59.5%</strong>
          <p>742 students placed</p>
        </div>

        <div className="company-stat-card">
          <h3>Average Package</h3>
          <strong>₹7.8 LPA</strong>
          <p>Average student package</p>
        </div>

        <div className="company-stat-card">
          <h3>Highest Package</h3>
          <strong>₹24 LPA</strong>
          <p>Highest package offered</p>
        </div>

        <div className="company-stat-card">
          <h3>Companies Visited</h3>
          <strong>86</strong>
          <p>Recruiting companies</p>
        </div>

      </div>

      {/* Placement Overview */}

      <div className="tpo-report-grid">

        <div className="company-section">

          <h2>Placement Overview</h2>
          <p className="report-subtitle">
            Student placement statistics for the current academic year.
          </p>

          <div className="report-bars">

            <div className="report-bar-item">
              <div>
                <span>Total Students</span>
                <strong>1,248</strong>
              </div>

              <div className="report-bar">
                <div
                  className="report-bar-fill"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div className="report-bar-item">
              <div>
                <span>Students Placed</span>
                <strong>742</strong>
              </div>

              <div className="report-bar">
                <div
                  className="report-bar-fill"
                  style={{ width: "59.5%" }}
                ></div>
              </div>
            </div>

            <div className="report-bar-item">
              <div>
                <span>Students Unplaced</span>
                <strong>506</strong>
              </div>

              <div className="report-bar">
                <div
                  className="report-bar-fill"
                  style={{ width: "40.5%" }}
                ></div>
              </div>
            </div>

          </div>

        </div>

        {/* Package Statistics */}

        <div className="company-section">

          <h2>Package Statistics</h2>
          <p className="report-subtitle">
            Distribution of salary packages offered.
          </p>

          <div className="package-list">

            <div className="package-item">
              <span>Below ₹5 LPA</span>
              <strong>184</strong>
            </div>

            <div className="package-item">
              <span>₹5 - ₹8 LPA</span>
              <strong>312</strong>
            </div>

            <div className="package-item">
              <span>₹8 - ₹12 LPA</span>
              <strong>176</strong>
            </div>

            <div className="package-item">
              <span>Above ₹12 LPA</span>
              <strong>70</strong>
            </div>

          </div>

        </div>

      </div>

      {/* Company Performance */}

      <div className="company-section">

        <h2>Top Recruiting Companies</h2>
        <p className="report-subtitle">
          Companies with the highest number of selected students.
        </p>

        <div className="report-company-grid">

          <div className="report-company-card">
            <div className="company-avatar">A</div>
            <div>
              <strong>ABC Technologies</strong>
              <span>126 applicants</span>
            </div>
            <b>42 Placed</b>
          </div>

          <div className="report-company-card">
            <div className="company-avatar">T</div>
            <div>
              <strong>Tech Solutions</strong>
              <span>98 applicants</span>
            </div>
            <b>36 Placed</b>
          </div>

          <div className="report-company-card">
            <div className="company-avatar">I</div>
            <div>
              <strong>Infosys</strong>
              <span>76 applicants</span>
            </div>
            <b>31 Placed</b>
          </div>

          <div className="report-company-card">
            <div className="company-avatar">D</div>
            <div>
              <strong>Deloitte</strong>
              <span>52 applicants</span>
            </div>
            <b>24 Placed</b>
          </div>

        </div>

      </div>

      {/* Quick Reports */}

      <div className="company-section">

        <h2>Quick Reports</h2>

        <div className="quick-report-grid">

          <button
            onClick={() => alert("Student placement report generated!")}
          >
            👨‍🎓
            <span>Student Placement Report</span>
            <small>View student placement details</small>
          </button>

          <button
            onClick={() => alert("Company recruitment report generated!")}
          >
            🏢
            <span>Company Recruitment Report</span>
            <small>View company recruitment data</small>
          </button>

          <button
            onClick={() => alert("Drive performance report generated!")}
          >
            📢
            <span>Drive Performance Report</span>
            <small>Analyze placement drives</small>
          </button>

          <button
            onClick={() => alert("Package analysis report generated!")}
          >
            💰
            <span>Package Analysis</span>
            <small>Analyze salary packages</small>
          </button>

        </div>

      </div>

    </TPOLayout>
  );
}

export default Reports;