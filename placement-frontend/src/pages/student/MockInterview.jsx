import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { aiPrepAPI, studentAPI } from "../../services/api";
import { useSearchParams } from "react-router-dom";

const CATEGORY_INFO = {
  aptitude: {
    title: "Aptitude Preparation",
    icon: "🧮",
    description: "Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation, and Numerical Problem Solving.",
    topics: [
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Verbal Ability",
      "Data Interpretation",
      "Percentages & Ratios",
      "Probability & Combinatorics",
      "Time, Speed & Work"
    ],
    defaultMix: "objective"
  },
  technical: {
    title: "Technical Preparation",
    icon: "💻",
    description: "Data Structures & Algorithms, Java, Python, C++, JS, DBMS & SQL, OS, Computer Networks, and System Design.",
    topics: [
      "Data Structures & Algorithms",
      "Java Programming",
      "Python Programming",
      "C++ & OOP",
      "JavaScript & Web",
      "DBMS & SQL",
      "Operating Systems",
      "Computer Networks",
      "System Design"
    ],
    defaultMix: "mixed"
  },
  hr: {
    title: "HR Interview Preparation",
    icon: "👔",
    description: "STAR framework behavioral answers, self-introduction, conflict resolution, leadership, strengths, and company fit.",
    topics: [
      "Introduction & Elevator Pitch",
      "Behavioral & STAR Method",
      "Conflict Resolution & Teamwork",
      "Strengths, Weaknesses & Growth",
      "Why This Company & Career Vision"
    ],
    defaultMix: "subjective"
  },
  company_specific: {
    title: "Company-Specific Preparation",
    icon: "🏢",
    description: "Verified recruitment patterns for TCS, Infosys, Accenture, Capgemini, Wipro, Cognizant, and Top Product Firms.",
    topics: [
      "TCS NQT Preparation",
      "Infosys SP / DSE",
      "Accenture Assessment",
      "Capgemini Technical & Game Aptitude",
      "Wipro Elite NTH",
      "Cognizant GenC Next",
      "Product-Based SDE Rounds"
    ],
    defaultMix: "mixed"
  }
};

const PRESETS = [
  {
    id: "tcs_nqt",
    title: "TCS NQT Full Simulation",
    category: "company_specific",
    company: "TCS",
    role: "Ninja / Digital Developer",
    difficulty: "medium",
    questionCount: 15,
    mix: "mixed",
    duration: 30,
    badge: "Most Popular",
    color: "#2563eb"
  },
  {
    id: "technical_dsa_sql",
    title: "DSA, Core CS & SQL Round",
    category: "technical",
    company: "",
    role: "Software Development Engineer",
    difficulty: "medium",
    questionCount: 12,
    mix: "mixed",
    duration: 30,
    badge: "Core Technical",
    color: "#7c3aed"
  },
  {
    id: "quant_aptitude_speed",
    title: "Aptitude Speed Test (15 Min)",
    category: "aptitude",
    company: "",
    role: "Campus Placement General",
    difficulty: "easy",
    questionCount: 10,
    mix: "objective",
    duration: 15,
    badge: "Quick Practice",
    color: "#059669"
  },
  {
    id: "hr_behavioral_star",
    title: "HR Behavioral & STAR Interview",
    category: "hr",
    company: "",
    role: "Graduate Trainee / Associate",
    difficulty: "medium",
    questionCount: 6,
    mix: "subjective",
    duration: 20,
    badge: "Behavioral",
    color: "#d97706"
  }
];

