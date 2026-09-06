import { Link } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";

function CompanyDashboard() {
  return (
    <CompanyLayout>
      <div className="company-page">

        <div className="company-heading">
          <div>
            <h1>Company Dashboard</h1>
            <p>
              Manage your placement activities and find suitable candidates.
            </p>
          </div>

          <Link to="/company/create-drive">
            <button className="create-drive-btn">
              + Create Placement Drive
            </button>
          </Link>
        </div>

        {/* STAT CARDS */}

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

          <div className="company-stat-card">
            <div className="company-stat-icon">📅</div>
            <div>
              <span>Interviews</span>
              <strong>12</strong>
              <p>Scheduled interviews</p>
            </div>
          </div>

        </div>

        {/* ACTIVE DRIVES */}

        <section className="company-section">

          <div className="company-section-header">
            <div>
              <h2>Active Placement Drives</h2>
              <p>Currently open positions</p>
            </div>

            <button>View All</button>
          </div>

          <div className="company-drive-list">

            <div className="company-drive-card">

              <div className="company-drive-icon">
                S
              </div>

              <div className="company-drive-info">
                <h3>Software Engineer</h3>
                <p>Full Time • ₹8 LPA</p>

                <div className="company-drive-meta">
                  <span>👥 52 Applicants</span>
                  <span>📅 Closes 20 Sep 2026</span>
                </div>
              </div>

              <div className="company-drive-status">
                <span>Active</span>
                <button>View Applicants</button>
              </div>

            </div>

            <div className="company-drive-card">

              <div className="company-drive-icon">
                B
              </div>

              <div className="company-drive-info">
                <h3>Backend Developer</h3>
                <p>Full Time • ₹7 LPA</p>

                <div className="company-drive-meta">
                  <span>👥 38 Applicants</span>
                  <span>📅 Closes 25 Sep 2026</span>
                </div>
              </div>

              <div className="company-drive-status">
                <span>Active</span>
                <button>View Applicants</button>
              </div>

            </div>

            <div className="company-drive-card">

              <div className="company-drive-icon">
                F
              </div>

              <div className="company-drive-info">
                <h3>Frontend Developer</h3>
                <p>Full Time • ₹6 LPA</p>

                <div className="company-drive-meta">
                  <span>👥 36 Applicants</span>
                  <span>📅 Closes 30 Sep 2026</span>
                </div>
              </div>

              <div className="company-drive-status">
                <span>Active</span>
                <button>View Applicants</button>
              </div>

            </div>

          </div>

        </section>

        {/* RECENT APPLICANTS */}

        <section className="company-section">

          <div className="company-section-header">
            <div>
              <h2>Recent Applicants</h2>
              <p>Students who recently applied to your drives</p>
            </div>

            <button>View All</button>
          </div>

          <div className="applicant-list">

            <div className="applicant-row">

              <div className="applicant-avatar">P</div>

              <div className="applicant-info">
                <h3>Prajwal Budhwant</h3>
                <p>Software Engineer • CGPA 6.0</p>
              </div>

              <span className="applicant-score">
                ATS 82%
              </span>

              <span className="applicant-status">
                New
              </span>

            </div>

            <div className="applicant-row">

              <div className="applicant-avatar">A</div>

              <div className="applicant-info">
                <h3>Aditya Sharma</h3>
                <p>Backend Developer • CGPA 7.4</p>
              </div>

              <span className="applicant-score">
                ATS 91%
              </span>

              <span className="applicant-status">
                New
              </span>

            </div>

            <div className="applicant-row">

              <div className="applicant-avatar">R</div>

              <div className="applicant-info">
                <h3>Rahul Kumar</h3>
                <p>Software Engineer • CGPA 7.8</p>
              </div>

              <span className="applicant-score">
                ATS 88%
              </span>

              <span className="applicant-status">
                Reviewed
              </span>

            </div>

          </div>

        </section>

      </div>
    </CompanyLayout>
  );
}

export default CompanyDashboard;