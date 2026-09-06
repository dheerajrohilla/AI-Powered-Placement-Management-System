import AdminLayout from "../../layouts/AdminLayout";

function AdminDashboard() {
  return (
    <AdminLayout>

      {/* Page Header */}

      <div className="company-heading">

        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage and monitor the complete placement management system.
          </p>
        </div>

        <button
          className="create-drive-btn"
          onClick={() => alert("System report generated successfully!")}
        >
          Generate Report
        </button>

      </div>

      {/* Statistics */}

      <div className="company-stats">

        <div className="company-stat-card">
          <h3>Total Students</h3>
          <strong>1,248</strong>
          <p>Registered students</p>
        </div>

        <div className="company-stat-card">
          <h3>Total Companies</h3>
          <strong>86</strong>
          <p>Registered companies</p>
        </div>

        <div className="company-stat-card">
          <h3>Placement Drives</h3>
          <strong>42</strong>
          <p>Total placement drives</p>
        </div>

        <div className="company-stat-card">
          <h3>Students Placed</h3>
          <strong>742</strong>
          <p>Successfully placed</p>
        </div>

      </div>

      {/* System Overview */}

      <div className="company-section">

        <h2>System Overview</h2>
        <p className="report-subtitle">
          Current status of the placement management system.
        </p>

        <div className="admin-overview-grid">

          <div className="admin-overview-card">
            <div className="admin-icon">👨‍🎓</div>

            <div>
              <strong>Students</strong>
              <span>1,248 registered</span>
            </div>

            <b>Active</b>
          </div>

          <div className="admin-overview-card">
            <div className="admin-icon">🏢</div>

            <div>
              <strong>Companies</strong>
              <span>86 registered</span>
            </div>

            <b>Active</b>
          </div>

          <div className="admin-overview-card">
            <div className="admin-icon">📢</div>

            <div>
              <strong>Placement Drives</strong>
              <span>24 currently active</span>
            </div>

            <b>Active</b>
          </div>

          <div className="admin-overview-card">
            <div className="admin-icon">📅</div>

            <div>
              <strong>Interviews</strong>
              <span>12 upcoming</span>
            </div>

            <b>Scheduled</b>
          </div>

        </div>

      </div>

      {/* Recent Activity */}

      <div className="company-section">

        <h2>Recent System Activity</h2>
        <p className="report-subtitle">
          Latest activities across the placement portal.
        </p>

        <div className="admin-activity-list">

          <div className="admin-activity">
            <div className="activity-icon">👨‍🎓</div>

            <div>
              <strong>New student registered</strong>
              <span>Prajwal Budhwant joined the placement portal.</span>
            </div>

            <small>Today</small>
          </div>

          <div className="admin-activity">
            <div className="activity-icon">🏢</div>

            <div>
              <strong>New company registered</strong>
              <span>ABC Technologies registered as a recruiter.</span>
            </div>

            <small>Today</small>
          </div>

          <div className="admin-activity">
            <div className="activity-icon">📢</div>

            <div>
              <strong>Placement drive created</strong>
              <span>Software Engineer drive was created.</span>
            </div>

            <small>Yesterday</small>
          </div>

          <div className="admin-activity">
            <div className="activity-icon">✅</div>

            <div>
              <strong>Student placed</strong>
              <span>Aditya Sharma was selected by ABC Technologies.</span>
            </div>

            <small>Yesterday</small>
          </div>

        </div>

      </div>

      {/* Quick Actions */}

      <div className="company-section">

        <h2>Quick Actions</h2>

        <div className="quick-report-grid">

          <button
            onClick={() =>
              window.location.href = "/admin/students"
            }
          >
            👨‍🎓
            <span>Manage Students</span>
            <small>View and manage student accounts</small>
          </button>

          <button
            onClick={() =>
              window.location.href = "/admin/companies"
            }
          >
            🏢
            <span>Manage Companies</span>
            <small>View registered companies</small>
          </button>

          <button
            onClick={() =>
              window.location.href = "/admin/drives"
            }
          >
            📢
            <span>Manage Drives</span>
            <small>Monitor placement drives</small>
          </button>

          <button
            onClick={() =>
              window.location.href = "/admin/reports"
            }
          >
            📊
            <span>View Reports</span>
            <small>View system analytics</small>
          </button>

        </div>

      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;