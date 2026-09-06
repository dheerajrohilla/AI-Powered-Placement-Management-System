import TPOLayout from "../../layouts/TPOLayout";

function TPODashboard() {
  return (
    <TPOLayout>

      <div className="tpo-page">

        {/* HEADER */}

        <div className="company-heading">

          <div>
            <h1>TPO Dashboard</h1>

            <p>
              Monitor students, companies, placement drives and recruitment activities.
            </p>
          </div>

          <button className="create-drive-btn">
            📊 Generate Report
          </button>

        </div>


        {/* STATS */}

        <div className="company-stats">

          <div className="company-stat-card">

            <div className="company-stat-icon">
              👨‍🎓
            </div>

            <div>
              <span>Total Students</span>
              <strong>1,248</strong>
              <p>Registered students</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              🏢
            </div>

            <div>
              <span>Companies</span>
              <strong>86</strong>
              <p>Registered companies</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              📢
            </div>

            <div>
              <span>Active Drives</span>
              <strong>24</strong>
              <p>Currently active</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              🎯
            </div>

            <div>
              <span>Students Placed</span>
              <strong>742</strong>
              <p>Current placement season</p>
            </div>

          </div>

        </div>


        {/* MAIN SECTIONS */}

        <div className="tpo-dashboard-grid">

          {/* RECENT ACTIVITY */}

          <section className="company-section">

            <div className="company-section-header">

              <div>
                <h2>Recent Placement Activity</h2>

                <p>
                  Latest recruitment updates.
                </p>
              </div>

            </div>


            <div className="tpo-activity-list">

              <div className="tpo-activity-item">

                <div className="tpo-activity-icon">
                  🎉
                </div>

                <div>
                  <strong>Aditya Sharma was placed</strong>
                  <p>ABC Technologies • Software Engineer</p>
                  <span>2 hours ago</span>
                </div>

              </div>


              <div className="tpo-activity-item">

                <div className="tpo-activity-icon">
                  🏢
                </div>

                <div>
                  <strong>New company registered</strong>
                  <p>TechNova Solutions</p>
                  <span>5 hours ago</span>
                </div>

              </div>


              <div className="tpo-activity-item">

                <div className="tpo-activity-icon">
                  📢
                </div>

                <div>
                  <strong>New placement drive created</strong>
                  <p>Infosys • Graduate Software Engineer</p>
                  <span>Yesterday</span>
                </div>

              </div>


              <div className="tpo-activity-item">

                <div className="tpo-activity-icon">
                  ⭐
                </div>

                <div>
                  <strong>18 students shortlisted</strong>
                  <p>ABC Technologies • Software Engineer</p>
                  <span>Yesterday</span>
                </div>

              </div>

            </div>

          </section>


          {/* UPCOMING INTERVIEWS */}

          <section className="company-section">

            <div className="company-section-header">

              <div>
                <h2>Upcoming Interviews</h2>

                <p>
                  Interviews scheduled this week.
                </p>
              </div>

            </div>


            <div className="tpo-interview-list">

              <div className="tpo-interview-card">

                <div className="tpo-date">
                  <strong>08</strong>
                  <span>SEP</span>
                </div>

                <div>
                  <strong>ABC Technologies</strong>
                  <p>Software Engineer</p>
                  <span>10:00 AM • Online</span>
                </div>

              </div>


              <div className="tpo-interview-card">

                <div className="tpo-date">
                  <strong>09</strong>
                  <span>SEP</span>
                </div>

                <div>
                  <strong>TechNova Solutions</strong>
                  <p>Backend Developer</p>
                  <span>11:30 AM • Online</span>
                </div>

              </div>


              <div className="tpo-interview-card">

                <div className="tpo-date">
                  <strong>10</strong>
                  <span>SEP</span>
                </div>

                <div>
                  <strong>Infosys</strong>
                  <p>Graduate Software Engineer</p>
                  <span>02:00 PM • Campus</span>
                </div>

              </div>

            </div>

          </section>

        </div>


        {/* PLACEMENT STATISTICS */}

        <section className="company-section">

          <div className="company-section-header">

            <div>
              <h2>Placement Statistics</h2>

              <p>
                Current placement season overview.
              </p>
            </div>

          </div>


          <div className="tpo-placement-stats">

            <div>
              <span>Placement Rate</span>
              <strong>59.5%</strong>
            </div>

            <div>
              <span>Average Package</span>
              <strong>₹7.8 LPA</strong>
            </div>

            <div>
              <span>Highest Package</span>
              <strong>₹24 LPA</strong>
            </div>

            <div>
              <span>Companies Visited</span>
              <strong>86</strong>
            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}

        <section className="company-section">

          <div className="company-section-header">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Frequently used TPO functions.
              </p>
            </div>

          </div>


          <div className="tpo-quick-actions">

            <button>
              👨‍🎓 Manage Students
            </button>

            <button>
              🏢 Manage Companies
            </button>

            <button>
              📢 Manage Placement Drives
            </button>

            <button>
              📊 View Reports
            </button>

          </div>

        </section>

      </div>

    </TPOLayout>
  );
}

export default TPODashboard;