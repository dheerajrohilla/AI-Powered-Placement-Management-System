import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";

function MockInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const driveParam = searchParams.get("driveId");

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveParam || "");
  const [customRole, setCustomRole] = useState("Software Engineer");
  const [activeInterview, setActiveInterview] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("interview"); // "interview" | "history"

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load drives and past mock interviews
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [drivesRes, historyRes] = await Promise.all([
          studentAPI.getPlacementDrives(),
          studentAPI.getMockInterviews()
        ]);
        setDrives(drivesRes.data || []);
        setHistory(historyRes.data || []);

        if (driveParam) {
          setSelectedDriveId(driveParam);
        } else if (drivesRes.data?.length > 0) {
          setSelectedDriveId(drivesRes.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load interview context:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [driveParam]);

  // Start new mock interview
  const handleStartInterview = async () => {
    try {
      setGenerating(true);
      const res = await studentAPI.generateMockInterview({
        driveId: selectedDriveId || null,
        customRole
      });
      setActiveInterview(res.data);
      setActiveQuestionIdx(0);
      setAnswerText("");
      setActiveTab("interview");
    } catch (err) {
      console.error("Failed to generate mock interview:", err);
      alert("Failed to start mock interview session. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Submit answer for active question
  const handleSubmitAnswer = async () => {
    if (!activeInterview || !answerText.trim()) return;

    const currentQ = activeInterview.questions[activeQuestionIdx];
    try {
      setEvaluating(true);
      const res = await studentAPI.submitMockAnswer(activeInterview._id, {
        questionId: currentQ.questionId,
        studentAnswer: answerText
      });

      // Update question in activeInterview state
      const updatedQuestions = [...activeInterview.questions];
      updatedQuestions[activeQuestionIdx] = {
        ...updatedQuestions[activeQuestionIdx],
        studentAnswer: answerText,
        score: res.data.evaluation.score,
        feedback: res.data.evaluation.feedback,
        strengths: res.data.evaluation.strengths,
        missingPoints: res.data.evaluation.missingPoints,
        isAnswered: true
      };

      setActiveInterview({
        ...activeInterview,
        questions: updatedQuestions
      });
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
      alert("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Finalize interview
  const handleCompleteInterview = async () => {
    if (!activeInterview) return;
    try {
      setEvaluating(true);
      const res = await studentAPI.completeMockInterview(activeInterview._id);
      setActiveInterview(res.data);
      // Refresh history
      const hist = await studentAPI.getMockInterviews();
      setHistory(hist.data || []);
    } catch (err) {
      console.error("Failed to complete interview:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = activeInterview?.questions?.[activeQuestionIdx];
  const allAnswered = activeInterview?.questions?.every(q => q.isAnswered);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#111827', fontWeight: 700 }}>AI Mock Interview & Placement Score</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '4px' }}>
            Simulate company-specific technical rounds generated directly from recruitment JDs with instant scoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab("interview")}
            className={activeTab === "interview" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px" }}
          >
            🎙️ Practice Session
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px" }}
          >
            📋 Past Results ({history.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Loading interview simulator...</p>
        </div>
      ) : activeTab === "history" ? (
        /* History View */
        <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Past AI Mock Interview Sessions</h3>
          {history.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No mock interviews recorded yet. Start your first session below!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {history.map((item) => (
                <div key={item._id} style={{
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  background: "#f9fafb"
                }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                      {item.companyName} — {item.targetRole}
                    </h4>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
                      Topics: {(item.jdRequirements || []).slice(0, 4).join(", ") || "General Technical"}
                    </p>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: item.placementReadinessScore >= 75 ? "#10b981" : "#f59e0b" }}>
                        {item.placementReadinessScore || item.overallScore}%
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>Readiness Score</div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveInterview(item);
                        setActiveTab("interview");
                        setActiveQuestionIdx(0);
                      }}
                      className="btn-secondary"
                      style={{ padding: "8px 14px", fontSize: "13px" }}
                    >
                      Review Transcript
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !activeInterview ? (
        /* Launch Session Card */
        <div className="card" style={{ padding: "35px", background: "#fff", borderRadius: "16px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            Configure Target Company Interview
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "25px" }}>
            The AI analyzes the company's job description, technical requirements, and past interview questions to generate a tailored technical round.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                Select Target Placement Drive / Company:
              </label>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
              >
                <option value="">-- General Technical Simulation --</option>
                {drives.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.company?.companyName || d.title} — {d.jobRole || d.title} (₹{(d.salary / 100000).toFixed(1)} LPA)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                Target Role Designation:
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Backend Developer / Java Engineer / Full Stack"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
              />
            </div>

            <button
              onClick={handleStartInterview}
              disabled={generating}
              className="btn-primary"
              style={{ padding: "14px", fontSize: "16px", fontWeight: 700, marginTop: "10px" }}
            >
              {generating ? "🤖 Generating JD-Specific Questions..." : "🚀 Launch Tailored Mock Interview"}
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview Simulator */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Header Banner */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "white",
            padding: "20px 24px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", background: "#3b82f6", padding: "3px 10px", borderRadius: "12px", fontWeight: 600 }}>
                {activeInterview.companyName}
              </span>
              <h2 style={{ fontSize: "20px", marginTop: "6px" }}>{activeInterview.targetRole} — Technical Simulation</h2>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>
                Required JD Skills: {(activeInterview.jdRequirements || []).join(", ")}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {activeInterview.status === "completed" ? (
                <div style={{ textAlign: "right", background: "rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399" }}>
                    {activeInterview.placementReadinessScore}%
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.9 }}>Placement Score</div>
                </div>
              ) : (
                <button
                  onClick={handleCompleteInterview}
                  disabled={evaluating}
                  className="btn-secondary"
                  style={{ background: "#22c55e", color: "white", border: "none", padding: "10px 18px" }}
                >
                  ✓ Finish & Compute Score
                </button>
              )}
            </div>
          </div>

          {/* Question Stepper */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
            {activeInterview.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveQuestionIdx(idx);
                  setAnswerText(q.studentAnswer || "");
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: idx === activeQuestionIdx ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: q.isAnswered ? "#dcfce7" : idx === activeQuestionIdx ? "#eff6ff" : "white",
                  color: idx === activeQuestionIdx ? "#1d4ed8" : "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap"
                }}
              >
                <span>{q.questionId}</span>
                {q.isAnswered && <span style={{ color: "#16a34a" }}>({q.score}%)</span>}
              </button>
            ))}
          </div>

          {/* Current Question & Answer Workspace */}
          {currentQ && (
            <div className="card" style={{ padding: "26px", background: "#fff", borderRadius: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="badge badge-info" style={{ textTransform: "capitalize" }}>{currentQ.category}</span>
                  <span className="badge badge-warning" style={{ textTransform: "capitalize" }}>{currentQ.difficulty}</span>
                  <span className="badge badge-success">{currentQ.topic}</span>
                </div>
                {currentQ.isAnswered && (
                  <span style={{ fontSize: "16px", fontWeight: 700, color: currentQ.score >= 75 ? "#16a34a" : "#ca8a04" }}>
                    Score: {currentQ.score} / 100
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "18px", color: "#111827", lineHeight: "1.5", marginBottom: "16px" }}>
                {currentQ.question}
              </h3>

              {/* Student Answer Box */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Your Verbal/Written Response:
                </label>
                <textarea
                  rows="6"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your explanation here. Detail the underlying architecture, data structures, trade-offs, and edge cases as you would in a live panel..."
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    outline: "none"
                  }}
                  disabled={activeInterview.status === "completed"}
                />
              </div>

              {activeInterview.status !== "completed" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {answerText.split(/\s+/).filter(Boolean).length} words typed
                  </span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !answerText.trim()}
                    className="btn-primary"
                    style={{ padding: "10px 22px" }}
                  >
                    {evaluating ? "Evaluating Response..." : currentQ.isAnswered ? "🔄 Re-evaluate Answer" : "⚡ Submit for AI Grading"}
                  </button>
                </div>
              )}

              {/* Instant Evaluation Feedback */}
              {currentQ.isAnswered && (
                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{
                    padding: "18px",
                    borderRadius: "10px",
                    background: currentQ.score >= 75 ? "#f0fdf4" : "#fefce8",
                    border: currentQ.score >= 75 ? "1px solid #bbf7d0" : "1px solid #fef08a",
                    marginBottom: "16px"
                  }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: currentQ.score >= 75 ? "#166534" : "#854d0e", marginBottom: "6px" }}>
                      AI Evaluator Feedback ({currentQ.score}/100)
                    </h4>
                    <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                      {currentQ.feedback}
                    </p>

                    {currentQ.strengths?.length > 0 && (
                      <div style={{ marginTop: "10px", fontSize: "13px", color: "#166534" }}>
                        <strong>Strengths:</strong> {currentQ.strengths.join(" ")}
                      </div>
                    )}

                    {currentQ.missingPoints?.length > 0 && (
                      <div style={{ marginTop: "6px", fontSize: "13px", color: "#9a3412" }}>
                        <strong>Missed Concepts:</strong> {currentQ.missingPoints.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Ideal Model Answer */}
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                      💡 Recommended Model Answer
                    </span>
                    <p style={{ fontSize: "14px", color: "#334155", marginTop: "6px", lineHeight: "1.5" }}>
                      {currentQ.modelAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Results Dashboard when Completed */}
          {activeInterview.status === "completed" && (
            <div className="card" style={{ padding: "28px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
                🏆 Placement Readiness Evaluation Summary
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div style={{ padding: "16px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: "13px", color: "#166534", fontWeight: 600 }}>OVERALL SCORE</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d" }}>{activeInterview.overallScore}%</div>
                </div>

                <div style={{ padding: "16px", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                  <div style={{ fontSize: "13px", color: "#1e40af", fontWeight: 600 }}>PLACEMENT READINESS</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb" }}>{activeInterview.placementReadinessScore}%</div>
                </div>

                <div style={{ padding: "16px", background: "#fdf4ff", borderRadius: "10px", border: "1px solid #f5d0fe" }}>
                  <div style={{ fontSize: "13px", color: "#86198f", fontWeight: 600 }}>READINESS STATUS</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#a21caf", marginTop: "6px" }}>
                    {activeInterview.readinessStatus}
                  </div>
                </div>
              </div>

              {/* Topic Breakdown */}
              {activeInterview.topicBreakdown?.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Topic Performance Breakdown:</h4>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {activeInterview.topicBreakdown.map((tb, idx) => (
                      <div key={idx} style={{ padding: "10px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>{tb.topic}: </span>
                        <span style={{ fontWeight: 700, color: tb.score >= 75 ? "#16a34a" : "#ca8a04" }}>{tb.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Next Steps */}
              {activeInterview.improvementRoadmap?.length > 0 && (
                <div style={{ padding: "16px", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>
                    🎯 Targeted Preparation Roadmap Before Live Round:
                  </h4>
                  <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "14px", color: "#78350f" }}>
                    {activeInterview.improvementRoadmap.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}

export default MockInterview;
