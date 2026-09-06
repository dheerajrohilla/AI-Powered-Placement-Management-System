import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

function StudentProfile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Prajwal Budhwant",
    email: "prajwal@example.com",
    phone: "+91 XXXXX XXXXX",
    location: "India",
    branch: "Computer Science & Engineering",
    year: "4th Year",
    cgpa: "8.0",
    graduation: "2027",
    github: "github.com/username",
    leetcode: "leetcode.com/username",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout>
      <div className="profile-page">

        <div className="profile-heading">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal and academic information.</p>
          </div>

          {!editing ? (
            <button
              className="edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <button
              className="save-btn"
              onClick={() => setEditing(false)}
            >
              Save Changes
            </button>
          )}
        </div>

        <div className="profile-grid">

          <section className="profile-card">
            <h2>Personal Information</h2>

            <div className="profile-info-grid">

              <div>
                <label>Full Name</label>
                {editing ? (
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.name}</p>
                )}
              </div>

              <div>
                <label>Email</label>
                {editing ? (
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.email}</p>
                )}
              </div>

              <div>
                <label>Phone</label>
                {editing ? (
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.phone}</p>
                )}
              </div>

              <div>
                <label>Location</label>
                {editing ? (
                  <input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.location}</p>
                )}
              </div>

            </div>
          </section>

          <section className="profile-card">
            <h2>Academic Information</h2>

            <div className="profile-info-grid">

              <div>
                <label>Branch</label>
                {editing ? (
                  <input
                    name="branch"
                    value={profile.branch}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.branch}</p>
                )}
              </div>

              <div>
                <label>Year</label>
                {editing ? (
                  <input
                    name="year"
                    value={profile.year}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.year}</p>
                )}
              </div>

              <div>
                <label>CGPA</label>
                {editing ? (
                  <input
                    name="cgpa"
                    value={profile.cgpa}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.cgpa}</p>
                )}
              </div>

              <div>
                <label>Graduation Year</label>
                {editing ? (
                  <input
                    name="graduation"
                    value={profile.graduation}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.graduation}</p>
                )}
              </div>

            </div>
          </section>

          <section className="profile-card">
            <h2>Technical Skills</h2>

            <div className="skills-list">
              <span>Java</span>
              <span>Python</span>
              <span>React.js</span>
              <span>HTML</span>
              <span>CSS</span>
              <span>JavaScript</span>
              <span>SQL</span>
              <span>MongoDB</span>
            </div>
          </section>

          <section className="profile-card">
            <h2>Coding Profiles</h2>

            <div className="profile-links">

              <div>
                <label>LeetCode</label>
                {editing ? (
                  <input
                    name="leetcode"
                    value={profile.leetcode}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.leetcode}</p>
                )}
              </div>

              <div>
                <label>GitHub</label>
                {editing ? (
                  <input
                    name="github"
                    value={profile.github}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.github}</p>
                )}
              </div>

            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentProfile;