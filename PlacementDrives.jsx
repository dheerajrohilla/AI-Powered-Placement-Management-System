import { useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";

function PlacementDrives() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const drives = [
    {
      id: 1,
      job: "Software Engineer",
      company: "ABC Technologies",
      package: "₹8 LPA",
      location: "Hyderabad",
      applicants: 52,
      deadline: "20 Sep 2026",
      status: "Active",
    },
    {
      id: 2,
      job: "Backend Developer",
      company: "Tech Solutions",
      package: "₹7 LPA",
      location: "Bengaluru",
      applicants: 38,
      deadline: "25 Sep 2026",
      status: "Active",
    },
    {
      id: 3,
      job: "Frontend Developer",
      company: "Infosys",
      package: "₹6 LPA",
      location: "Pune",
      applicants: 36,
      deadline: "30 Sep 2026",
      status: "Active",
    },
    {
      id: 4,
      job: "Java Developer",
      company: "Wipro",
      package: "₹6.5 LPA",
      location: "Hyderabad",
      applicants: 24,
      deadline: "28 Aug 2026",
      status: "Closed",
    },
    {
      id: 5,
      job: "Data Analyst",
      company: "Deloitte",
      package: "₹9 LPA",
      location: "Mumbai",
      applicants: 31,
      deadline: "15 Sep 2026",
      status: "Active",
    },
    {
      id: 6,
      job: "Software Developer",
      company: "TCS",
      package: "₹7.5 LPA",
      location: "Chennai",
      applicants: 45,
      deadline: "10 Aug 2026",
      status: "Closed",
    },
  ];

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.job.toLowerCase().includes(search.toLowerCase()) ||
      drive.company.toLowerCase().includes(search.toLowerCase()) ||
      drive.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || drive.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeDrives = drives.filter(
    (drive) => drive.status === "Active"
  ).length;

  const closedDrives = drives.filter(
    (drive) => drive.status === "Closed"
  ).length;

  const totalApplicants = drives.reduce(
    (sum, drive) => sum + drive.applicants,
    0
  );

  return (
    <TPOLayout>
      <div className="company-heading">
        <div>
          <h1>Placement Drives</h1>
          <p>Monitor and manage all placement drives.</p>
        </div>
      </div>

      <div className="company-stats">
        <div className="company-stat-card">
          <h3>Total Drives</h3>
          <strong>{drives.length}</strong>
          <p>All placement drives</p>
        </div>

        <div className="company-stat-card">
          <h3>Active Drives</h3>
          <strong>{activeDrives}</strong>
          <p>Currently accepting applications</p>
        </div>

        <div className="company-stat-card">
          <h3>Closed Drives</h3>
          <strong>{closedDrives}</strong>
          <p>Completed drives</p>
        </div>

        <div className="company-stat-card">
          <h3>Total Applicants</h3>
          <strong>{totalApplicants}</strong>
          <p>Applications received</p>
        </div>
      </div>

      <div className="company-section">
        <div className="student-toolbar">
          <div>
            <h2>All Placement Drives</h2>
            <p>View placement opportunities from all companies.</p>
          </div>

          <div className="student-filters">
            <input
              type="text"
              placeholder="Search drives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Drives</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="student-table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Job Role</th>
                <th>Company</th>
                <th>Package</th>
                <th>Location</th>
                <th>Applicants</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDrives.map((drive) => (
                <tr key={drive.id}>
                  <td>
                    <div className="student-name">
                      <strong>{drive.job}</strong>
                      <span>Placement Drive</span>
                    </div>
                  </td>

                  <td>{drive.company}</td>

                  <td>
                    <strong>{drive.package}</strong>
                  </td>

                  <td>{drive.location}</td>

                  <td>{drive.applicants}</td>

                  <td>{drive.deadline}</td>

                  <td>
                    <span
                      className={
                        drive.status === "Active"
                          ? "status-badge placed"
                          : "status-badge unplaced"
                      }
                    >
                      {drive.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        alert(
                          `Job Role: ${drive.job}\nCompany: ${drive.company}\nPackage: ${drive.package}\nApplicants: ${drive.applicants}`
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

          {filteredDrives.length === 0 && (
            <div className="no-students">
              No placement drives found.
            </div>
          )}
        </div>
      </div>
    </TPOLayout>
  );
}

export default PlacementDrives;