import { useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";

function Students() {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const students = [
    {
      id: 1,
      name: "Prajwal Budhwant",
      email: "prajwal@example.com",
      course: "CSE",
      year: "4th Year",
      cgpa: 8.2,
      status: "Placed",
      company: "ABC Technologies",
      package: "₹8 LPA"
    },
    {
      id: 2,
      name: "Aditya Sharma",
      email: "aditya@example.com",
      course: "CSE",
      year: "4th Year",
      cgpa: 9.1,
      status: "Placed",
      company: "Tech Solutions",
      package: "₹12 LPA"
    },
    {
      id: 3,
      name: "Rahul Kumar",
      email: "rahul@example.com",
      course: "CSE",
      year: "4th Year",
      cgpa: 8.8,
      status: "Placed",
      company: "Infosys",
      package: "₹7 LPA"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      email: "sneha@example.com",
      course: "ECE",
      year: "4th Year",
      cgpa: 8.6,
      status: "Placed",
      company: "Wipro",
      package: "₹6.5 LPA"
    },
    {
      id: 5,
      name: "Arjun Patel",
      email: "arjun@example.com",
      course: "CSE",
      year: "4th Year",
      cgpa: 7.9,
      status: "Unplaced",
      company: "-",
      package: "-"
    },
    {
      id: 6,
      name: "Neha Singh",
      email: "neha@example.com",
      course: "IT",
      year: "4th Year",
      cgpa: 8.4,
      status: "Unplaced",
      company: "-",
      package: "-"
    }
  ];

  const filteredStudents = students.filter((student) => {

    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.course.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStudents = students.length;

  const placedStudents = students.filter(
    (student) => student.status === "Placed"
  ).length;

  const unplacedStudents = students.filter(
    (student) => student.status === "Unplaced"
  ).length;

  const averageCGPA =
    students.reduce((sum, student) => sum + student.cgpa, 0) /
    students.length;

  return (
    <TPOLayout>

      <div className="company-heading">

        <div>
          <h1>Students</h1>
          <p>Manage and monitor student placement information.</p>
        </div>

      </div>

      {/* Statistics */}

      <div className="company-stats">

        <div className="company-stat-card">
          <h3>Total Students</h3>
          <strong>{totalStudents}</strong>
          <p>Registered students</p>
        </div>

        <div className="company-stat-card">
          <h3>Placed Students</h3>
          <strong>{placedStudents}</strong>
          <p>Successfully placed</p>
        </div>

        <div className="company-stat-card">
          <h3>Unplaced Students</h3>
          <strong>{unplacedStudents}</strong>
          <p>Looking for opportunities</p>
        </div>

        <div className="company-stat-card">
          <h3>Average CGPA</h3>
          <strong>{averageCGPA.toFixed(2)}</strong>
          <p>Overall average</p>
        </div>

      </div>

      {/* Student List */}

      <div className="company-section">

        <div className="student-toolbar">

          <div>
            <h2>Student List</h2>
            <p>View and manage registered students.</p>
          </div>

          <div className="student-filters">

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Students</option>
              <option value="Placed">Placed</option>
              <option value="Unplaced">Unplaced</option>
            </select>

          </div>

        </div>

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Year</th>
                <th>CGPA</th>
                <th>Status</th>
                <th>Company</th>
                <th>Package</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr key={student.id}>

                  <td>
                    <div className="student-name">
                      <strong>{student.name}</strong>
                      <span>{student.email}</span>
                    </div>
                  </td>

                  <td>{student.course}</td>

                  <td>{student.year}</td>

                  <td>
                    <strong>{student.cgpa}</strong>
                  </td>

                  <td>
                    <span
                      className={
                        student.status === "Placed"
                          ? "status-badge placed"
                          : "status-badge unplaced"
                      }
                    >
                      {student.status}
                    </span>
                  </td>

                  <td>{student.company}</td>

                  <td>{student.package}</td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        alert(
                          `Student: ${student.name}\nEmail: ${student.email}\nCGPA: ${student.cgpa}`
                        )
                      }
                    >
                      View Profile
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredStudents.length === 0 && (
            <div className="no-students">
              No students found.
            </div>
          )}

        </div>

      </div>

    </TPOLayout>
  );
}

export default Students;