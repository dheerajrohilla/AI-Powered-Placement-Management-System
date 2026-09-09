import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

function StudentResume() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <DashboardLayout>
      <div className="resume-page">

        <div className="resume-heading">
          <div>
            <h1>My Resume</h1>
            <p>Upload and manage your resume for placement opportunities.</p>
          </div>
        </div>

        <div className="resume-upload-card">
          <div className="upload-icon">📄</div>

          <h2>Upload Your Resume</h2>

          <p>
            Upload your latest resume in PDF format.
          </p>

          <label className="upload-btn">
            Choose Resume
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {fileName && (
            <div className="selected-file">
              <span>📎 {fileName}</span>
              <span className="file-status">Selected</span>
            </div>
          )}
        </div>

        <div className="resume-grid">

          <section className="resume-card">
            <h2>Resume Status</h2>

            <div className="resume-status">
              <div>
                <span>Status</span>
                <strong>
                  {fileName ? "Ready for Analysis" : "No Resume Uploaded"}
                </strong>
              </div>

              <div>
                <span>Format</span>
                <strong>PDF</strong>
              </div>
            </div>
          </section>

          <section className="resume-card">
            <h2>AI Resume Analysis</h2>

            <div className="ats-score">
              <div className="score-circle">
                82%
              </div>

              <div>
                <h3>Good Resume</h3>
                <p>
                  Your resume has a good ATS compatibility score.
                </p>
              </div>
            </div>
          </section>

        </div>

        <section className="resume-card suggestions-card">
          <h2>AI Suggestions</h2>

          <div className="suggestion">
            <span>✓</span>
            <p>Add more measurable achievements to your projects.</p>
          </div>

          <div className="suggestion">
            <span>✓</span>
            <p>Include relevant technical skills for your target roles.</p>
          </div>

          <div className="suggestion">
            <span>✓</span>
            <p>Keep your resume concise and easy to read.</p>
          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}

export default StudentResume;