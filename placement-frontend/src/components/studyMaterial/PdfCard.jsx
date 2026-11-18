import { useState } from 'react';
import {
  FileText,
  BookOpen,
  Download,
  Calendar,
  HardDrive,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function PdfCard({ pdf, subject, onOpenPdf, onDownloadPdf }) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = pdf.lastModified
    ? new Date(pdf.lastModified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        padding: '22px',
        border: isHovered ? '1px solid #38BDF8' : '1px solid #E2E8F0',
        boxShadow: isHovered
          ? '0 16px 28px -8px rgba(56, 189, 248, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          : '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Badges & Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.04) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              flexShrink: 0
            }}
          >
            <FileText size={24} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' }}>
            {pdf.formattedSize && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#475569'
                }}
              >
                <HardDrive size={12} />
                {pdf.formattedSize}
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0'
              }}
            >
              <CheckCircle2 size={12} />
              PDF Verified
            </span>
          </div>
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px',
            lineHeight: 1.35,
            letterSpacing: '-0.2px'
          }}
        >
          {pdf.title}
        </h4>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            lineHeight: 1.5,
            margin: '0 0 16px'
          }}
        >
          {pdf.description}
        </p>
      </div>

      <div>
        {/* File metadata footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '14px',
            borderTop: '1px solid #F1F5F9',
            fontSize: '12px',
            color: '#94A3B8',
            marginBottom: '14px'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            {formattedDate || 'Curated 2026'}
          </span>
          <span
            style={{
              fontWeight: 700,
              color: subject?.accentColor || '#2563EB',
              fontSize: '11px',
              textTransform: 'uppercase'
            }}
          >
            {subject?.shortName || subject?.code || 'STUDY'}
          </span>
        </div>

        {/* Action Buttons: "Open PDF" and "Download" */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
          <button
            onClick={() => onOpenPdf(pdf)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Eye size={15} />
            <span>Open PDF</span>
          </button>

          <button
            onClick={() => onDownloadPdf(pdf)}
            title="Download PDF"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 14px',
              borderRadius: '9px',
              background: '#F8FAFC',
              color: '#475569',
              border: '1px solid #CBD5E1',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
