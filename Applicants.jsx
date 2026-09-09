import { useState } from "react";
import CompanyLayout from "../../layouts/CompanyLayout";

function Applicants() {

  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: "Prajwal Budhwant",
      email: "prajwal@example.com",
      role: "Software Engineer",
      cgpa: "8.2",
      ats: 82,
      skills: "Java, React, SQL",
      applied: "02 Sep 2026",
      status: "Applied",
    },
    {
      id: 2,
      name: "Aditya Sharma",
      email: "aditya@example.com",
      role: "Software Engineer",
      cgpa: "9.1",
      ats: 91,
      skills: "Java, Spring Boot, MySQL",
      applied: "01 Sep 2026",
      status: "Shortlisted",
    },
    {
      id: 3,
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "Backend Developer",
      cgpa: "8.8",
      ats: 88,
      skills: "Java, Spring Boot, SQL",
      applied: "31 Aug 2026",
      status: "Applied",
    },
    {
      id: 4,
      name: "Sneha Reddy",
      email: "sneha@example.com",
      role: "Frontend Developer",
      cgpa: "8.6",
      ats: 86,
      skills: "React, JavaScript, CSS",
      applied: "30 Aug 2026",
      status: "Applied",
    },
    {
      id: 5,
      name: "Arjun Patel",
      email: "arjun@example.com",
      role: "Software Engineer",
      cgpa: "7.9",
      ats: 74,
      skills: "Python, C++, SQL",
      applied: "29 Aug 2026",
      status: "Rejected",
    },
  ]);

  const updateStatus = (id, newStatus) => {

    setApplicants(
      applicants.map((applicant) =>
        applicant.id === id
          ? { ...applicant, status: newStatus }
          : applicant
      )
    );

  };

  return (
    <CompanyLayout>

      <div className="company-page">

        {/* HEADER */}

        <div className="company-heading">

          <div>
            <h1>Applicants</h1>

            <p>
              Review and manage students who applied to your placement drives.
            </p>
          </div>

        </div>

        {/* STATS */}

        <div className="company-stats">

          <div className="company-stat-card">
            <div className="company-stat-icon">
              👥
            </div>

            <div>
              <span>Total Applicants</span>
              <strong>{applicants.length}</strong>
              <p>Across all drives</p>
            </div>
          </div>


          <div className="company-stat-card">
            <div className="company-stat-icon">
              ⏳
            </div>

            <div>
              <span>Pending Review</span>

              <strong>
                {
                  applicants.filter(
                    (a) => a.status === "Applied"
                  ).length
                }
              </strong>

              <p>Need review</p>
            </div>
          </div>


          <div className="company-stat-card">
            <div className="company-stat-icon">
              ⭐
            </div>

            <div>
              <span>Shortlisted</span>

              <strong>
                {
                  applicants.filter(
                    (a) => a.status === "Shortlisted"
                  ).length
                }
              </strong>

              <p>Selected for next round</p>
            </div>
          </div>


          <div className="company-stat-card">
            <div className="company-stat-icon">
              ❌
            </div>

            <div>
              <span>Rejected</span>

              <strong>
                {
                  applicants.filter(
                    (a) => a.status === "Rejected"
                  ).length
                }
              </strong>

              <p>Not selected</p>
            </div>
          </div>

        </div>

        {/* APPLICANTS */}

        <section className="company-section">

          <div className="company-section-header">

            <div>
              <h2>All Applicants</h2>

              <p>
                Review applicant profiles and take action.
              </p>
            </div>

          </div>


          <div className="applicants-list">

            {applicants.map((applicant) => (

              <div
                className="applicant-card"
                key={applicant.id}
              >

                {/* PROFILE */}

                <div className="applicant-profile">

                  <div className="applicant-avatar">
                    {applicant.name.charAt(0)}
                  </div>

                  <div>

                    <h3>
                      {applicant.name}
                    </h3>

                    <p>
                      {applicant.email}
                    </p>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="applicant-details">

                  <div>
                    <span>Applied For</span>
                    <strong>{applicant.role}</strong>
                  </div>

                  <div>
                    <span>CGPA</span>
                    <strong>{applicant.cgpa}</strong>
                  </div>

                  <div>
                    <span>ATS Score</span>

                    <strong className="ats-score">
                      {applicant.ats}%
                    </strong>
                  </div>

                  <div>
                    <span>Applied On</span>
                    <strong>{applicant.applied}</strong>
                  </div>

                </div>


                {/* SKILLS */}

                <div className="applicant-skills">

                  <span>Skills</span>

                  <p>
                    {applicant.skills}
                  </p>

                </div>


                {/* STATUS */}

                <div className="applicant-status">

                  <span
                    className={
                      applicant.status === "Shortlisted"
                        ? "status-shortlisted"
                        : applicant.status === "Rejected"
                        ? "status-rejected"
                        : "status-applied"
                    }
                  >
                    {applicant.status}
                  </span>

                </div>


                {/* ACTIONS */}

                <div className="applicant-actions">

                  <button className="view-profile-btn">
                    View Profile
                  </button>


                  {applicant.status !== "Shortlisted" && (
                    <button
                      className="shortlist-btn"
                      onClick={() =>
                        updateStatus(
                          applicant.id,
                          "Shortlisted"
                        )
                      }
                    >
                      ✓ Shortlist
                    </button>
                  )}


                  {applicant.status !== "Rejected" && (
                    <button
                      className="reject-btn"
                      onClick={() =>
                        updateStatus(
                          applicant.id,
                          "Rejected"
                        )
                      }
                    >
                      ✕ Reject
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

    </CompanyLayout>
  );
}

export default Applicants;