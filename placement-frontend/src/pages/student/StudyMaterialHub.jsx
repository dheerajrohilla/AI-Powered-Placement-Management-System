import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import SubjectCard from '../../components/studyMaterial/SubjectCard';
import PdfCard from '../../components/studyMaterial/PdfCard';
import PdfReader from '../../components/studyMaterial/PdfReader';
import { studyMaterialAPI } from '../../services/api';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Library,
  Layers,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function StudyMaterialHub() {
  const { subjectId, fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]);
  const [stats, setStats] = useState({ totalSubjects: 7, totalPdfs: 0 });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' or subjectId

  // Active state derived from URL or local selection
  const [activeSubject, setActiveSubject] = useState(null);
  const [activePdf, setActivePdf] = useState(null);

  // Fetch all subjects and materials from backend
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studyMaterialAPI.getSubjects();
      if (response.data && response.data.success) {
        setSubjects(response.data.subjects || []);
        setAllPdfs(response.data.allPdfs || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to load study materials');
      }
    } catch (err) {
      console.error('[StudyMaterialHub] Error fetching materials:', err);
      setError(err.response?.data?.error || err.message || 'Unable to connect to study material server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Synchronize state with URL params
  useEffect(() => {
    if (subjects.length > 0) {
      if (subjectId) {
        const foundSubject = subjects.find(
          s => s.id.toLowerCase() === subjectId.toLowerCase() ||
               s.code.toLowerCase() === subjectId.toLowerCase()
        );
        setActiveSubject(foundSubject || null);

        if (fileId && foundSubject) {
          const foundPdf = foundSubject.files?.find(f => f.id === fileId);
          setActivePdf(foundPdf || null);
        } else {
          setActivePdf(null);
        }
      } else {
        setActiveSubject(null);
        setActivePdf(null);
      }
    }
  }, [subjectId, fileId, subjects]);

  // Navigation handlers
  const handleSelectSubject = (subject) => {
    setActiveSubject(subject);
    setActivePdf(null);
    navigate(`/student/study-material/${subject.id}`);
  };

  const handleBackToDashboard = () => {
    setActiveSubject(null);
    setActivePdf(null);
    navigate('/student/study-material');
  };

  const handleOpenPdf = (pdf) => {
    setActivePdf(pdf);
    if (activeSubject) {
      navigate(`/student/study-material/${activeSubject.id}/${pdf.id}`);
    }
  };

  const handleClosePdf = () => {
    setActivePdf(null);
    if (activeSubject) {
      navigate(`/student/study-material/${activeSubject.id}`);
    } else {
      navigate('/student/study-material');
    }
  };

  const handleDownloadPdf = (pdf) => {
    const downloadUrl = studyMaterialAPI.getPdfDownloadUrl(pdf.id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = pdf.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered subjects based on search query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase().trim();
    return subjects.filter(s => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchTopics = s.topics?.some(t => t.toLowerCase().includes(q));
      const matchFiles = s.files?.some(f => f.title.toLowerCase().includes(q) || f.filename.toLowerCase().includes(q));
      return matchName || matchCode || matchDesc || matchTopics || matchFiles;
    });
  }, [subjects, searchQuery]);

  // Filtered PDFs within active subject
  const filteredSubjectPdfs = useMemo(() => {
    if (!activeSubject) return [];
    const files = activeSubject.files || [];
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase().trim();
    return files.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q) ||
      f.filename.toLowerCase().includes(q)
    );
  }, [activeSubject, searchQuery]);

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
            onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Command Center
          </button>

          <ChevronRight size={14} color="#CBD5E1" />

          <button
            onClick={handleBackToDashboard}
            style={{
              background: 'none',
              border: 'none',
              color: activeSubject ? '#64748B' : '#0F172A',
              fontWeight: activeSubject ? 500 : 700,
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.color = activeSubject ? '#64748B' : '#0F172A'}
          >
            Study Material
          </button>

          {activeSubject && (
            <>
              <ChevronRight size={14} color="#CBD5E1" />
              <button
                onClick={() => { setActivePdf(null); navigate(`/student/study-material/${activeSubject.id}`); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activePdf ? '#64748B' : activeSubject.accentColor || '#2563EB',
                  fontWeight: activePdf ? 500 : 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px'
                }}
              >
                {activeSubject.shortName || activeSubject.code}
              </button>
            </>
          )}

          {activePdf && (
            <>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                {activePdf.title}
              </span>
            </>
          )}
        </nav>

        {/* ================= LOADING SKELETON ================= */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '3px solid #E2E8F0',
                borderTopColor: '#2563EB',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '16px'
              }}
            />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
              Scanning Study Materials...
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Discovering academic notes, verified subject PDFs, and interview references
            </p>
          </div>
        )}

        {/* ================= ERROR STATE ================= */}
        {error && !loading && (
          <div
            style={{
              padding: '32px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '16px',
              color: '#991B1B',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}
          >
            <AlertCircle size={28} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#991B1B' }}>
                Unable to Load Study Material Hub
              </h3>
              <p style={{ fontSize: '13.5px', color: '#7F1D1D', margin: '0 0 16px', lineHeight: 1.5 }}>
                {error}
              </p>
              <button
                onClick={fetchMaterials}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: INTEGRATED PDF READER ================= */}
        {!loading && !error && activePdf && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <button
                onClick={handleClosePdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#1E293B',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <ArrowLeft size={16} />
                <span>Back to {activeSubject?.shortName || 'Materials'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '4px 10px',
                    borderRadius: '20px'
                  }}
                >
                  ⚡ Active In-App Reader
                </span>
              </div>
            </div>

            <PdfReader
              pdfUrl={studyMaterialAPI.getPdfStreamUrl(activePdf.id)}
              downloadUrl={studyMaterialAPI.getPdfDownloadUrl(activePdf.id)}
              title={activePdf.title}
              subjectName={activeSubject?.name || 'Study Material'}
              onClose={handleClosePdf}
            />
          </div>
        )}

        {/* ================= VIEW 2: SUBJECT-WISE MATERIAL EXPLORER ================= */}
        {!loading && !error && activeSubject && !activePdf && (
          <div>
            {/* Subject Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                borderRadius: '18px',
                padding: '32px',
                marginBottom: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: activeSubject.bgGlow || 'rgba(56, 189, 248, 0.15)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <button
                    onClick={handleBackToDashboard}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <ArrowLeft size={16} /> All Subjects
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38BDF8',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      {activeSubject.pdfCount} {activeSubject.pdfCount === 1 ? 'Available Material' : 'Available Materials'}
                    </span>
                  </div>
                </div>

                <div style={{ maxWidth: '800px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: activeSubject.accentColor || '#38BDF8',
                        color: '#FFFFFF'
                      }}
                    >
                      {activeSubject.code}
                    </span>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                      {activeSubject.name}
                    </h1>
                  </div>
                  <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.6 }}>
                    {activeSubject.description}
                  </p>

                  {/* Highlights */}
                  {activeSubject.topics && activeSubject.topics.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeSubject.topics.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#E2E8F0'
                          }}
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PDFs Search / Filter within this subject */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Curated PDF Materials
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                  Click "Open PDF" to launch the integrated reader with text search and fullscreen mode.
                </p>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* PDFs Grid */}
            {filteredSubjectPdfs.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '20px'
                }}
              >
                {filteredSubjectPdfs.map(pdf => (
                  <PdfCard
                    key={pdf.id}
                    pdf={pdf}
                    subject={activeSubject}
                    onOpenPdf={handleOpenPdf}
                    onDownloadPdf={handleDownloadPdf}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '48px 24px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <FileText size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                  No materials match your query
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>
                  {searchQuery ? `No PDF titles or notes match "${searchQuery}".` : 'No study materials currently loaded for this subject.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 1: SUBJECT SELECTION DASHBOARD ================= */}
        {!loading && !error && !activeSubject && (
          <div>
            {/* HERO / WELCOME BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '36px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.45)'
              }}
            >
              {/* Decorative background glow circles */}
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
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '30%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.12)',
                  filter: 'blur(50px)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                  <Sparkles size={14} />
                  <span>AI Placement Preparation Platform • Study Material Hub</span>
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.7px', lineHeight: 1.25 }}>
                  Master Core Computer Science Concepts
                </h1>

                <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '720px', margin: '0 0 28px', lineHeight: 1.6 }}>
                  Access curated, verified study materials and comprehensive PDF guides for the six foundational placement subjects. Read PDFs directly with our high-speed integrated reader, search in-document topics, and accelerate your technical interview readiness.
                </p>

                {/* STATS STRIP */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    maxWidth: '850px'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                      <Library size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>{subjects.length}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Core Subjects</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>{stats.totalPdfs || allPdfs.length}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Verified PDF Documents</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>100%</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Placement Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH AND CONTROLS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  Core Placement Subjects
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '3px 0 0' }}>
                  Select any subject card below to view and read its study material documents.
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <Search size={17} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search subjects, topics (e.g. OOPS, SQL, Trees)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 40px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                />
              </div>
            </div>

            {/* SUBJECT CARDS GRID */}
            {filteredSubjects.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                  gap: '24px'
                }}
              >
                {filteredSubjects.map(subject => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onExplore={handleSelectSubject}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '60px 24px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <BookOpen size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                  No subjects found matching "{searchQuery}"
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px' }}>
                  Try searching for a different keyword like "DSA", "DBMS", "Operating Systems", or "Architecture".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
