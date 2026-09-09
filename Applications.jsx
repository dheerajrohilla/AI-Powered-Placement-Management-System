import DashboardLayout from "../../layouts/DashboardLayout";

function Applications() {
  const applications = [
    {
      id: 1,
      company: "ABC Technologies",
      role: "Software Engineer",
      package: "₹8 LPA",
      date: "02 September 2026",
      status: "Shortlisted",
    },
    {
      id: 2,
      company: "Tech Solutions",
      role: "Backend Developer",
      package: "₹7 LPA",
      date: "30 August 2026",
      status: "Applied",
    },
    {
      id: 3,
      company: "Innovate Labs",
      role: "Java Developer",
      package: "₹6.5 LPA",
      date: "28 August 2026",
      status: "Interview Scheduled",
    },
    {
      id: 4,
      company: "Future Systems",
      role: "Frontend Developer",
      package: "₹6 LPA",
      date: "25 August 2026",
      status: "Rejected",
    },
  ];

  return (
    <DashboardLayout>
      <div className="applications-page">

        <div className="applications-heading">
          <div>
            <h1>My Applications</h1>
            <p>Track the status of your placement applications.</p>
          </div>
        </div>

        <div className="application-summary">

          <div>
            <span>Total Applications</span>
            <strong>4</strong>
          </div>

          <div>
            <span>Shortlisted</span>
            <strong>1</strong>
          </div>

          <div>
            <span>Interviews</span>
            <strong>1</strong>
          </div>

          <div>
            <span>Rejected</span>
            <strong>1</strong>
          </div>

        </div>

        <section className="applications-card">

          <div className="applications-card-header">
            <div>
              <h2>Application History</h2>
              <p>Your recent placement applications</p>
            </div>
          </div>

          <div className="application-list">

            {applications.map((application) => (
              <div
                className="application-item"
                key={application.id}
              >

                <div className="application-company-logo">
                  {application.company.charAt(0)}
                </div>

                <div className="application-info">
                  <h3>{application.role}</h3>
                  <p>{application.company}</p>

                  <div className="application-details">
                    <span>💰 {application.package}</span>
                    <span>📅 Applied {application.date}</span>
                  </div>
                </div>

                <div className="application-status">

                  <span
                    className={`status-badge ${application.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {application.status}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}

export default Applications;