import {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  BarChart2,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  BookOpen,
  Calendar
} from 'lucide-react';
import VisualAnalyticsCharts from './VisualAnalyticsCharts';

export default function QuizDashboardView({
  dashboardData,
  onStartQuizSubject,
  onViewAttemptResult
}) {
  const overall = dashboardData?.overall || {
    totalQuizzes: 0,
    totalQuestions: 0,
    overallAvgScore: 0,
    overallAccuracy: 0,
    bestScore: 0,
    totalTimeSeconds: 0
  };

  const subjectWise = dashboardData?.subjectWise || [];
  const difficultyWise = dashboardData?.difficultyWise || {};
  const visualAnalytics = dashboardData?.visualAnalytics || {};
  const recommendations = dashboardData?.recommendations || [];
  const recentAttempts = dashboardData?.recentAttempts || [];

  // Format seconds into minutes/hours
  const formatTime = (secs) => {
    if (!secs) return '0 min';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ================= OVERALL STATISTICS STRIP ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Quizzes Taken</span>
            <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px', borderRadius: '8px' }}><Target size={16} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>{overall.totalQuizzes}</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{overall.totalQuestions} Questions Solved</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Overall Accuracy</span>
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '4px', borderRadius: '8px' }}><CheckCircle2 size={16} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#10B981' }}>{overall.overallAccuracy}%</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Avg Score: {overall.overallAvgScore}/15</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Best Performance</span>
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px', borderRadius: '8px' }}><Award size={16} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#F59E0B' }}>{overall.bestScore}/15</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Peak Accuracy: {Math.round((overall.bestScore / 15) * 100)}%</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Time Invested</span>
            <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px', borderRadius: '8px' }}><Clock size={16} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>{formatTime(overall.totalTimeSeconds)}</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Across active assessments</div>
        </div>
      </div>

      {/* ================= PERSONALIZED RECOMMENDATIONS ================= */}
      {recommendations.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px 28px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#38BDF8" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>
              AI Placement Assessment Recommendations
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#38BDF8', margin: '0 0 6px' }}>
                    {rec.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                    {rec.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBJECT-WISE MASTERY CARDS (6 SUBJECTS) ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Subject-Wise Readiness & Mastery
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '3px 0 0' }}>
              Real-time performance across the six core campus placement technical topics.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}
        >
          {subjectWise.map(s => {
            const pct = s.avgPercentage || 0;
            const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#38BDF8' : pct >= 40 ? '#F59E0B' : '#EF4444';

            return (
              <div
                key={s.subject}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '22px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, background: '#F1F5F9', color: '#0F172A', padding: '3px 8px', borderRadius: '6px' }}>
                      {s.code}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: `${color}15`,
                        color
                      }}
                    >
                      {s.category}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>
                    {s.subjectName}
                  </h4>

                  {/* Percentage Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Mastery Level</span>
                      <span style={{ color }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: color,
                          borderRadius: '4px',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '18px' }}>
                    <span>{s.attempts} {s.attempts === 1 ? 'Quiz Attempted' : 'Quizzes Attempted'}</span>
                    <span>Best Score: <strong>{s.bestScore}/15</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => onStartQuizSubject(s.subject)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0F172A';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                >
                  <span>Take Assessment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= VISUAL ANALYTICS CHARTS ================= */}
      <VisualAnalyticsCharts
        analytics={visualAnalytics}
        difficultyWise={difficultyWise}
        subjectWise={subjectWise}
      />

      {/* ================= RECENT QUIZ ATTEMPTS TABLE ================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recent Quiz Attempts & Evaluations
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              Historical assessments recorded in your placement profile with full review access.
            </p>
          </div>
        </div>

        {recentAttempts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 16px' }}>Subject</th>
                  <th style={{ padding: '12px 16px' }}>Difficulty</th>
                  <th style={{ padding: '12px 16px' }}>Score</th>
                  <th style={{ padding: '12px 16px' }}>Percentage</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map(attempt => {
                  const dateStr = attempt.completedAt
                    ? new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';

                  const diffColor = attempt.difficulty === 'hard' ? '#EF4444' : attempt.difficulty === 'medium' ? '#F59E0B' : '#10B981';

                  return (
                    <tr
                      key={attempt.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                        {attempt.subjectName}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: `${diffColor}18`,
                            color: diffColor,
                            textTransform: 'uppercase'
                          }}
                        >
                          {attempt.difficulty}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0F172A' }}>
                        {attempt.score} / {attempt.totalQuestions}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, color: attempt.percentage >= 80 ? '#10B981' : attempt.percentage >= 60 ? '#38BDF8' : '#F59E0B' }}>
                          {attempt.percentage}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {attempt.performanceCategory?.split('!')[0] || 'Evaluated'}
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B' }}>
                        {dateStr}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => onViewAttemptResult(attempt.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#2563EB',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} /> Review Answers
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            No quiz attempts recorded yet. Select any subject above to begin your assessment.
          </div>
        )}
      </div>
    </div>
  );
}