export default function MockInterview() {
  const [searchParams] = useSearchParams();
  const _driveParam = searchParams.get("driveId");
  const companyQueryParam = searchParams.get("company");
  const categoryQueryParam = searchParams.get("category");

  // Tab: "setup" | "assessment" | "report" | "history"
  const [activeTab, setActiveTab] = useState("setup");

  // Setup Form State
  const [category, setCategory] = useState(categoryQueryParam || "technical");
  const [selectedTopics, setSelectedTopics] = useState(CATEGORY_INFO[categoryQueryParam || "technical"].topics);
  const [targetCompany, setTargetCompany] = useState(companyQueryParam || "");
  const [targetRole, setTargetRole] = useState("Software Development Engineer");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [questionMix, setQuestionMix] = useState("mixed");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [revealMode, setRevealMode] = useState("end");

  // Metadata Lists
  const [_patterns, setPatterns] = useState([]);
  const [drives, setDrives] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Active Assessment State
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [codeRunResult, setCodeRunResult] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [immediateEvaluation, setImmediateEvaluation] = useState(null);
  const [evaluatingImmediate, setEvaluatingImmediate] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Final Report State
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Timer Ref
  const timerRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);

  // Load Initial Context (Patterns, Drives, History)
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [patternsRes, drivesRes, historyRes] = await Promise.allSettled([
          aiPrepAPI.getPatterns(),
          studentAPI.getPlacementDrives(),
          aiPrepAPI.getHistory()
        ]);

        if (patternsRes.status === "fulfilled") {
          setPatterns(patternsRes.value.data?.patterns || []);
        }
        if (drivesRes.status === "fulfilled") {
          setDrives(drivesRes.value.data || []);
        }
        if (historyRes.status === "fulfilled") {
          setHistoryList(historyRes.value.data?.history || []);
        }
      } catch (err) {
        console.error("Failed to load initial context:", err);
      }
    };
    fetchContext();
  }, []);

  // Update selected topics when category changes
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setSelectedTopics(CATEGORY_INFO[newCat]?.topics || []);
    setQuestionMix(CATEGORY_INFO[newCat]?.defaultMix || "mixed");
  };

  // Toggle individual topic
  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  // Select all or clear topics
  const handleToggleAllTopics = () => {
    const allTopics = CATEGORY_INFO[category]?.topics || [];
    if (selectedTopics.length === allTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics([...allTopics]);
    }
  };

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setCategory(preset.category);
    setSelectedTopics(CATEGORY_INFO[preset.category].topics);
    setTargetCompany(preset.company);
    setTargetRole(preset.role);
    setDifficulty(preset.difficulty);
    setQuestionCount(preset.questionCount);
    setQuestionMix(preset.mix);
    setDurationMinutes(preset.duration);
  };

  // Format Seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Start Assessment Session
  const handleStartAssessment = async () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic for your assessment.");
      return;
    }

    try {
      setIsStarting(true);
      const res = await aiPrepAPI.createSession({
        category,
        topics: selectedTopics,
        targetCompany: targetCompany.trim(),
        targetRole: targetRole.trim(),
        difficulty,
        questionCount: Number(questionCount),
        questionMix,
        durationMinutes: Number(durationMinutes),
        revealMode
      });

      const newSession = res.data?.session;
      if (!newSession || !newSession.questions || newSession.questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }

      setSession(newSession);
      setCurrentIdx(0);
      setCodeRunResult(null);
      setImmediateEvaluation(null);

      // Initialize answers map
      const initialMap = {};
      newSession.questions.forEach(q => {
        initialMap[q.questionId] = q.studentAnswer || "";
      });
      setAnswersMap(initialMap);

      // Set timer in seconds
      setTimeRemaining(newSession.durationMinutes * 60);
      sessionStartTimeRef.current = Date.now();
      setActiveTab("assessment");
    } catch (err) {
      console.error("Failed to start assessment:", err);
      alert(err.response?.data?.error || err.message || "Failed to initialize assessment.");
    } finally {
      setIsStarting(false);
    }
  };

  // Auto-Submit Handler when timer reaches 0 or user clicks submit
  const handleFinalSubmit = useCallback(async (_isAutoSubmit = false) => {
    if (isSubmitting || !session) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const elapsedSec = Math.floor((Date.now() - (sessionStartTimeRef.current || Date.now())) / 1000);
      const submitRes = await aiPrepAPI.submitSession(session._id, elapsedSec);

      // Fetch comprehensive report
      const repRes = await aiPrepAPI.getSessionReport(session._id);
      setReport(repRes.data?.report || submitRes.data?.session?.finalReport);

      // Refresh history list
      const hist = await aiPrepAPI.getHistory();
      setHistoryList(hist.data?.history || []);

      setActiveTab("report");
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      alert("Error finalizing assessment evaluation. Trying to fetch results...");
      try {
        const repRes = await aiPrepAPI.getSessionReport(session._id);
        setReport(repRes.data?.report);
        setActiveTab("report");
      } catch {
        alert("Could not load report. Please review your results in the History tab.");
        setActiveTab("history");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [session, isSubmitting]);

  // Countdown Timer Effect
  useEffect(() => {
    if (activeTab === "assessment" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinalSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTab, timeRemaining, handleFinalSubmit]);

  // Handle Answer Modification with Debounced Autosave
  const handleAnswerChange = (questionId, value) => {
    setAnswersMap(prev => ({ ...prev, [questionId]: value }));
    setSaveStatus("Saving...");

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(async () => {
      if (!session) return;
      try {
        await aiPrepAPI.saveAnswer(session._id, {
          questionId,
          answer: value
        });
        setSaveStatus(`✓ Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("⚠️ Autosave failed (will retry)");
      }
    }, 800);
  };

  // Immediate Single Question Submit (when revealMode === 'immediate')
  const handleImmediateSubmit = async (questionId) => {
    if (!session) return;
    const answer = answersMap[questionId] || "";
    try {
      setEvaluatingImmediate(true);
      const res = await aiPrepAPI.submitAnswer(session._id, {
        questionId,
        answer,
        timeSpentSeconds: 30
      });
      setImmediateEvaluation(res.data?.evaluation);

      // Update question in session state
      setSession(prev => {
        if (!prev) return prev;
        const updatedQs = prev.questions.map(q => {
          if (q.questionId === questionId) {
            return {
              ...q,
              isAnswered: true,
              studentAnswer: answer,
              scoreAwarded: res.data?.evaluation?.scoreAwarded,
              evaluationResult: res.data?.evaluation
            };
          }
          return q;
        });
        return { ...prev, questions: updatedQs };
      });
    } catch (err) {
      console.error("Immediate evaluation error:", err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluatingImmediate(false);
    }
  };

  // Run Sample Code in Sandbox
  const handleRunSampleCode = async (questionId, code) => {
    if (!session || !code || !code.trim()) {
      alert("Please write some code before running tests.");
      return;
    }

    try {
      setIsRunningCode(true);
      setCodeRunResult(null);
      const res = await aiPrepAPI.runCode(session._id, {
        questionId,
        code
      });
      setCodeRunResult(res.data);
    } catch (err) {
      console.error("Code run error:", err);
      alert(err.response?.data?.error || "Code execution failed.");
    } finally {
      setIsRunningCode(false);
    }
  };

  // Open Past Report from History
  const handleViewReportFromHistory = async (sessionId) => {
    try {
      setLoadingReport(true);
      const res = await aiPrepAPI.getSessionReport(sessionId);
      setReport(res.data?.report);
      setActiveTab("report");
    } catch (err) {
      console.error("Failed to load historical report:", err);
      alert("Failed to retrieve report for this session.");
    } finally {
      setLoadingReport(false);
    }
  };

  const currentQ = session?.questions?.[currentIdx];
  const qType = (currentQ?.type || currentQ?.questionType || (currentQ?.options && currentQ.options.length > 0 ? "mcq" : "short_answer")).toLowerCase();
  const totalQuestions = session?.questions?.length || 0;
  const answeredCount = session?.questions?.filter(q => answersMap[q.questionId]?.toString().trim() !== "").length || 0;

  return (
    <DashboardLayout>
      {/* Top Header & Navigation */}
      <div className="ai-header" style={{ marginBottom: "20px" }}>
        <div className="ai-header-title">
          <h1 style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "26px", fontWeight: 800 }}>
            <span style={{ fontSize: "32px" }}>🎯</span>
            AI Placement Preparation & Assessment Platform
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Comprehensive AI simulation for Aptitude, Technical DSA, SQL, Code Execution, HR Behavioral, and Company Recruitment Rounds.
          </p>
        </div>

        {/* Global Tab Controls */}
        <div className="ai-header-actions">
          <button
            onClick={() => setActiveTab("setup")}
            className={activeTab === "setup" ? "ai-btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px", borderRadius: "8px" }}
          >
            ⚙️ Assessment Setup
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "ai-btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px", borderRadius: "8px" }}
          >
            📊 History & Progress ({historyList.length})
          </button>
          {report && (
            <button
              onClick={() => setActiveTab("report")}
              className={activeTab === "report" ? "ai-btn-primary" : "btn-secondary"}
              style={{ padding: "8px 16px", borderRadius: "8px" }}
            >
              📋 Latest Report
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SETUP & CONFIGURATION VIEW                             */}
      {/* ========================================================= */}
      {activeTab === "setup" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Quick Presets Banner */}
          <div className="card" style={{ padding: "20px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                ⚡ Quick Launch Assessment Presets
              </h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Select a pre-configured template or customize below
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
              {PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="prep-preset-card"
                  style={{ borderLeft: `4px solid ${preset.color}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: preset.color, background: `${preset.color}15`, padding: "2px 8px", borderRadius: "10px" }}>
                      {preset.badge}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>⏱️ {preset.duration}m</span>
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>
                    {preset.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                    {preset.questionCount} Questions • {preset.mix} mode • {preset.difficulty}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Assessment Configuration Form */}
          <div className="card" style={{ padding: "28px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🛠️</span> Customize Placement Assessment
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              
              {/* Category Selector Grid */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "10px" }}>
                  1. Preparation Mode Category:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
                  {Object.entries(CATEGORY_INFO).map(([catKey, catData]) => (
                    <div
                      key={catKey}
                      onClick={() => handleCategoryChange(catKey)}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: category === catKey ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        background: category === catKey ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "6px" }}>{catData.icon}</div>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                        {catData.title}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                        {catData.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics Selection */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                    2. Select Topics ({selectedTopics.length} selected):
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleAllTopics}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    {selectedTopics.length === (CATEGORY_INFO[category]?.topics.length || 0) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(CATEGORY_INFO[category]?.topics || []).map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: isSelected ? "1.5px solid #2563eb" : "1px solid #d1d5db",
                          background: isSelected ? "#2563eb" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#374151",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {isSelected ? "✓ " : "+ "} {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company & Role Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Target Company (Optional / Recruitment Pattern):
                  </label>
                  <select
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  >
                    <option value="">-- General Placement Preparation --</option>
                    <option value="TCS">TCS (Tata Consultancy Services) — NQT Pattern</option>
                    <option value="Infosys">Infosys — SP / DSE Pattern</option>
                    <option value="Accenture">Accenture — Assessment Pattern</option>
                    <option value="Capgemini">Capgemini — Technical & Pseudocode</option>
                    <option value="Wipro">Wipro — Elite National Talent Hunt</option>
                    <option value="Cognizant">Cognizant — GenC & GenC Next</option>
                    <option value="Product Companies">Top Product Companies (SDE-1 Rounds)</option>
                    {drives.map(d => (
                      <option key={d._id} value={d.company?.companyName || d.title}>
                        Drive: {d.company?.companyName || d.title} ({d.jobRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Target Role Designation:
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. SDE-1, Java Developer, Graduate Trainee"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Assessment Parameters: Difficulty, Questions, Mix, Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                
                {/* Difficulty */}
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Difficulty Level:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  >
                    <option value="easy">🟢 Easy (Foundational)</option>
                    <option value="medium">🟡 Medium (Standard Placement)</option>
                    <option value="hard">🔴 Hard (Advanced Rounds)</option>
                    <option value="adaptive">🧠 Adaptive (Dynamic Adjustment)</option>
                  </select>
                </div>

                {/* Question Count */}
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Number of Questions:
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  >
                    <option value={5}>5 Questions (Quick Check)</option>
                    <option value={10}>10 Questions (Standard)</option>
                    <option value={15}>15 Questions (Full Test)</option>
                    <option value={20}>20 Questions (Comprehensive)</option>
                  </select>
                </div>

                {/* Question Mix */}
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Question Type Mix:
                  </label>
                  <select
                    value={questionMix}
                    onChange={(e) => setQuestionMix(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  >
                    <option value="mixed">🔀 Mixed (Objective + Subjective + Code)</option>
                    <option value="objective">🔘 Objective Only (MCQs & Numerical)</option>
                    <option value="subjective">📝 Subjective Only (Concepts & HR)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Assessment Timer:
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Reveal Policy */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                  Explanation & Score Reveal Policy:
                </label>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="revealMode"
                      value="end"
                      checked={revealMode === "end"}
                      onChange={() => setRevealMode("end")}
                    />
                    <strong>Reveal at the end</strong> (Realistic exam simulation with comprehensive report)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="revealMode"
                      value="immediate"
                      checked={revealMode === "immediate"}
                      onChange={() => setRevealMode("immediate")}
                    />
                    <strong>Reveal after each answer</strong> (Practice & learning mode)
                  </label>
                </div>
              </div>

              {/* Launch Button */}
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  disabled={isStarting}
                  className="ai-btn-primary"
                  style={{
                    width: "100%",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: 800,
                    justifyContent: "center",
                    borderRadius: "10px"
                  }}
                >
                  {isStarting ? (
                    <>
                      <div className="spinner" style={{ width: "20px", height: "20px" }}></div>
                      Synthesizing Assessment Questions & Verified Patterns...
                    </>
                  ) : (
                    <>🚀 Start AI Placement Assessment ({questionCount} Questions • {durationMinutes} Mins)</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE ASSESSMENT IN-PROGRESS VIEW                     */}
      {/* ========================================================= */}
      {activeTab === "assessment" && session && currentQ && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Assessment Control Bar */}
          <div className="card" style={{
            padding: "16px 22px",
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span className="ai-prep-badge ai-prep-badge-primary">
                {CATEGORY_INFO[session.category]?.icon} {session.category?.toUpperCase()}
              </span>
              {session.isAdaptive ? (
                <span className="ai-prep-badge ai-prep-badge-purple">
                  🧠 Adaptive Difficulty: {session.currentDifficulty?.toUpperCase()}
                </span>
              ) : (
                <span className="ai-prep-badge ai-prep-badge-warning">
                  Difficulty: {session.difficulty?.toUpperCase()}
                </span>
              )}
              {session.targetCompany && (
                <span className="ai-prep-badge ai-prep-badge-success">
                  🏢 {session.targetCompany}
                </span>
              )}
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Question {currentIdx + 1} of {totalQuestions} ({answeredCount} answered)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Autosave Status */}
              <span style={{ fontSize: "12px", color: saveStatus.includes("failed") ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                {saveStatus}
              </span>

              {/* Countdown Timer */}
              <div style={{
                background: timeRemaining < 300 ? "#fee2e2" : "#f1f5f9",
                color: timeRemaining < 300 ? "#b91c1c" : "#0f172a",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span>⏱️</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>

              {/* Submit Assessment Button */}
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="ai-btn-primary"
                style={{ padding: "8px 16px", background: "#dc2626", borderRadius: "8px" }}
              >
                Finish & Submit
              </button>
            </div>
          </div>

          {/* Question Palette Navigation */}
          <div className="card" style={{ padding: "14px 20px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginRight: "6px" }}>
                Jump to Question:
              </span>
              {session.questions.map((q, idx) => {
                const isAnswered = answersMap[q.questionId]?.toString().trim() !== "";
                const isActive = idx === currentIdx;
                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => {
                      setCurrentIdx(idx);
                      setCodeRunResult(null);
                      setImmediateEvaluation(null);
                    }}
                    className={`prep-q-bubble ${isActive ? "active" : ""} ${isAnswered ? "answered" : ""}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Question Card */}
          <div className="card" style={{ padding: "28px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            
            {/* Question Header Meta */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: "6px" }}>
                  {currentQ.topic} {currentQ.subtopic ? `• ${currentQ.subtopic}` : ""}
                </span>
                <span style={{ marginLeft: "10px", fontSize: "12px", color: "#64748b" }}>
                  Type: <strong style={{ textTransform: "uppercase" }}>{qType.replace(/_/g, " ")}</strong>
                </span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", background: "#f8fafc", padding: "4px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                Marks: {currentQ.maxMarks}
              </div>
            </div>

            {/* Question Text */}
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", lineHeight: 1.5, marginBottom: "16px" }}>
              Q{currentIdx + 1}. {currentQ.questionText}
            </h3>

            {/* Code Snippet for Tracing/Debugging if present */}
            {currentQ.codeSnippet && (
              <pre style={{
                background: "#0f172a",
                color: "#38bdf8",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "13px",
                lineHeight: 1.5,
                overflowX: "auto",
                marginBottom: "20px"
              }}>
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* SQL Schema Definition if present */}
            {currentQ.sqlSchema && (
              <div style={{ background: "#f1f5f9", padding: "14px", borderRadius: "8px", marginBottom: "18px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  📊 Database Table Schema:
                </div>
                <code style={{ fontSize: "13px", color: "#0f172a" }}>{currentQ.sqlSchema}</code>
              </div>
            )}

            {/* Constraints & Hints if present */}
            {currentQ.constraints && (
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                📌 <strong>Constraints:</strong> {currentQ.constraints}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* DYNAMIC ANSWER INPUT CONTROLS ACCORDING TO TYPE   */}
            {/* ------------------------------------------------ */}

            {/* 1. MCQ OPTIONS */}
            {(qType === "mcq" || (currentQ.options && currentQ.options.length > 0 && qType !== "numerical")) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                {(currentQ.options || []).map((opt, oIdx) => {
                  const optLetter = String.fromCharCode(65 + oIdx);
                  const userAns = answersMap[currentQ.questionId];
                  const isSelected = userAns === optLetter || userAns === opt;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleAnswerChange(currentQ.questionId, optLetter)}
                      className={`prep-option-card ${isSelected ? "selected" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="prep-option-badge">{optLetter}</div>
                      <span style={{ fontSize: "15px", color: "#1e293b", fontWeight: isSelected ? 600 : 400 }}>
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. NUMERICAL ANSWER INPUT */}
            {qType === "numerical" && (
              <div style={{ marginTop: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Enter Numerical Value (decimal or integer):
                </label>
                <input
                  type="text"
                  value={answersMap[currentQ.questionId] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder="e.g. 24 or 12.5"
                  style={{ width: "240px", padding: "12px", fontSize: "16px", fontWeight: 600, borderRadius: "8px", border: "1.5px solid #cbd5e1" }}
                />
              </div>
            )}

            {/* 3. SHORT ANSWER / LONG CONCEPTUAL / HR BEHAVIORAL */}
            {["short_answer", "long_answer", "hr_behavioral", "subjective"].includes(qType) && (!currentQ.options || currentQ.options.length === 0) && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    {qType === "hr_behavioral" ? "Your Structured Response (STAR Method recommended):" : "Your Detailed Explanation:"}
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Word Count: {(answersMap[currentQ.questionId] || "").split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={answersMap[currentQ.questionId] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder={
                    qType === "hr_behavioral"
                      ? "Structure your response with: Situation, Task, Action, and Result (with measurable outcome)..."
                      : "Explain the technical concept, principles, trade-offs, and key components clearly..."
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    resize: "vertical"
                  }}
                />
                {qType === "hr_behavioral" && (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                    💡 <em>Tip: Focus on your personal contribution, challenges encountered, and what you learned.</em>
                  </p>
                )}
              </div>
            )}

            {/* 4. CODING CHALLENGE */}
            {qType === "coding" && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                    Write Code ({currentQ.codingLanguage || currentQ.codeLanguage || "javascript"}):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRunSampleCode(currentQ.questionId, answersMap[currentQ.questionId])}
                    disabled={isRunningCode}
                    className="ai-btn-primary"
                    style={{ padding: "6px 14px", fontSize: "13px", background: "#059669" }}
                  >
                    {isRunningCode ? "⚙️ Running Sandbox Tests..." : "▶ Run Visible Sample Tests"}
                  </button>
                </div>

                <textarea
                  rows={12}
                  className="prep-code-box"
                  value={answersMap[currentQ.questionId] !== undefined ? answersMap[currentQ.questionId] : (currentQ.codeStarter || currentQ.codeTemplate || "")}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder="// Implement your solution here..."
                  spellCheck={false}
                />

                {/* Visible Sample Test Cases Display */}
                {currentQ.testCases && (
                  <div style={{ marginTop: "14px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                      Visible Sample Test Cases:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {currentQ.testCases.filter(tc => !tc.isHidden).map((tc, tcIdx) => (
                        <div key={tcIdx} style={{ fontSize: "12px", fontFamily: "monospace", background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                          Input: <code>{JSON.stringify(tc.input)}</code> → Expected: <code>{JSON.stringify(tc.expectedOutput)}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Run Sandbox Results */}
                {codeRunResult && (
                  <div style={{ marginTop: "14px", padding: "16px", borderRadius: "8px", background: codeRunResult.samplePassed ? "#ecfdf5" : "#fef2f2", border: `1px solid ${codeRunResult.samplePassed ? "#a7f3d0" : "#fecaca"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: codeRunResult.samplePassed ? "#065f46" : "#991b1b" }}>
                        {codeRunResult.samplePassed ? "✅ Sample Tests Passed!" : "❌ Sample Tests Failed"}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Execution Time: {codeRunResult.sampleDetails?.[0]?.executionTimeMs || 0}ms
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(codeRunResult.sampleDetails || []).map((det, dIdx) => (
                        <div key={dIdx} style={{ fontSize: "12px", fontFamily: "monospace", padding: "6px", background: "white", borderRadius: "4px" }}>
                          Test #{dIdx + 1}: {det.passed ? "✓ Passed" : `✗ Failed (Expected: ${JSON.stringify(det.expected)}, Got: ${JSON.stringify(det.actual)})`}
                          {det.error && <span style={{ color: "#b91c1c" }}> • Error: {det.error}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. SQL QUERY INPUT */}
            {qType === "sql" && (
              <div style={{ marginTop: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                  Write Your SQL Query:
                </label>
                <textarea
                  rows={6}
                  className="prep-code-box"
                  value={answersMap[currentQ.questionId] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder="SELECT ... FROM ... WHERE ... GROUP BY ...;"
                  spellCheck={false}
                />
              </div>
            )}

            {/* 6. GENERIC FALLBACK IF TYPE IS UNRECOGNIZED AND NO OPTIONS */}
            {!["mcq", "numerical", "short_answer", "long_answer", "hr_behavioral", "subjective", "coding", "sql"].includes(qType) && (!currentQ.options || currentQ.options.length === 0) && (
              <div style={{ marginTop: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Your Response:
                </label>
                <textarea
                  rows={6}
                  value={answersMap[currentQ.questionId] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder="Type your response here..."
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    lineHeight: 1.6
                  }}
                />
              </div>
            )}

            {/* Immediate Evaluation Result (Practice Mode) */}
            {session.revealMode === "immediate" && (
              <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                {!immediateEvaluation ? (
                  <button
                    type="button"
                    onClick={() => handleImmediateSubmit(currentQ.questionId)}
                    disabled={evaluatingImmediate || !answersMap[currentQ.questionId]}
                    className="ai-btn-primary"
                    style={{ padding: "8px 18px", fontSize: "13px" }}
                  >
                    {evaluatingImmediate ? "Evaluating with AI Rubric..." : "🔍 Check Answer & Reveal Explanation"}
                  </button>
                ) : (
                  <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontWeight: 800, fontSize: "16px", color: immediateEvaluation.scoreAwarded > 0 ? "#059669" : "#dc2626" }}>
                        Score: {immediateEvaluation.scoreAwarded} / {immediateEvaluation.maxMarks} Marks ({immediateEvaluation.percentage}%)
                      </span>
                      <span className="ai-prep-badge ai-prep-badge-primary">Immediate Evaluation</span>
                    </div>

                    {immediateEvaluation.feedback && (
                      <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                        {immediateEvaluation.feedback}
                      </p>
                    )}

                    {immediateEvaluation.explanation && (
                      <div style={{ marginTop: "10px", fontSize: "13px", color: "#1e293b", background: "#ffffff", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <strong>Reference Explanation:</strong> {immediateEvaluation.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
              <button
                type="button"
                onClick={() => {
                  if (currentIdx > 0) {
                    setCurrentIdx(prev => prev - 1);
                    setCodeRunResult(null);
                    setImmediateEvaluation(null);
                  }
                }}
                disabled={currentIdx === 0}
                className="btn-secondary"
                style={{ padding: "10px 20px" }}
              >
                ← Previous
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                {currentIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIdx(prev => prev + 1);
                      setCodeRunResult(null);
                      setImmediateEvaluation(null);
                    }}
                    className="ai-btn-primary"
                    style={{ padding: "10px 22px" }}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="ai-btn-primary"
                    style={{ padding: "10px 24px", background: "#059669" }}
                  >
                    ✓ Review & Final Submit
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Confirm Submission Modal */}
          {showConfirmSubmit && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000
            }}>
              <div style={{
                background: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
                maxWidth: "480px",
                width: "90%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
              }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                  Submit Placement Assessment?
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5, marginBottom: "20px" }}>
                  You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
                  Once submitted, our AI Rubric & Sandbox Evaluator will grade your objective, subjective, SQL, and coding answers.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(false)}
                    disabled={isSubmitting}
                    className="btn-secondary"
                    style={{ padding: "10px 18px" }}
                  >
                    Continue Answering
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(false)}
                    disabled={isSubmitting}
                    className="ai-btn-primary"
                    style={{ padding: "10px 22px", background: "#059669" }}
                  >
                    {isSubmitting ? "Evaluating & Generating Report..." : "Confirm & Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. COMPREHENSIVE ASSESSMENT REPORT & DASHBOARD            */}
      {/* ========================================================= */}
      {activeTab === "report" && report && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Header Score Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            color: "#ffffff",
            padding: "32px",
            borderRadius: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px"
          }}>
            <div>
              <span className="ai-prep-badge" style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff", marginBottom: "8px" }}>
                Assessment Report Complete
              </span>
              <h2 style={{ fontSize: "26px", fontWeight: 800, margin: "6px 0" }}>
                Placement Readiness Assessment
              </h2>
              <p style={{ fontSize: "14px", opacity: 0.85, margin: 0 }}>
                {report.totalQuestions} Questions evaluated via Deterministic Scoring, Rubric Analysis, and Code Execution.
              </p>
            </div>

            <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", padding: "16px 24px", borderRadius: "12px" }}>
                <div style={{ fontSize: "36px", fontWeight: 900, color: report.overallPercentage >= 70 ? "#34d399" : report.overallPercentage >= 40 ? "#fbbf24" : "#f87171" }}>
                  {report.overallPercentage}%
                </div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>Overall Score ({report.totalScore}/{report.maxScore})</div>
              </div>

              <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", padding: "16px 24px", borderRadius: "12px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#60a5fa" }}>
                  {report.readinessGrade}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>Placement Tier</div>
              </div>
            </div>
          </div>

          {/* Metric Breakdown Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            
            {/* Objective Score */}
            <div className="card" style={{ padding: "18px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Objective Performance
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                {report.objectiveCorrectCount} / {report.objectiveTotalCount} Correct
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Incorrect: {report.objectiveIncorrectCount} • Unanswered: {report.unansweredCount}
              </p>
            </div>

            {/* Subjective Rubric Score */}
            <div className="card" style={{ padding: "18px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Subjective Rubric Score
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#7c3aed" }}>
                {report.subjectiveScore} / {report.subjectiveMaxScore} Marks
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Evaluated against 4-part weighted rubric
              </p>
            </div>

            {/* Coding Tests */}
            <div className="card" style={{ padding: "18px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Coding Sandbox Pass Rate
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669" }}>
                {report.codingPassedCount} / {report.codingTotalCount} Passed
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Sample and hidden test execution
              </p>
            </div>
          </div>

          {/* Subjective Rubric Breakdown */}
          {report.rubricBreakdown && (
            <div className="card" style={{ padding: "24px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
                📊 Subjective Criteria Evaluation Breakdown
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {Object.entries(report.rubricBreakdown).map(([criterion, score]) => (
                  <div key={criterion} style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                      <span style={{ textTransform: "capitalize" }}>{criterion.replace(/([A-Z])/g, " $1")}</span>
                      <span style={{ color: "#2563eb" }}>{score}%</span>
                    </div>
                    <div className="prep-rubric-bar">
                      <div className="prep-rubric-fill" style={{ width: `${score}%`, background: "#2563eb" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance by Topic & Difficulty */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            
            {/* Topic Performance */}
            <div className="card" style={{ padding: "22px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "14px" }}>
                📚 Topic-Wise Mastery
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(report.topicBreakdown || {}).map(([top, stat]) => (
                  <div key={top}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      <span>{top}</span>
                      <span>{stat.score} / {stat.maxScore} ({stat.percentage}%)</span>
                    </div>
                    <div className="prep-rubric-bar">
                      <div
                        className="prep-rubric-fill"
                        style={{
                          width: `${stat.percentage}%`,
                          background: stat.percentage >= 70 ? "#10b981" : stat.percentage >= 40 ? "#f59e0b" : "#ef4444"
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Performance */}
            <div className="card" style={{ padding: "22px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "14px" }}>
                🎯 Performance by Difficulty
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(report.difficultyBreakdown || {}).map(([diff, stat]) => (
                  <div key={diff}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      <span style={{ textTransform: "capitalize" }}>{diff}</span>
                      <span>{stat.score} / {stat.maxScore} ({stat.percentage}%)</span>
                    </div>
                    <div className="prep-rubric-bar">
                      <div
                        className="prep-rubric-fill"
                        style={{
                          width: `${stat.percentage}%`,
                          background: diff === "easy" ? "#10b981" : diff === "medium" ? "#3b82f6" : "#7c3aed"
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            
            {/* Strengths */}
            <div className="card" style={{ padding: "22px", background: "#ffffff", borderRadius: "14px", border: "1px solid #d1fae5" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#065f46", marginBottom: "12px" }}>
                ✅ Key Strengths Identified ({report.strengths?.length || 0})
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {(report.strengths || []).map((str, idx) => (
                  <li key={idx} style={{ fontSize: "13px", color: "#166534" }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="card" style={{ padding: "22px", background: "#ffffff", borderRadius: "14px", border: "1px solid #fee2e2" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#991b1b", marginBottom: "12px" }}>
                ⚠️ Weak Areas to Address ({report.weaknesses?.length || 0})
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {(report.weaknesses || []).map((wk, idx) => (
                  <li key={idx} style={{ fontSize: "13px", color: "#991b1b" }}>{wk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personalized Revision Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="card" style={{ padding: "24px", background: "#eff6ff", borderRadius: "14px", border: "1px solid #bfdbfe" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1e40af", marginBottom: "12px" }}>
                🚀 Personalized Placement Revision Roadmap
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} style={{ fontSize: "13px", color: "#1e3a8a", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span>👉</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-By-Question Detailed Review */}
          <div className="card" style={{ padding: "26px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "18px" }}>
              📋 Detailed Answer Review & Explanations ({report.questionReviews?.length || 0})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {(report.questionReviews || []).map((rev, idx) => (
                <div key={idx} style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: rev.scoreAwarded > 0 ? "1px solid #e2e8f0" : "1px solid #fecaca",
                  background: rev.scoreAwarded > 0 ? "#f8fafc" : "#fff5f5"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
                      Q{idx + 1}. {rev.questionText}
                    </span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: "13px",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: rev.scoreAwarded === rev.maxMarks ? "#d1fae5" : rev.scoreAwarded > 0 ? "#fef3c7" : "#fee2e2",
                      color: rev.scoreAwarded === rev.maxMarks ? "#065f46" : rev.scoreAwarded > 0 ? "#92400e" : "#991b1b"
                    }}>
                      Score: {rev.scoreAwarded} / {rev.maxMarks}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>
                    <strong>Your Submitted Answer:</strong> {rev.studentAnswer || "<No answer submitted>"}
                  </div>

                  {rev.correctAnswer && (
                    <div style={{ fontSize: "13px", color: "#166534", marginBottom: "6px" }}>
                      <strong>Correct Answer Key:</strong> {rev.correctAnswer}
                    </div>
                  )}

                  {rev.explanation && (
                    <div style={{ fontSize: "13px", color: "#334155", background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "8px" }}>
                      <strong>Explanation / Model Answer:</strong> {rev.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action to Start New Assessment */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("setup")}
              className="ai-btn-primary"
              style={{ padding: "12px 28px", fontSize: "15px" }}
            >
              🔄 Start Another Assessment
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. HISTORY & PROGRESS TRACKING VIEW                       */}
      {/* ========================================================= */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Assessment History & Continuous Mastery
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                  Track your scores across aptitude, technical rounds, and mock interviews.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("setup")}
                className="ai-btn-primary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                + New Assessment
              </button>
            </div>

            {loadingReport ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="spinner" style={{ margin: "0 auto 10px" }}></div>
                <p style={{ color: "#64748b" }}>Loading assessment report...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📝</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>No Assessments Completed Yet</h4>
                <p style={{ fontSize: "13px" }}>Launch your first preparation assessment from the Setup tab above!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historyList.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span className="ai-prep-badge ai-prep-badge-primary">
                          {item.category?.toUpperCase()}
                        </span>
                        {item.targetCompany && (
                          <span className="ai-prep-badge ai-prep-badge-success">
                            {item.targetCompany}
                          </span>
                        )}
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {item.difficulty} • {item.questionCount} Questions
                        </span>
                      </div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "2px 0" }}>
                        {item.targetRole || "Placement Assessment"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                        Topics: {(item.topics || []).slice(0, 3).join(", ")} • Completed on {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: item.percentage >= 70 ? "#059669" : item.percentage >= 40 ? "#d97706" : "#dc2626" }}>
                          {item.percentage}%
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {item.totalScore} / {item.maxScore} Marks
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewReportFromHistory(item.id)}
                        className="btn-secondary"
                        style={{ padding: "8px 14px", fontSize: "13px" }}
                      >
                        View Report →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
