import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function QuizResultView({
  result,
  onRetakeQuiz,
  onGoToDashboard,
  onGoToQuizzes
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unanswered'

  const score = result.score || 0;
  const total = result.totalQuestions || 15;
  const pct = result.percentage || Math.round((score / total) * 100);

  // Format time taken
  const formatTime = (secs) => {
    if (!secs) return '0m';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Determine badge styling based on percentage
  const statusColor = pct >= 80 ? '#10B981' : pct >= 60 ? '#38BDF8' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const statusBg = pct >= 80 ? '#ECFDF5' : pct >= 60 ? '#EFF6FF' : pct >= 40 ? '#FEF3C7' : '#FEF2F2';

  // Filtered review questions
  const filteredQuestions = (result.questions || []).filter(q => {
    if (filterMode === 'correct') return q.isCorrect;
    if (filterMode === 'incorrect') return q.isAnswered && !q.isCorrect;
    if (filterMode === 'unanswered') return !q.isAnswered;
    return true;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* ================= RESULT HERO SUMMARY CARD ================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.45)'
        }}
      >
        {/* Glow ambient background element */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: statusColor,
            filter: 'blur(70px)',
            opacity: 0.25,
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#38BDF8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {result.subject?.toUpperCase()} • {result.difficulty?.toUpperCase()}
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Evaluation Complete</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: statusBg,
                color: statusColor,
                fontWeight: 800,
                fontSize: '12px'
              }}
            >
              <Award size={15} />
              {result.performanceCategory}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '24px',
              alignItems: 'center'
            }}
          >
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                {result.performanceCategory}
              </h1>
              <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px', maxWidth: '620px', lineHeight: 1.6 }}>
                {result.performanceMessage}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={onRetakeQuiz}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '11px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  <RotateCcw size={16} /> Retake Quiz
                </button>

                <button
                  onClick={onGoToDashboard}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '11px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <LayoutDashboard size={16} /> Performance Dashboard
                </button>
              </div>
            </div>

            {/* Score Ring / Pill */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '24px 32px',
                textAlign: 'center',
                minWidth: '160px'
              }}
            >
              <div style={{ fontSize: '48px', fontWeight: 900, color: statusColor, lineHeight: 1 }}>
                {pct}%
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#F1F5F9', marginTop: '6px' }}>
                {score} / {total} Marks
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                {formatTime(result.timeSpentSeconds)} Taken
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BREAKDOWN METRIC TILES ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{result.correctCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Correct Answers (+{result.correctCount})</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{result.incorrectCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Incorrect Answers (0 marks)</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F8FAFC', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{result.unansweredCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Unanswered Questions</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatTime(result.timeSpentSeconds)}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Total Time Elapsed</div>
          </div>
        </div>
      </div>

      {/* ================= REVIEW ANSWERS SECTION ================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Detailed Answer Key & Solutions
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              Review correct options and technical explanations for all {total} questions.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All (15)' },
              { id: 'correct', label: `Correct (${result.correctCount})` },
              { id: 'incorrect', label: `Incorrect (${result.incorrectCount})` },
              { id: 'unanswered', label: `Unanswered (${result.unansweredCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterMode === f.id ? '#FFFFFF' : 'transparent',
                  color: filterMode === f.id ? '#0F172A' : '#64748B',
                  fontWeight: filterMode === f.id ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: filterMode === f.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredQuestions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const isAnswered = q.isAnswered;

            return (
              <div
                key={q.questionId || idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  padding: '24px',
                  border: isCorrect
                    ? '1px solid #BBF7D0'
                    : isAnswered
                    ? '1px solid #FECACA'
                    : '1px solid #E2E8F0'
                }}
              >
                {/* Question Status Badge & Topic */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      Question {q.index || idx + 1}
                    </span>
                    <span style={{ fontSize: '11px', background: '#E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {q.topic || 'Core'}
                    </span>
                  </div>

                  {isCorrect ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: 700, background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                      <CheckCircle2 size={13} /> Correct (+1)
                    </span>
                  ) : isAnswered ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '12px', fontWeight: 700, background: '#FEF2F2', padding: '2px 8px', borderRadius: '6px' }}>
                      <XCircle size={13} /> Incorrect (0)
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '12px', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                      <HelpCircle size={13} /> Unanswered (0)
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px', lineHeight: 1.45 }}>
                  {q.questionText}
                </h4>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {q.options?.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isStudentPick = q.selectedOption === optIdx;
                    const isRightOption = q.correctOption === optIdx;

                    let optBg = '#FFFFFF';
                    let optBorder = '1px solid #E2E8F0';
                    let optText = '#334155';

                    if (isRightOption) {
                      optBg = '#F0FDF4';
                      optBorder = '2px solid #10B981';
                      optText = '#065F46';
                    } else if (isStudentPick && !isRightOption) {
                      optBg = '#FEF2F2';
                      optBorder = '2px solid #EF4444';
                      optText = '#991B1B';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          background: optBg,
                          border: optBorder,
                          borderRadius: '10px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '13.5px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, color: isRightOption ? '#059669' : isStudentPick ? '#DC2626' : '#64748B' }}>
                            {letter}.
                          </span>
                          <span style={{ color: optText, fontWeight: isRightOption || isStudentPick ? 600 : 500 }}>
                            {opt}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isRightOption && (
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                              ✓ Correct Answer
                            </span>
                          )}
                          {isStudentPick && !isRightOption && (
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                              ✕ Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Technical Explanation Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: '#334155'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                    <Sparkles size={14} /> Solution & Explanation:
                  </div>
                  <div>{q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
