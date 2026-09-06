import { useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";

function Interviews() {
  const [statusFilter, setStatusFilter] = useState("All");

  const interviews = [
    {
      id: 1,
      student: "Aditya Sharma",
      company: "ABC Technologies",
      role: "Software Engineer",
      date: "08 Sep 2026",
      time: "10:00 AM",
      round: "Technical Round",
      status: "Upcoming",
    },
    {
      id: 2,
      student: "Rahul Kumar",
      company: "Tech Solutions",
      role: "Backend Developer",
      date: "09 Sep 2026",
      time: "11:30 AM",
      round: "HR Round",
      status: "Upcoming",
    },
    {
      id: 3,
      student: "Sneha Reddy",
      company: "Infosys",
      role: "Frontend Developer",
      date: "10 Sep 2026",
      time: "02:00 PM",
      round: "Technical Round",
      status: "Upcoming",
    },
    {
      id: 4,
      student: "Prajwal Budhwant",
      company: "ABC Technologies",
      role: "Software Engineer",
      date: "05 Sep 2026",
      time: "03:00 PM",
      round: "Aptitude Round",
      status: "Completed",
    },
    {
      id: 5,
      student: "Rohit Verma",
      company: "Deloitte",
      role: "Data Analyst",
      date: "03 Sep 2026",
      time: "11:00 AM",
      round: "Technical Round",
      status: "Completed",
    },
    {
      id: 6,
      student: "Ananya Singh",
      company: "TCS",
      role: "Software Developer",
      date: "12 Sep 2026",
      time: "04:00 PM",
      round: "HR Round",
      status: "Pending",
    },
  ];

  const filteredInterviews = interviews.filter((interview) => {
    return (
      statusFilter === "All" ||
      interview.status === statusFilter
    );
  });

  const upcoming = interviews.filter(
    (item) => item.status === "Upcoming"
  ).length;

  const completed = interviews.filter(
    (item) => item.status === "Completed"
  ).length;

  const pending = interviews.filter(
    (item) => item.status === "Pending"
  ).length;

  return (
    <TPOLayout>

      <div className="company-heading">
        <div>
          <h1>Interviews</h1>
          <p>
            Monitor and manage student interviews across companies.
          </p>
        </div>
      </div>

      {/* Statistics */}

      <div className="company-stats">

        <div className="company-stat-card">
          <h3>Total Interviews</h3>
          <strong>{interviews.length}</strong>
          <p>All scheduled interviews</p>
        </div>

        <div className="company-stat-card">
          <h3>Upcoming</h3>
          <strong>{upcoming}</strong>
          <p>Interviews coming up</p>
        </div>

        <div className="company-stat-card">
          <h3>Completed</h3>
          <strong>{completed}</strong>
          <p>Interviews completed</p>
        </div>

        <div className="company-stat-card">
          <h3>Pending</h3>
          <strong>{pending}</strong>
          <p>Awaiting scheduling</p>
        </div>

      </div>

      {/* Interview Table */}

      <div className="company-section">

        <div className="student-toolbar">

          <div>
            <h2>Interview Schedule</h2>
            <p>
              View and monitor all student interviews.
            </p>
          </div>

          <div className="student-filters">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Interviews</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

          </div>

        </div>

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Job Role</th>
                <th>Date</th>
                <th>Time</th>
                <th>Round</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredInterviews.map((interview) => (

                <tr key={interview.id}>

                  <td>
                    <div className="student-name">
                      <strong>
                        {interview.student}
                      </strong>
                      <span>
                        Student
                      </span>
                    </div>
                  </td>

                  <td>
                    {interview.company}
                  </td>

                  <td>
                    {interview.role}
                  </td>

                  <td>
                    {interview.date}
                  </td>

                  <td>
                    {interview.time}
                  </td>

                  <td>
                    {interview.round}
                  </td>

                  <td>

                    <span
                      className={
                        interview.status === "Completed"
                          ? "status-badge placed"
                          : interview.status === "Pending"
                          ? "status-badge unplaced"
                          : "status-badge active"
                      }
                    >
                      {interview.status}
                    </span>

                  </td>

                  <td>

                    <button
                      className="view-btn"
                      onClick={() =>
                        alert(
                          `Student: ${interview.student}\nCompany: ${interview.company}\nJob Role: ${interview.role}\nDate: ${interview.date}\nTime: ${interview.time}\nRound: ${interview.round}\nStatus: ${interview.status}`
                        )
                      }
                    >
                      View Details
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredInterviews.length === 0 && (
            <div className="no-students">
              No interviews found.
            </div>
          )}

        </div>

      </div>

    </TPOLayout>
  );
}

export default Interviews;