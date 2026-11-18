import { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function VisualAnalyticsCharts({ analytics, difficultyWise, subjectWise }) {
  const [activeTab, setActiveTab] = useState('subjects');

  const subjectData = subjectWise || [];
  const scoreTrend = analytics?.scoreTrend || [];
  const answersBreakdown = analytics?.answersBreakdown || { correct: 0, incorrect: 0, unanswered: 0 };
  const totalAnswers = (answersBreakdown.correct || 0) + (answersBreakdown.incorrect || 0) + (answersBreakdown.unanswered || 0);

  // Difficulty color map
  const diffColors = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444'
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
      }}
    >
      {/* Header and Chart Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '16px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Visual Performance Analytics
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
            Interactive metrics illustrating mastery across technical subjects, difficulties, and time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'subjects' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'subjects' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'subjects' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'subjects' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <BarChart3 size={14} /> Subject Breakdown
          </button>

          <button
            onClick={() => setActiveTab('difficulty')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'difficulty' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'difficulty' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'difficulty' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'difficulty' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Activity size={14} /> Difficulty Tiers
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'trend' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'trend' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'trend' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'trend' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <TrendingUp size={14} /> Score Trend
          </button>

          <button
            onClick={() => setActiveTab('accuracy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'accuracy' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'accuracy' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'accuracy' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'accuracy' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <PieChart size={14} /> Accuracy Ratio
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SUBJECT-WISE BAR CHART ================= */}
      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {subjectData.map(s => {
              const pct = s.avgPercentage || 0;
              const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#38BDF8' : pct >= 40 ? '#F59E0B' : '#EF4444';

              return (
                <div
                  key={s.subject}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#E2E8F0', color: '#334155', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>
                        {s.code}
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                        {s.subjectName.split('(')[0]}
                      </span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color }}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B' }}>
                    <span>{s.attempts} {s.attempts === 1 ? 'Attempt' : 'Attempts'}</span>
                    <span>Best: {s.bestScore}/15</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DIFFICULTY TIERS ================= */}
      {activeTab === 'difficulty' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {['easy', 'medium', 'hard'].map(level => {
            const data = difficultyWise?.[level] || { attempts: 0, avgPercentage: 0 };
            const label = level === 'easy' ? 'Easy (Fundamentals)' : level === 'medium' ? 'Medium (Application)' : 'Hard (Mock Placement)';
            const color = diffColors[level];

            return (
              <div
                key={level}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '24px',
                  border: `1px solid ${color}40`,
                  boxShadow: `0 4px 12px ${color}10`,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color, letterSpacing: '0.6px', marginBottom: '8px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
                  {data.avgPercentage}%
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                  Average Accuracy Across {data.attempts} Quizzes
                </div>

                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${data.avgPercentage}%`, height: '100%', background: color, borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 3: SCORE TREND LINE ================= */}
      {activeTab === 'trend' && (
        <div>
          {scoreTrend.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748B' }}>
                Chronological quiz score progression (Score out of 15):
              </div>

              {/* Responsive SVG Line Chart */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 700 220" style={{ width: '100%', height: '220px', minWidth: '550px' }}>
                  {/* Grid Lines */}
                  {[0, 5, 10, 15].map(val => {
                    const y = 180 - (val / 15) * 140;
                    return (
                      <g key={val}>
                        <line x1="50" y1={y} x2="680" y2={y} stroke="#E2E8F0" strokeDasharray="3,3" />
                        <text x="35" y={y + 4} fontSize="11" fill="#94A3B8" textAnchor="end">{val}</text>
                      </g>
                    );
                  })}

                  {/* Trend Polyline */}
                  {scoreTrend.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={scoreTrend.map((pt, i) => {
                        const step = 630 / (scoreTrend.length - 1);
                        const x = 50 + i * step;
                        const y = 180 - (pt.score / 15) * 140;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  )}

                  {/* Nodes & Labels */}
                  {scoreTrend.map((pt, i) => {
                    const step = scoreTrend.length > 1 ? 630 / (scoreTrend.length - 1) : 0;
                    const x = scoreTrend.length > 1 ? 50 + i * step : 350;
                    const y = 180 - (pt.score / 15) * 140;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                        <text x={x} y={y - 12} fontSize="11" fontWeight="700" fill="#0F172A" textAnchor="middle">
                          {pt.score}/15
                        </text>
                        <text x={x} y="205" fontSize="10" fill="#64748B" textAnchor="middle">
                          {pt.subject}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
              No score history available yet. Complete your first quiz to see your progress curve.
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ACCURACY RATIO ================= */}
      {activeTab === 'accuracy' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
              <CheckCircle2 size={24} color="#059669" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#065F46' }}>
                  {answersBreakdown.correct || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#047857' }}>
                  Correct Answers ({totalAnswers > 0 ? Math.round((answersBreakdown.correct / totalAnswers) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA' }}>
              <XCircle size={24} color="#DC2626" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B' }}>
                  {answersBreakdown.incorrect || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#B91C1C' }}>
                  Incorrect Answers ({totalAnswers > 0 ? Math.round((answersBreakdown.incorrect / totalAnswers) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <HelpCircle size={24} color="#64748B" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>
                  {answersBreakdown.unanswered || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Unanswered / Timed Out ({totalAnswers > 0 ? Math.round((answersBreakdown.unanswered / totalAnswers) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>
              {totalAnswers > 0 ? Math.round((answersBreakdown.correct / totalAnswers) * 100) : 0}%
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
              Cumulative Accuracy
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '6px 0 0' }}>
              Computed across all {totalAnswers} questions attempted in verified sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
