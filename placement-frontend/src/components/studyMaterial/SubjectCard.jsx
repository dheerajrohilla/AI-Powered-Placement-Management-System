import { useState } from 'react';
import {
  Code,
  Layers,
  GitBranch,
  Cpu,
  HardDrive,
  Terminal,
  Database,
  BookOpen,
  ArrowRight,
  FileText,
  Sparkles,
  Network
} from 'lucide-react';

const ICON_MAP = {
  Layers: Layers,
  Code: Code,
  GitBranch: GitBranch,
  Cpu: Cpu,
  HardDrive: HardDrive,
  Terminal: Terminal,
  Database: Database,
  BookOpen: BookOpen,
  Network: Network
};

export default function SubjectCard({ subject, onExplore }) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = ICON_MAP[subject.icon] || BookOpen;
  const count = subject.pdfCount || 0;
  const accentColor = subject.accentColor || '#3B82F6';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: isHovered ? `1px solid ${accentColor}` : '1px solid #E2E8F0',
        boxShadow: isHovered
          ? `0 20px 30px -10px ${subject.bgGlow || 'rgba(59, 130, 246, 0.15)'}, 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top subtle decorative gradient bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: subject.gradient || `linear-gradient(90deg, ${accentColor}, #8B5CF6)`
        }}
      />

      <div>
        {/* Top Header: Icon + PDF Count Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: subject.bgGlow || 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              transition: 'transform 0.25s ease',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)'
            }}
          >
            <IconComponent size={28} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: count > 0 ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${count > 0 ? '#BBF7D0' : '#E2E8F0'}`,
              color: count > 0 ? '#15803D' : '#64748B',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <FileText size={14} />
            <span>{count} {count === 1 ? 'PDF' : 'PDFs'}</span>
          </div>
        </div>

        {/* Subject Title & Code */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#F1F5F9',
                color: '#334155'
              }}
            >
              {subject.code}
            </span>
          </div>
          <h3
            style={{
              fontSize: '19px',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.3
            }}
          >
            {subject.name}
          </h3>
        </div>

        {/* Subject Description */}
        <p
          style={{
            fontSize: '13.5px',
            color: '#64748B',
            lineHeight: 1.55,
            margin: '0 0 16px',
            minHeight: '42px'
          }}
        >
          {subject.description}
        </p>

        {/* Topics / Highlights Tags */}
        {subject.topics && subject.topics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {subject.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0'
                }}
              >
                {topic}
              </span>
            ))}
            {subject.topics.length > 3 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 6px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  color: '#94A3B8'
                }}
              >
                +{subject.topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button: "Explore Materials" */}
      <button
        onClick={() => onExplore(subject)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '11px 18px',
          borderRadius: '10px',
          background: isHovered ? subject.gradient || accentColor : '#0F172A',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '13.5px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: isHovered ? `0 6px 16px -2px ${accentColor}66` : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span>Explore Materials</span>
        <ArrowRight size={16} style={{ transition: 'transform 0.2s', transform: isHovered ? 'translateX(3px)' : 'none' }} />
      </button>
    </div>
  );
}
