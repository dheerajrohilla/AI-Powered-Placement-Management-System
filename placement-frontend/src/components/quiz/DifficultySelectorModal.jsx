import { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Flame,
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';

export default function DifficultySelectorModal({ subject, onSelectDifficulty, onClose, isStarting }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy Level',
      badge: 'Beginner Friendly',
      icon: ShieldCheck,
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.1)',
      border: '#A7F3D0',
      description: 'Contains only easy-level questions testing fundamental concepts, syntax, and foundational definitions.',
      ruleNote: '100% Easy Questions • Basic Understanding & Core Terminology'
    },
    {
      id: 'medium',
      name: 'Medium Level',
      badge: 'Core Assessment',
      icon: Zap,
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.1)',
      border: '#FDE68A',
      description: 'Contains only medium-level questions testing conceptual mastery, practical code applications, and logical scenarios.',
      ruleNote: '100% Medium Questions • Practical Scenarios & Analytical Reasoning'
    },
    {
      id: 'hard',
      name: 'Hard Level',
      badge: 'Placement Simulation',
      icon: Flame,
      color: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.1)',
      border: '#FECACA',
      description: 'Contains a strategic mixture of Easy + Medium + Hard questions simulating actual top-tier technical placement interviews.',
      ruleNote: 'Blended Mix (Easy + Medium + Hard) • Advanced Edge-Cases & Interview Problems'
    }
  ];

  const handleStart = () => {
    onSelectDifficulty(selectedDifficulty);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              {subject.code} Assessment
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              Select Difficulty Tier: {subject.name}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '4px 0 0' }}>
              Choose your target challenge level to generate a customized 15-question MCQ assessment.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isStarting}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Difficulty Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {difficulties.map(diff => {
              const Icon = diff.icon;
              const isSelected = selectedDifficulty === diff.id;

              return (
                <div
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  style={{
                    background: isSelected ? diff.bgGlow : '#F8FAFC',
                    border: isSelected ? `2px solid ${diff.color}` : '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? `0 8px 20px -6px ${diff.color}33` : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: isSelected ? diff.color : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                          {diff.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: `${diff.color}20`,
                            color: diff.color
                          }}
                        >
                          {diff.badge}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? `6px solid ${diff.color}` : '2px solid #CBD5E1',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 8px', lineHeight: 1.45 }}>
                      {diff.description}
                    </p>

                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: diff.color }}>
                      ✓ {diff.ruleNote}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quiz Configuration Rules Box */}
          <div
            style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={15} color="#2563EB" />
              <span><strong>15</strong> Objective MCQs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#F59E0B" />
              <span><strong>20</strong> Minutes Timer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={15} color="#10B981" />
              <span><strong>15</strong> Marks (1 Mark / Question)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="#6366F1" />
              <span><strong>0</strong> Negative Marking</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isStarting}
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                background: '#F8FAFC',
                color: '#64748B',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleStart}
              disabled={isStarting}
              style={{
                padding: '11px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isStarting ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <span>{isStarting ? 'Generating Assessment...' : 'Start Assessment'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
