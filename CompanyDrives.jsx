import CompanyLayout from "../../layouts/CompanyLayout";

function CompanyDrives() {
  return (
    <CompanyLayout>

      <div className="company-page">

        <div className="company-heading">
          <div>
            <h1>Placement Drives</h1>
            <p>Manage all your company's placement opportunities.</p>
          </div>

          <button className="create-drive-btn">
            + Create Placement Drive
          </button>
        </div>

        {/* SUMMARY */}

        <div className="company-stats">

          <div className="company-stat-card">
            <div className="company-stat-icon">📢</div>
            <div>
              <span>Active Drives</span>
              <strong>4</strong>
              <p>Currently open</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon">📁</div>
            <div>
              <span>Total Drives</span>
              <strong>7</strong>
              <p>Created by company</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon">👥</div>
            <div>
              <span>Total Applicants</span>
              <strong>126</strong>
              <p>Across all drives</p>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon">⭐</div>
            <div>
              <span>Shortlisted</span>
              <strong>28</strong>
              <p>Students shortlisted</p>
            </div>
          </div>

        </div>

        {/* DRIVE LIST */}

        <section className="company-section">

          <div className="company-section-header">
            <div>
              <h2>All Placement Drives</h2>
              <p>View and manage your job openings.</p>
            </div>
          </div>

          <div className="company-drive-list">

            {/* DRIVE 1 */}

            <div className="company-drive-card">

              <div className="company-drive-icon">
                S
              </div>

              <div className="company-drive-info">

                <h3>Software Engineer</h3>

                <p>
                  Full Time • ₹8 LPA • Hyderabad
                </p>

                <div className="company-drive-meta">
                  <span>👥 52 Applicants</span>
                  <span>📅 Closes 20 Sep 2026</span>
                </div>

              </div>

              <div className="company-drive-status">

                <span>Active</span>

                <button>
                  View Details
                </button>

              </div>

            </div>

            {/* DRIVE 2 */}

            <div className="company-drive-card">

              <div className="company-drive-icon">
                B
              </div>

              <div className="company-drive-info">

                <h3>Backend Developer</h3>

                <p>
                  Full Time • ₹7 LPA • Bengaluru
                </p>

                <div className="company-drive-meta">
                  <span>👥 38 Applicants</span>
                  <span>📅 Closes 25 Sep 2026</span>
                </div>

              </div>

              <div className="company-drive-status">

                <span>Active</span>

                <button>
                  View Details
                </button>

              </div>

            </div>

            {/* DRIVE 3 */}

            <div className="company-drive-card">

              <div className="company-drive-icon">
                F
              </div>

              <div className="company-drive-info">

                <h3>Frontend Developer</h3>

                <p>
                  Full Time • ₹6 LPA • Pune
                </p>

                <div className="company-drive-meta">
                  <span>👥 36 Applicants</span>
                  <span>📅 Closes 30 Sep 2026</span>
                </div>

              </div>

              <div className="company-drive-status">

                <span>Active</span>

                <button>
                  View Details
                </button>

              </div>

            </div>

            {/* DRIVE 4 */}

            <div className="company-drive-card">

              <div className="company-drive-icon">
                J
              </div>

              <div className="company-drive-info">

                <h3>Java Developer</h3>

                <p>
                  Full Time • ₹6.5 LPA • Hyderabad
                </p>

                <div className="company-drive-meta">
                  <span>👥 24 Applicants</span>
                  <span>📅 Closed 28 Aug 2026</span>
                </div>

              </div>

              <div className="company-drive-status">

                <span className="closed-status">
                  Closed
                </span>

                <button>
                  View Details
                </button>

              </div>

            </div>

          </div>

        </section>

      </div>

    </CompanyLayout>
  );
}

export default CompanyDrives;