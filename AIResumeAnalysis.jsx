import DashboardLayout from "../../layouts/DashboardLayout";

function AIResumeAnalysis() {
  return (
    <DashboardLayout>
      <div className="ai-page">

        <div className="ai-heading">
          <div>
            <h1>AI Resume Analysis</h1>
            <p>
              Get AI-powered insights to improve your resume and placement chances.
            </p>
          </div>
        </div>

        {/* SCORE OVERVIEW */}

        <section className="ai-overview-card">

          <div className="ai-score-section">
            <div className="ai-score-circle">
              <strong>82%</strong>
              <span>ATS Score</span>
            </div>

            <div>
              <h2>Good Resume</h2>
              <p>
                Your resume is compatible with most Applicant Tracking Systems.
              </p>
              <span className="score-status">✓ Analysis Complete</span>
            </div>
          </div>

          <div className="score-breakdown">

            <div>
              <span>Skills</span>
              <strong>88%</strong>
            </div>

            <div>
              <span>Experience</span>
              <strong>76%</strong>
            </div>

            <div>
              <span>Formatting</span>
              <strong>90%</strong>
            </div>

            <div>
              <span>Keywords</span>
              <strong>80%</strong>
            </div>

          </div>

        </section>

        {/* SKILLS */}

        <div className="ai-grid">

          <section className="ai-card">
            <h2>Skills Detected</h2>
            <p className="ai-card-subtitle">
              Technical skills identified from your resume.
            </p>

            <div className="ai-skills">
              <span>Java</span>
              <span>Python</span>
              <span>React.js</span>
              <span>JavaScript</span>
              <span>HTML</span>
              <span>CSS</span>
              <span>SQL</span>
              <span>MongoDB</span>
            </div>
          </section>

          {/* JOB MATCH */}

          <section className="ai-card">
            <h2>Best Job Match</h2>
            <p className="ai-card-subtitle">
              Based on your current skills.
            </p>

            <div className="job-match">
              <div>
                <h3>Software Engineer</h3>
                <p>ABC Technologies</p>
              </div>

              <strong>94%</strong>
            </div>

            <div className="job-match">
              <div>
                <h3>Backend Developer</h3>
                <p>Tech Solutions</p>
              </div>

              <strong>89%</strong>
            </div>

            <div className="job-match">
              <div>
                <h3>Java Developer</h3>
                <p>Innovate Labs</p>
              </div>

              <strong>86%</strong>
            </div>
          </section>

        </div>

        {/* STRENGTHS + MISSING SKILLS */}

        <div className="ai-grid">

          <section className="ai-card">
            <h2>Resume Strengths</h2>

            <div className="ai-point">
              <span>✓</span>
              <p>Good technical skill coverage.</p>
            </div>

            <div className="ai-point">
              <span>✓</span>
              <p>Clean and readable resume structure.</p>
            </div>

            <div className="ai-point">
              <span>✓</span>
              <p>Relevant academic projects included.</p>
            </div>

            <div className="ai-point">
              <span>✓</span>
              <p>Strong programming language keywords.</p>
            </div>
          </section>

          <section className="ai-card">
            <h2>Skills to Improve</h2>

            <div className="ai-point warning">
              <span>!</span>
              <p>Spring Boot</p>
            </div>

            <div className="ai-point warning">
              <span>!</span>
              <p>REST API Development</p>
            </div>

            <div className="ai-point warning">
              <span>!</span>
              <p>Git & GitHub</p>
            </div>

            <div className="ai-point warning">
              <span>!</span>
              <p>Data Structures & Algorithms</p>
            </div>
          </section>

        </div>

        {/* AI SUGGESTIONS */}

        <section className="ai-card ai-suggestions">

          <h2>🤖 AI Improvement Suggestions</h2>
          <p className="ai-card-subtitle">
            Recommendations generated from your resume analysis.
          </p>

          <div className="ai-suggestion">
            <div className="suggestion-number">1</div>
            <div>
              <h3>Add measurable achievements</h3>
              <p>
                Mention numbers, results, or performance improvements in your
                project descriptions.
              </p>
            </div>
          </div>

          <div className="ai-suggestion">
            <div className="suggestion-number">2</div>
            <div>
              <h3>Improve keyword matching</h3>
              <p>
                Add job-specific technical keywords to improve your ATS score.
              </p>
            </div>
          </div>

          <div className="ai-suggestion">
            <div className="suggestion-number">3</div>
            <div>
              <h3>Add more project details</h3>
              <p>
                Explain your role, technologies used, and the outcome of each
                project.
              </p>
            </div>
          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}

export default AIResumeAnalysis;