import { useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";

function Companies() {

  const [search, setSearch] = useState("");

  const companies = [
    {
      id: 1,
      name: "ABC Technologies",
      industry: "IT & Software",
      location: "Hyderabad",
      drives: 4,
      applicants: 126,
      status: "Active"
    },
    {
      id: 2,
      name: "Tech Solutions",
      industry: "Software",
      location: "Bengaluru",
      drives: 3,
      applicants: 98,
      status: "Active"
    },
    {
      id: 3,
      name: "Infosys",
      industry: "IT Services",
      location: "Pune",
      drives: 2,
      applicants: 76,
      status: "Active"
    },
    {
      id: 4,
      name: "Wipro",
      industry: "IT Services",
      location: "Hyderabad",
      drives: 2,
      applicants: 64,
      status: "Active"
    },
    {
      id: 5,
      name: "Deloitte",
      industry: "Consulting",
      location: "Mumbai",
      drives: 1,
      applicants: 52,
      status: "Completed"
    },
    {
      id: 6,
      name: "TCS",
      industry: "IT Services",
      location: "Chennai",
      drives: 3,
      applicants: 110,
      status: "Completed"
    }
  ];

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.industry.toLowerCase().includes(search.toLowerCase()) ||
    company.location.toLowerCase().includes(search.toLowerCase())
  );

  const activeCompanies = companies.filter(
    (company) => company.status === "Active"
  ).length;

  const totalDrives = companies.reduce(
    (sum, company) => sum + company.drives,
    0
  );

  const totalApplicants = companies.reduce(
    (sum, company) => sum + company.applicants,
    0
  );

  return (
    <TPOLayout>

      <div className="company-heading">

        <div>
          <h1>Companies</h1>
          <p>Manage companies participating in campus placements.</p>
        </div>

      </div>

      {/* Statistics */}

      <div className="company-stats">

        <div className="company-stat-card">
          <h3>Total Companies</h3>
          <strong>{companies.length}</strong>
          <p>Registered companies</p>
        </div>

        <div className="company-stat-card">
          <h3>Active Companies</h3>
          <strong>{activeCompanies}</strong>
          <p>Currently recruiting</p>
        </div>

        <div className="company-stat-card">
          <h3>Total Drives</h3>
          <strong>{totalDrives}</strong>
          <p>Placement drives</p>
        </div>

        <div className="company-stat-card">
          <h3>Total Applicants</h3>
          <strong>{totalApplicants}</strong>
          <p>Student applications</p>
        </div>

      </div>

      {/* Company List */}

      <div className="company-section">

        <div className="student-toolbar">

          <div>
            <h2>Company List</h2>
            <p>View companies and their placement activities.</p>
          </div>

          <div className="student-filters">

            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Drives</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredCompanies.map((company) => (

                <tr key={company.id}>

                  <td>
                    <div className="student-name">
                      <strong>{company.name}</strong>
                      <span>Company Partner</span>
                    </div>
                  </td>

                  <td>{company.industry}</td>

                  <td>{company.location}</td>

                  <td>
                    <strong>{company.drives}</strong>
                  </td>

                  <td>{company.applicants}</td>

                  <td>
                    <span
                      className={
                        company.status === "Active"
                          ? "status-badge placed"
                          : "status-badge unplaced"
                      }
                    >
                      {company.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        alert(
                          `Company: ${company.name}\nIndustry: ${company.industry}\nLocation: ${company.location}\nPlacement Drives: ${company.drives}`
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

          {filteredCompanies.length === 0 && (
            <div className="no-students">
              No companies found.
            </div>
          )}

        </div>

      </div>

    </TPOLayout>
  );
}

export default Companies;