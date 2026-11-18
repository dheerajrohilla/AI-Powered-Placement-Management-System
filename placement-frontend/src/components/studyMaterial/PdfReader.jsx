import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Search,
  X,
  RotateCw,
  Maximize,
  ArrowLeft,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Configure PDF.js worker using Vite asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfReader({
  pdfUrl,
  downloadUrl,
  title = 'Study Document',
  subjectName = 'Study Material',
  onClose
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // [{ page: number, snippet: string }]
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const textCacheRef = useRef(new Map());

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load the PDF Document from stream URL
  const loadDocument = useCallback(async () => {
    if (!pdfUrl) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingProgress(10);
    textCacheRef.current.clear();
    setSearchResults([]);
    setCurrentMatchIndex(-1);

    try {
      // Pass token in headers if available in localStorage
      const token = localStorage.getItem('token');
      const httpHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        httpHeaders,
        withCredentials: false
      });

      loadingTask.onProgress = (progressData) => {
        if (progressData.total > 0) {
          const percent = Math.min(95, Math.round((progressData.loaded / progressData.total) * 100));
          setLoadingProgress(percent);
        }
      };

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setJumpPageInput('1');
      setLoadingProgress(100);
      setIsLoading(false);
    } catch (err) {
      console.error('[PdfReader] Document loading error:', err);
      setIsLoading(false);
      setErrorMessage(
        err.message?.includes('403') || err.message?.includes('401')
          ? 'Session expired or not authorized. Please log in again.'
          : 'Unable to stream or open this PDF document. Please verify your connection or try downloading the file directly.'
      );
    }
  }, [pdfUrl]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Render current page onto canvas with high-DPI crispness
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      // Cancel ongoing render if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.save();
      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      context.restore();
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('[PdfReader] Page rendering error:', err);
      }
    }
  }, [pdfDoc, scale, rotation]);

  useEffect(() => {
    if (pdfDoc && totalPages > 0) {
      renderPage(currentPage);
      setJumpPageInput(String(currentPage));
    }
  }, [pdfDoc, currentPage, scale, rotation, renderPage, totalPages]);

  // Page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleJumpPage = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(3.0, parseFloat((prev + 0.2).toFixed(2))));
  const zoomOut = () => setScale(prev => Math.max(0.5, parseFloat((prev - 0.2).toFixed(2))));
  const resetZoom = () => setScale(1.0);

  const fitToWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage).then(page => {
      const defaultViewport = page.getViewport({ scale: 1.0, rotation });
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      if (containerWidth > 200 && defaultViewport.width > 0) {
        const calculated = parseFloat((containerWidth / defaultViewport.width).toFixed(2));
        setScale(Math.max(0.6, Math.min(2.5, calculated)));
      }
    });
  };

  // Rotation
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      } else if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, showSearch]);

  // Focus search input when toggled
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // In-document text search implementation
  const performSearch = async (term) => {
    if (!pdfDoc || !term || term.trim().length === 0) {
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return;
    }

    setIsSearching(true);
    const cleanTerm = term.trim().toLowerCase();
    const results = [];

    try {
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        let textContent = textCacheRef.current.get(pageNum);
        if (!textContent) {
          const page = await pdfDoc.getPage(pageNum);
          const content = await page.getTextContent();
          textContent = content.items.map(i => i.str).join(' ');
          textCacheRef.current.set(pageNum, textContent);
        }

        const lowerText = textContent.toLowerCase();
        let matchPos = lowerText.indexOf(cleanTerm);
        while (matchPos !== -1) {
          const start = Math.max(0, matchPos - 30);
          const end = Math.min(textContent.length, matchPos + cleanTerm.length + 30);
          const snippet = textContent.substring(start, end).replace(/\s+/g, ' ');

          results.push({
            page: pageNum,
            snippet: (start > 0 ? '...' : '') + snippet + (end < textContent.length ? '...' : '')
          });

          matchPos = lowerText.indexOf(cleanTerm, matchPos + cleanTerm.length);
        }
      }

      setSearchResults(results);
      if (results.length > 0) {
        setCurrentMatchIndex(0);
        setCurrentPage(results[0].page);
      } else {
        setCurrentMatchIndex(-1);
      }
    } catch (err) {
      console.error('[PdfReader] Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const nextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    setCurrentPage(searchResults[nextIdx].page);
  };

  const prevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    setCurrentPage(searchResults[prevIdx].page);
  };

  return (
    <div
      ref={containerRef}
      className={`pdf-reader-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : '82vh',
        background: '#0B0F19',
        color: '#F8FAFC',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        position: 'relative'
      }}
    >
      {/* ================= HEADER / TOOLBAR ================= */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10
        }}
      >
        {/* Left: Document Info & Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
          {onClose && (
            <button
              onClick={onClose}
              title="Return to Subject Materials"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                {subjectName}
              </span>
            </div>
            <h2
              title={title}
              style={{
                fontSize: '14px',
                fontWeight: 700,
                margin: '3px 0 0',
                color: '#F8FAFC',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '280px'
              }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Center: Pagination Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '4px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading}
            title="Previous Page (Left Arrow)"
            style={{
              background: 'none',
              border: 'none',
              color: currentPage <= 1 ? '#475569' : '#E2E8F0',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <form onSubmit={handleJumpPage} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onBlur={handleJumpPage}
              style={{
                width: '44px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#38BDF8',
                borderRadius: '6px',
                padding: '4px 2px',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>of {totalPages || 1}</span>
          </form>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            title="Next Page (Right Arrow)"
            style={{
              background: 'none',
              border: 'none',
              color: currentPage >= totalPages ? '#475569' : '#E2E8F0',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right: Zoom, Search, Rotation, Fullscreen & Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Zoom In / Out / Percent */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '8px',
              padding: '2px 4px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              title="Zoom Out (-)"
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={resetZoom}
              title="Reset Zoom to 100%"
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 6px',
                cursor: 'pointer'
              }}
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              title="Zoom In (+)"
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Fit to Width */}
          <button
            onClick={fitToWidth}
            title="Fit to Width"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#CBD5E1',
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Maximize size={14} />
            <span className="hide-on-mobile">Fit Width</span>
          </button>

          {/* Rotate */}
          <button
            onClick={rotateClockwise}
            title="Rotate Clockwise 90°"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#CBD5E1',
              padding: '7px 9px',
              cursor: 'pointer'
            }}
          >
            <RotateCw size={15} />
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(prev => !prev)}
            title="Search Text in PDF (Ctrl + F)"
            style={{
              background: showSearch ? '#2563EB' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: showSearch ? '#FFFFFF' : '#CBD5E1',
              padding: '7px 9px',
              cursor: 'pointer'
            }}
          >
            <Search size={15} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Reading Mode'}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#CBD5E1',
              padding: '7px 9px',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Download */}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              title="Download PDF for Offline Study"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Download size={14} />
              <span className="hide-on-mobile">Download</span>
            </a>
          )}
        </div>
      </header>

      {/* ================= IN-DOCUMENT SEARCH BAR ================= */}
      {showSearch && (
        <div
          style={{
            background: '#1E293B',
            padding: '10px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            zIndex: 9
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search keywords or topics inside this PDF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '7px 32px 7px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setCurrentMatchIndex(-1); }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSearching ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSearching ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
              Find
            </button>
          </form>

          {/* Search Navigation & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {searchResults.length > 0 ? (
              <>
                <span style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                  Match {currentMatchIndex + 1} of {searchResults.length}
                </span>

                <button
                  type="button"
                  onClick={prevMatch}
                  title="Previous Match"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E2E8F0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={nextMatch}
                  title="Next Match"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E2E8F0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : searchQuery && !isSearching ? (
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>No matches found in document</span>
            ) : null}

            <button
              type="button"
              onClick={() => setShowSearch(false)}
              title="Close Search"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= PDF VIEWPORT AREA ================= */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isLoading || errorMessage ? 'center' : 'flex-start',
          padding: '24px 16px',
          background: '#090D16',
          position: 'relative'
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '32px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38BDF8',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F5F9', margin: '0 0 6px' }}>
                Streaming Secure Placement Document...
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Loading pages with HTTP byte-range acceleration ({loadingProgress}%)
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div
            style={{
              maxWidth: '480px',
              textAlign: 'center',
              padding: '32px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '16px',
              color: '#F87171'
            }}
          >
            <AlertCircle size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#FCA5A5' }}>
              Document Render Notice
            </h3>
            <p style={{ fontSize: '13px', color: '#E2E8F0', marginBottom: '20px', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={loadDocument}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Retry
              </button>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#F1F5F9',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontWeight: 600,
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Download File
                </a>
              )}
            </div>
          </div>
        )}

        {/* High-Resolution Document Canvas */}
        <div
          style={{
            display: isLoading || errorMessage ? 'none' : 'block',
            margin: '0 auto',
            transition: 'transform 0.15s ease',
            filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.8))'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              background: '#FFFFFF',
              borderRadius: '6px'
            }}
          />
        </div>
      </main>

      {/* ================= FOOTER STATUS BAR ================= */}
      <footer
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94A3B8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} color="#38BDF8" />
          <span>CampusAI Verified Study Material • Confidential Campus Edition</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <span className="hide-on-mobile">•</span>
          <span className="hide-on-mobile">Use Arrow Keys (◀ / ▶) to navigate</span>
        </div>
      </footer>

      {/* Keyframe animation styling */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
