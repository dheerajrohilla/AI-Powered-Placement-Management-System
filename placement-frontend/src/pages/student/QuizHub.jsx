import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DifficultySelectorModal from '../../components/quiz/DifficultySelectorModal';
import QuizPlayer from '../../components/quiz/QuizPlayer';
import QuizResultView from '../../components/quiz/QuizResultView';
import QuizDashboardView from '../../components/quiz/QuizDashboardView';
import { quizAPI } from '../../services/api';
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Layers,
  GitBranch,
  Cpu,
  HardDrive,
  Terminal,
  Database,
  ArrowRight,
  Flame,
  ShieldCheck,
  Award,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Network
} from 'lucide-react';

const ICON_MAP = {
  oops: Layers,
  dsa: GitBranch,
  daa: Cpu,
  coa: HardDrive,
  os: Terminal,
  dbms: Database,
  cn: Network
};

export default function QuizHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active View Tab: 'quizzes' | 'dashboard' | 'active_quiz' | 'result'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'quizzes');

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Config and subjects from backend
  const [quizConfig, setQuizConfig] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Quiz Lifecycle states
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState(null);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch configuration and dashboard data
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [configRes, dashRes] = await Promise.all([
        quizAPI.getConfig(),
        quizAPI.getDashboard()
      ]);

      if (configRes.data?.success) {
        setQuizConfig(configRes.data);
      }
      if (dashRes.data?.success) {
        setDashboardData(dashRes.data.data);
      }
    } catch (err) {
      console.error('[QuizHub] Error loading initial data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to assessment service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Check URL params for quick actions (e.g. ?subject=dsa&difficulty=easy)
  useEffect(() => {
    const subParam = searchParams.get('subject');
    const diffParam = searchParams.get('difficulty');
    if (subParam && diffParam && quizConfig?.subjects) {
      handleLaunchQuiz(subParam, diffParam);
    }
  }, [searchParams, quizConfig]);

  // Launch a new quiz session
  const handleLaunchQuiz = async (subjectId, difficulty) => {
    setIsStartingQuiz(true);
    setError(null);
    try {
      const res = await quizAPI.startQuiz({ subject: subjectId, difficulty });
      if (res.data?.success && res.data.session) {
        setActiveSession(res.data.session);
        setSelectedSubjectForModal(null);
        setActiveTab('active_quiz');
      } else {
        throw new Error(res.data?.error || 'Failed to start quiz session.');
      }
    } catch (err) {
      console.error('[QuizHub] Failed to start quiz:', err);
      setError(err.response?.data?.error || err.message || 'Error generating quiz session.');
    } finally {
      setIsStartingQuiz(false);
    }
  };

  // Submit active quiz
  const handleSubmitQuiz = async (submissionData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await quizAPI.submitQuiz(submissionData);
      if (res.data?.success && res.data.result) {
        setCurrentResult(res.data.result);
        setActiveSession(null);
        setActiveTab('result');

        // Refresh dashboard statistics in background
        quizAPI.getDashboard().then(dashRes => {
          if (dashRes.data?.success) setDashboardData(dashRes.data.data);
        }).catch(() => {});
      } else {
        throw new Error(res.data?.error || 'Submission failed.');
      }
    } catch (err) {
      console.error('[QuizHub] Error submitting quiz:', err);
      setError(err.response?.data?.error || err.message || 'Error evaluating quiz submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View details of a past attempt
  const handleViewAttemptResult = async (attemptId) => {
    setLoading(true);
    try {
      const res = await quizAPI.getAttemptDetails(attemptId);
      if (res.data?.success && res.data.result) {
        setCurrentResult(res.data.result);
        setActiveTab('result');
      }
    } catch (err) {
      console.error('[QuizHub] Error fetching attempt details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Retake current subject/difficulty
  const handleRetake = () => {
    if (currentResult?.subject && currentResult?.difficulty) {
      handleLaunchQuiz(currentResult.subject, currentResult.difficulty);
    } else {
      setActiveTab('quizzes');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* ================= BREADCRUMB NAVIGATION ================= */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748B',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => navigate('/student')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Command Center
          </button>

          <ChevronRight size={14} color="#CBD5E1" />

          <button
            onClick={() => { setActiveTab('quizzes'); setActiveSession(null); setCurrentResult(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'quizzes' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'quizzes' ? 700 : 500,
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px'
            }}
          >
            Quiz & Assessment
          </button>

          {activeTab === 'dashboard' && (
            <>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ color: '#0F172A', fontWeight: 700 }}>Performance Dashboard</span>
            </>
          )}

          {activeTab === 'active_quiz' && activeSession && (
            <>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ color: '#2563EB', fontWeight: 700 }}>
                {activeSession.subjectName} ({activeSession.difficulty?.toUpperCase()})
              </span>
            </>
          )}

          {activeTab === 'result' && currentResult && (
            <>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                Result Analysis: {currentResult.subjectName}
              </span>
            </>
          )}
        </nav>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '16px 20px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              color: '#991B1B',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#DC2626" />
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ================= VIEW 1: ACTIVE QUIZ PLAYER ================= */}
        {activeTab === 'active_quiz' && activeSession && (
          <QuizPlayer
            session={activeSession}
            onSubmitQuiz={handleSubmitQuiz}
            isSubmitting={isSubmitting}
            onExit={() => setActiveTab('quizzes')}
          />
        )}

        {/* ================= VIEW 2: QUIZ RESULT & REVIEW ================= */}
        {activeTab === 'result' && currentResult && (
          <QuizResultView
            result={currentResult}
            onRetakeQuiz={handleRetake}
            onGoToDashboard={() => setActiveTab('dashboard')}
            onGoToQuizzes={() => setActiveTab('quizzes')}
          />
        )}

        {/* ================= VIEW 3: MAIN HUB (QUIZZES OR DASHBOARD) ================= */}
        {(activeTab === 'quizzes' || activeTab === 'dashboard') && (
          <div>
            {/* HERO BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                borderRadius: '24px',
                padding: '36px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.45)'
              }}
            >
              {/* Background ambient lighting */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '260px',
                  height: '260px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.15)',
                  filter: 'blur(50px)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                  <Sparkles size={14} />
                  <span>AI Placement Preparation Platform • Assessment Engine</span>
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.7px', lineHeight: 1.25 }}>
                  AI Subject-Wise Quiz & Placement Assessment
                </h1>

                <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '720px', margin: '0 0 28px', lineHeight: 1.6 }}>
                  Test your technical mastery across core computer science disciplines. Choose between Easy (fundamentals), Medium (application), and Hard (placement simulation) tiers with instant AI evaluation and comprehensive answer explanations.
                </p>

                {/* TAB SWITCHER */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      borderRadius: '12px',
                      border: 'none',
                      background: activeTab === 'quizzes' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: activeTab === 'quizzes' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Zap size={16} /> Select Subject & Take Quiz
                  </button>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: activeTab === 'dashboard' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                      color: activeTab === 'dashboard' ? '#0F172A' : '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BarChart3 size={16} /> Performance Dashboard & History
                  </button>
                </div>
              </div>
            </div>

            {/* TAB: SELECT SUBJECT & QUIZ */}
            {activeTab === 'quizzes' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                      Choose a Placement Subject
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748B', margin: '3px 0 0' }}>
                      Each subject features dedicated Easy, Medium, and Hard placement mock question sets.
                    </p>
                  </div>
                </div>

                {/* 6 SUBJECT CARDS GRID */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '24px'
                  }}
                >
                  {quizConfig?.subjects?.map(subject => {
                    const IconComponent = ICON_MAP[subject.id] || Brain;

                    return (
                      <div
                        key={subject.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '18px',
                          padding: '26px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          {/* Subject Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#EFF6FF',
                                color: '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <IconComponent size={26} />
                            </div>

                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                background: '#F1F5F9',
                                color: '#334155',
                                padding: '4px 10px',
                                borderRadius: '20px'
                              }}
                            >
                              {subject.code}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                            {subject.name}
                          </h3>

                          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px', minHeight: '42px' }}>
                            {subject.description}
                          </p>

                          {/* Quick Difficulty Launch Badges */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            <button
                              onClick={() => handleLaunchQuiz(subject.id, 'easy')}
                              style={{
                                flex: 1,
                                padding: '7px',
                                borderRadius: '8px',
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#059669',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Easy
                            </button>

                            <button
                              onClick={() => handleLaunchQuiz(subject.id, 'medium')}
                              style={{
                                flex: 1,
                                padding: '7px',
                                borderRadius: '8px',
                                background: '#FEF3C7',
                                border: '1px solid #FDE68A',
                                color: '#D97706',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Medium
                            </button>

                            <button
                              onClick={() => handleLaunchQuiz(subject.id, 'hard')}
                              style={{
                                flex: 1,
                                padding: '7px',
                                borderRadius: '8px',
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Hard (Mock)
                            </button>
                          </div>
                        </div>

                        {/* Start Button opens Difficulty Selector Modal */}
                        <button
                          onClick={() => setSelectedSubjectForModal(subject)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '11px',
                            borderRadius: '10px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Start Assessment</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: DASHBOARD & ANALYTICS */}
            {activeTab === 'dashboard' && (
              <QuizDashboardView
                dashboardData={dashboardData}
                onStartQuizSubject={(subId) => {
                  const subObj = quizConfig?.subjects?.find(s => s.id === subId);
                  if (subObj) setSelectedSubjectForModal(subObj);
                  else handleLaunchQuiz(subId, 'medium');
                }}
                onViewAttemptResult={handleViewAttemptResult}
              />
            )}
          </div>
        )}

        {/* Difficulty Selection Modal */}
        {selectedSubjectForModal && (
          <DifficultySelectorModal
            subject={selectedSubjectForModal}
            isStarting={isStartingQuiz}
            onSelectDifficulty={(diff) => handleLaunchQuiz(selectedSubjectForModal.id, diff)}
            onClose={() => setSelectedSubjectForModal(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
