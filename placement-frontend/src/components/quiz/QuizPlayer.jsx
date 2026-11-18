import { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Send,
  HelpCircle,
  X
} from 'lucide-react';

export default function QuizPlayer({
  session,
  onSubmitQuiz,
  isSubmitting,
  onExit
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [markedForReview, setMarkedForReview] = useState({}); // { [questionId]: boolean }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((session.durationMinutes || 20) * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  const questions = session.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx] || {};

  // Countdown timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-submit when timer expires
  useEffect(() => {
    if (isTimeExpired && !isSubmitting) {
      handleFinalSubmit();
    }
  }, [isTimeExpired]);

  // Format time MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    const totalSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    setShowConfirmModal(false);
    onSubmitQuiz({
      quizSessionId: session.quizSessionId,
      answers,
      timeSpentSeconds: totalSpent
    });
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== -1).length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  // Timer color changes (green -> amber at 5m -> red at 2m)
  const timerColor = timeLeftSeconds <= 120 ? '#EF4444' : timeLeftSeconds <= 300 ? '#F59E0B' : '#10B981';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Status & Timer Bar */}
      <div
        style={{
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: session.difficulty === 'hard' ? '#EF4444' : session.difficulty === 'medium' ? '#F59E0B' : '#10B981',
                color: '#FFFFFF',
                textTransform: 'uppercase'
              }}
            >
              {session.difficulty}
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>
              {session.subjectName}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Question {currentIdx + 1} of {totalQuestions} • {answeredCount} Answered
          </div>
        </div>

        {/* Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${timerColor}60`,
              color: timerColor,
              fontSize: '18px',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            <Clock size={18} color={timerColor} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Send size={14} /> Submit Quiz
          </button>
        </div>
      </div>

      {/* Main Layout: Question Area + Question Navigation Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Active Question */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          {/* Question Header & Topic */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#2563EB',
                background: '#EFF6FF',
                padding: '3px 10px',
                borderRadius: '6px'
              }}
            >
              Topic: {currentQuestion.topic || 'General'}
            </span>

            <button
              onClick={toggleMarkForReview}
              style={{
                background: markedForReview[currentQuestion.id] ? '#FEF3C7' : '#F8FAFC',
                border: markedForReview[currentQuestion.id] ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                color: markedForReview[currentQuestion.id] ? '#D97706' : '#64748B',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Flag size={13} />
              <span>{markedForReview[currentQuestion.id] ? 'Flagged for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.5,
              marginBottom: '28px'
            }}
          >
            <span style={{ color: '#2563EB', marginRight: '8px' }}>Q{currentIdx + 1}.</span>
            {currentQuestion.questionText}
          </h2>

          {/* 4 Options (A, B, C, D) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {currentQuestion.options?.map((optionText, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
              const isSelected = answers[currentQuestion.id] === optIdx;

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#2563EB' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      border: isSelected ? 'none' : '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0
                    }}
                  >
                    {letter}
                  </div>

                  <span
                    style={{
                      fontSize: '14px',
                      color: isSelected ? '#1E3A8A' : '#334155',
                      fontWeight: isSelected ? 600 : 500,
                      lineHeight: 1.4
                    }}
                  >
                    {optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls: Previous & Next */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: currentIdx === 0 ? '#94A3B8' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                Review & Submit <Send size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigation Grid */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
            Question Navigator
          </h3>

          {/* Question Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== -1;
              const isFlagged = markedForReview[q.id];

              let bg = '#F8FAFC';
              let text = '#64748B';
              let border = '1px solid #E2E8F0';

              if (isAnswered) {
                bg = '#ECFDF5';
                text = '#059669';
                border = '1px solid #A7F3D0';
              }
              if (isFlagged) {
                bg = '#FEF3C7';
                text = '#D97706';
                border = '1px solid #FDE68A';
              }
              if (isCurrent) {
                border = '2px solid #2563EB';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    height: '38px',
                    borderRadius: '8px',
                    background: bg,
                    border,
                    color: text,
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748B', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ECFDF5', border: '1px solid #A7F3D0' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F8FAFC', border: '1px solid #E2E8F0' }} />
              <span>Unanswered ({totalQuestions - answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#FEF3C7', border: '1px solid #FDE68A' }} />
              <span>Marked for Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Send size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Confirm Quiz Submission
            </h3>

            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px' }}>
              You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
              {totalQuestions - answeredCount > 0 && (
                <span style={{ color: '#D97706', display: 'block', marginTop: '6px' }}>
                  ⚠️ You still have {totalQuestions - answeredCount} unanswered question(s).
                </span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Keep Answering
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'wait' : 'pointer'
                }}
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
