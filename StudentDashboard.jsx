import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";

function StudentDashboard() {
  return (
    <DashboardLayout>

      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Track your placement journey from one place.</p>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="ATS Score"
          value="82%"
          icon="🤖"
          description="Good resume score"
        />

        <StatCard
          title="Applications"
          value="12"
          icon="📋"
          description="3 applications pending"
        />

        <StatCard
          title="Interviews"
          value="3"
          icon="📅"
          description="1 upcoming interview"
        />

        <StatCard
          title="Profile Strength"
          value="88%"
          icon="👤"
          description="Almost complete"
        />

      </div>

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Recommended Opportunities</h2>
            <p>Jobs that match your profile and skills</p>
          </div>

          <button>View All</button>
        </div>

        <div className="job-list">

          <div className="job-card">
            <div>
              <h3>Software Engineer</h3>
              <p>ABC Technologies</p>
              <span>₹8 LPA • Full Time</span>
            </div>

            <div className="match-score">
              94% Match
            </div>
          </div>

          <div className="job-card">
            <div>
              <h3>Backend Developer</h3>
              <p>Tech Solutions</p>
              <span>₹7 LPA • Full Time</span>
            </div>

            <div className="match-score">
              89% Match
            </div>
          </div>

          <div className="job-card">
            <div>
              <h3>Java Developer</h3>
              <p>Innovate Labs</p>
              <span>₹6.5 LPA • Full Time</span>
            </div>

            <div className="match-score">
              86% Match
            </div>
          </div>

        </div>

      </section>

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Upcoming Interview</h2>
            <p>Your next scheduled interview</p>
          </div>
        </div>

        <div className="interview-card">

          <div>
            <h3>Software Engineer — ABC Technologies</h3>
            <p>Technical Interview</p>
          </div>

          <div>
            <strong>12 September 2026</strong>
            <span>10:30 AM</span>
          </div>

        </div>

      </section>

    </DashboardLayout>
  );
}

export default StudentDashboard;