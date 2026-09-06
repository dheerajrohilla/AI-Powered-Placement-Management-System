import CompanyLayout from "../../layouts/CompanyLayout";

function Shortlisted() {

  const shortlistedStudents = [
    {
      id: 1,
      name: "Aditya Sharma",
      email: "aditya@example.com",
      role: "Software Engineer",
      cgpa: "9.1",
      ats: 91,
      skills: "Java, Spring Boot, MySQL",
      shortlistedOn: "01 Sep 2026",
      interview: "Scheduled",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "Backend Developer",
      cgpa: "8.8",
      ats: 88,
      skills: "Java, Spring Boot, SQL",
      shortlistedOn: "31 Aug 2026",
      interview: "Pending",
    },
    {
      id: 3,
      name: "Sneha Reddy",
      email: "sneha@example.com",
      role: "Frontend Developer",
      cgpa: "8.6",
      ats: 86,
      skills: "React, JavaScript, CSS",
      shortlistedOn: "30 Aug 2026",
      interview: "Scheduled",
    },
    {
      id: 4,
      name: "Prajwal Budhwant",
      email: "prajwal@example.com",
      role: "Software Engineer",
      cgpa: "8.2",
      ats: 82,
      skills: "Java, React, SQL",
      shortlistedOn: "29 Aug 2026",
      interview: "Pending",
    },
  ];

  return (
    <CompanyLayout>

      <div className="company-page">

        {/* HEADER */}

        <div className="company-heading">

          <div>
            <h1>Shortlisted Students</h1>

            <p>
              Manage students shortlisted for your placement opportunities.
            </p>
          </div>

        </div>


        {/* STATS */}

        <div className="company-stats">

          <div className="company-stat-card">

            <div className="company-stat-icon">
              ⭐
            </div>

            <div>
              <span>Total Shortlisted</span>
              <strong>{shortlistedStudents.length}</strong>
              <p>Students selected</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              📅
            </div>

            <div>
              <span>Interviews Scheduled</span>

              <strong>
                {
                  shortlistedStudents.filter(
                    (student) => student.interview === "Scheduled"
                  ).length
                }
              </strong>

              <p>Upcoming interviews</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              ⏳
            </div>

            <div>
              <span>Interview Pending</span>

              <strong>
                {
                  shortlistedStudents.filter(
                    (student) => student.interview === "Pending"
                  ).length
                }
              </strong>

              <p>Need scheduling</p>
            </div>

          </div>


          <div className="company-stat-card">

            <div className="company-stat-icon">
              🎯
            </div>

            <div>
              <span>Average ATS</span>

              <strong>
                {
                  Math.round(
                    shortlistedStudents.reduce(
                      (total, student) => total + student.ats,
                      0
                    ) / shortlistedStudents.length
                  )
                }%
              </strong>

              <p>Resume match score</p>
            </div>

          </div>

        </div>


        {/* STUDENT LIST */}

        <section className="company-section">

          <div className="company-section-header">

            <div>
              <h2>Shortlisted Candidates</h2>

              <p>
                Students selected for the next stage of the recruitment process.
              </p>
            </div>

          </div>


          <div className="shortlisted-list">

            {shortlistedStudents.map((student) => (

              <div
                className="shortlisted-card"
                key={student.id}
              >

                {/* PROFILE */}

                <div className="shortlisted-profile">

                  <div className="shortlisted-avatar">
                    {student.name.charAt(0)}
                  </div>

                  <div>

                    <h3>
                      {student.name}
                    </h3>

                    <p>
                      {student.email}
                    </p>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="shortlisted-details">

                  <div>
                    <span>Applied For</span>
                    <strong>{student.role}</strong>
                  </div>

                  <div>
                    <span>CGPA</span>
                    <strong>{student.cgpa}</strong>
                  </div>

                  <div>
                    <span>ATS Score</span>

                    <strong className="ats-score">
                      {student.ats}%
                    </strong>
                  </div>

                  <div>
                    <span>Shortlisted On</span>
                    <strong>{student.shortlistedOn}</strong>
                  </div>

                </div>


                {/* SKILLS */}

                <div className="shortlisted-skills">

                  <span>Skills</span>

                  <p>
                    {student.skills}
                  </p>

                </div>


                {/* INTERVIEW */}

                <div className="interview-status">

                  <span
                    className={
                      student.interview === "Scheduled"
                        ? "interview-scheduled"
                        : "interview-pending"
                    }
                  >
                    {student.interview}
                  </span>

                </div>


                {/* ACTION */}

                <div className="shortlisted-actions">

                  <button className="view-profile-btn">
                    View Profile
                  </button>

                  <button className="schedule-btn">
                    📅 Schedule Interview
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

    </CompanyLayout>
  );
}

export default Shortlisted;