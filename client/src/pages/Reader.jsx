import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import LoadingForge from '../components/LoadingForge';
import ReaderSettings from '../components/ReaderSettings';
import ChapterForgeModal from '../components/ChapterForgeModal';

const FONT_CLASS_MAP = {
  crimson:       'rf-crimson',
  garamond:      'rf-garamond',
  merriweather:  'rf-merriweather',
  'source-serif':'rf-source-serif',
  georgia:       'rf-georgia',
  lato:          'rf-lato',
  dancing:       'rf-dancing',
};

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reading } = useTheme();

  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const [barsVisible, setBarsVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimer = useRef(null);

  // ── Load data ──
  useEffect(() => {
    const load = async () => {
      try {
        const [novelRes, progressRes] = await Promise.all([
          api.get(`/novels/${id}`),
          api.get(`/novels/${id}/my-progress`),
        ]);
        setNovel(novelRes.data);
        const { chapters: mine } = progressRes.data;
        const ch1 = novelRes.data.chapter1;
        let allChapters;
        if (mine.length === 0 || mine[0].chapter_number !== 1) {
          allChapters = ch1 ? [ch1, ...mine] : mine;
        } else {
          allChapters = mine;
        }
        setChapters(allChapters);
        setCurrentIdx(Math.max(0, allChapters.length - 1));
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Scroll tracking ──
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowScrollTop(scrolled > 400);

      const diff = scrolled - lastScrollY.current;
      if (Math.abs(diff) > 8) {
        setBarsVisible(diff < 0 || scrolled < 80);
        lastScrollY.current = scrolled;
      }
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setBarsVisible(true), 2000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(scrollTimer.current); };
  }, []);

  // ── Keyboard navigation ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && currentIdx > 0) goToChapter(currentIdx - 1);
      else if (e.key === 'ArrowRight' && currentIdx < chapters.length - 1) goToChapter(currentIdx + 1);
      else if (e.key === 's' || e.key === 'S') setShowSettings(p => !p);
      else if (e.key === 'c' || e.key === 'C') setSidebarOpen(p => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIdx, chapters.length]);

  const goToChapter = useCallback((idx) => {
    setCurrentIdx(idx);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGenerate = async (userDirection) => {
    setGenerating(true);
    setGenError('');
    try {
      const res = await api.post(`/novels/${id}/chapters`, { userDirection });
      setChapters(prev => [...prev, res.data]);
      setCurrentIdx(prev => prev + 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err) {
      setGenError(err.response?.data?.error || 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingForge message="Opening your grimoire..." fullPage />;
  if (!novel || !chapters.length) return null;

  const chapter = chapters[currentIdx];
  const isLastChapter = currentIdx === chapters.length - 1;
  const wordCount = chapter?.content?.split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  const readerClasses = [
    'grimforge-reader',
    FONT_CLASS_MAP[reading.fontFamily] || 'rf-crimson',
    `rw-${reading.width}`,
    `rl-${reading.lineHeight}`,
    `ra-${reading.alignment}`,
  ].join(' ');

  return (
    <div className={readerClasses} style={{ position: 'relative' }}>
      {/* Progress bar */}
      <div className="reading-progress-bar" style={{ width: `${readProgress}%` }} />

      {/* ── Chapter Sidebar ── */}
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1045, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          width: 280,
          background: 'var(--gf-bg2)',
          borderRight: '1px solid var(--gf-border)',
          zIndex: 1050,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid var(--gf-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gf-muted)', textTransform: 'uppercase' }}>
              Chapters
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: 'var(--gf-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
              {novel.title}
            </div>
          </div>
          <button className="btn-gf-icon" onClick={() => setSidebarOpen(false)} style={{ border: 'none', flexShrink: 0 }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Chapter list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
          {chapters.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => goToChapter(i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1.1rem',
                background: currentIdx === i ? 'rgba(184,34,34,0.12)' : 'transparent',
                border: 'none',
                borderLeft: currentIdx === i ? '3px solid var(--gf-accent)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: currentIdx === i ? 'var(--gf-text)' : 'var(--gf-muted)',
              }}
              onMouseEnter={e => { if (currentIdx !== i) e.currentTarget.style.background = 'var(--gf-bg3)'; }}
              onMouseLeave={e => { if (currentIdx !== i) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.15em', color: currentIdx === i ? 'var(--gf-accent)' : 'var(--gf-faint)', marginBottom: '0.2rem' }}>
                Chapter {ch.chapter_number}
                {ch.chapter_number > 1 && (
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.55rem' }}>
                    <i className="bi bi-lock-fill"></i>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ch.content ? ch.content.replace(/\n/g, ' ').slice(0, 55) + '...' : `Chapter ${ch.chapter_number}`}
              </div>
            </button>
          ))}

          {/* Generate next placeholder */}
          {isLastChapter && (
            <button
              onClick={() => { setSidebarOpen(false); setShowForgeModal(true); }}
              style={{
                width: '100%', textAlign: 'left', padding: '0.75rem 1.1rem',
                background: 'transparent', border: 'none', borderLeft: '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gf-bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--gf-accent)' }}>
                <i className="bi bi-hammer me-1"></i>
                Forge Chapter {chapters.length + 1}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gf-faint)', marginTop: '0.2rem' }}>
                Generate your next chapter
              </div>
            </button>
          )}
        </div>

        {/* Sidebar footer */}
        <div style={{ padding: '0.75rem 1.1rem', borderTop: '1px solid var(--gf-border)', fontSize: '0.7rem', color: 'var(--gf-faint)' }}>
          <i className="bi bi-keyboard me-1"></i>
          Press <span style={{ fontFamily: 'monospace', background: 'var(--gf-bg4)', padding: '0 4px', borderRadius: 2 }}>C</span> to toggle
        </div>
      </div>

      {/* ── Top bar ── */}
      <div className={`reader-topbar ${barsVisible ? '' : 'hidden'}`}>
        {/* Sidebar toggle */}
        <button
          className="btn-gf-icon"
          onClick={() => setSidebarOpen(p => !p)}
          title="Chapter list (C)"
          style={{ border: 'none', fontSize: '1rem', width: 34, height: 34 }}
        >
          <i className="bi bi-list"></i>
        </button>

        <Link
          to={`/novels/${id}`}
          className="btn-gf-icon d-none d-sm-flex"
          style={{ border: 'none', fontSize: '1rem', width: 34, height: 34 }}
          title="Back to novel"
        >
          <i className="bi bi-arrow-left"></i>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display tracking-wider" style={{ fontSize: '0.65rem', color: 'var(--gf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {novel.title}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--gf-muted)' }}>
            Ch. {chapter?.chapter_number} · {readTime} min · {wordCount.toLocaleString()} words
          </div>
        </div>

        {/* Chapter pills (max 6 on desktop) */}
        <div className="d-none d-md-flex gap-1 flex-shrink-0">
          {chapters.slice(0, 6).map((_, i) => (
            <button key={i} className={`chapter-pill ${currentIdx === i ? 'active' : ''}`} onClick={() => goToChapter(i)}>
              {i + 1}
            </button>
          ))}
          {chapters.length > 6 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--gf-muted)', alignSelf: 'center', paddingLeft: 4 }}>
              +{chapters.length - 6}
            </span>
          )}
        </div>

        <button
          className="btn-gf-icon"
          onClick={() => setShowSettings(p => !p)}
          title="Reading settings (S)"
          style={{ border: 'none', fontSize: '1rem', width: 34, height: 34 }}
        >
          <i className="bi bi-sliders"></i>
        </button>
      </div>

      {/* ── Reading Area ── */}
      <div className="reading-area" style={{ paddingTop: '5.5rem' }}>
        {/* Chapter header */}
        <div className="chapter-header">
          <p className="chapter-number">{novel.genre} &nbsp;·&nbsp; {novel.tone}</p>
          <h1 className="chapter-title-display">{novel.title}</h1>
          <p className="chapter-number" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>
            Chapter {chapter?.chapter_number}
            {chapter?.chapter_number > 1 && (
              <span style={{ color: 'var(--gf-accent)', marginLeft: '0.5rem' }}>· Your branch</span>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="chapter-content" style={{ '--reader-font-size': `${reading.fontSize}px` }}>
          {chapter?.content?.split('\n\n').map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        <div className="chapter-end-ornament">— ✦ —</div>

        {/* End of chapter */}
        {isLastChapter ? (
          <div className="forge-cta">
            <i className="bi bi-fire forge-cta-icon"></i>
            <h3 className="font-display" style={{ fontSize: '1.1rem', letterSpacing: '0.15em', color: 'var(--gf-text)', marginBottom: '0.5rem' }}>
              THE CHAPTER ENDS HERE
            </h3>
            <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 2rem' }}>
              The story is hungry for more. How shall it continue?
            </p>

            {genError && (
              <div className="gf-alert-error mb-3" style={{ maxWidth: 380, margin: '0 auto 1.5rem' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>{genError}
              </div>
            )}

            {generating ? (
              <div>
                <LoadingForge message={`Forging Chapter ${chapters.length + 1}...`} />
                <p style={{ color: 'var(--gf-faint)', fontSize: '0.78rem', marginTop: '0.75rem', textAlign: 'center' }}>
                  15-40 seconds — the AI is writing your chapter with full story continuity.
                </p>
              </div>
            ) : (
              <>
                <button
                  className="btn-gf-primary"
                  onClick={() => setShowForgeModal(true)}
                  style={{ padding: '1rem 2.5rem', fontSize: '0.75rem', letterSpacing: '0.22em' }}
                >
                  <i className="bi bi-hammer me-2"></i>
                  Forge Chapter {chapters.length + 1}
                </button>
                <p style={{ color: 'var(--gf-faint)', fontSize: '0.72rem', marginTop: '1.25rem', textAlign: 'center' }}>
                  <i className="bi bi-lock me-1"></i>
                  Your chapters are private. Other readers forge their own path.
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-gf-secondary" onClick={() => goToChapter(currentIdx + 1)} style={{ padding: '0.85rem 2rem' }}>
              Chapter {currentIdx + 2} &nbsp;<i className="bi bi-arrow-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className={`reader-bottombar ${barsVisible ? '' : 'hidden'}`}>
        <button className="btn-gf-ghost" disabled={currentIdx === 0} onClick={() => goToChapter(currentIdx - 1)} style={{ fontSize: '0.8rem' }}>
          <i className="bi bi-chevron-left me-1"></i>
          <span className="d-none d-sm-inline">Previous</span>
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="font-display tracking-widest" style={{ fontSize: '0.6rem', color: 'var(--gf-muted)' }}>
            {currentIdx + 1} / {chapters.length} chapters
          </div>
          <div style={{ height: 2, background: 'var(--gf-border)', marginTop: '0.3rem', borderRadius: 1, maxWidth: 120, margin: '0.3rem auto 0' }}>
            <div style={{ height: '100%', background: 'var(--gf-accent)', width: `${((currentIdx + 1) / Math.max(chapters.length, 1)) * 100}%`, borderRadius: 1, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {!isLastChapter ? (
          <button className="btn-gf-ghost" onClick={() => goToChapter(currentIdx + 1)} style={{ fontSize: '0.8rem' }}>
            <span className="d-none d-sm-inline">Next</span>
            <i className="bi bi-chevron-right ms-1"></i>
          </button>
        ) : (
          <button
            className="btn-gf-primary"
            onClick={() => setShowForgeModal(true)}
            disabled={generating}
            style={{ padding: '0.5rem 1rem', fontSize: '0.65rem' }}
          >
            {generating
              ? <span className="spinner-border spinner-border-sm"></span>
              : <><i className="bi bi-hammer me-1"></i>Forge</>
            }
          </button>
        )}
      </div>

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '5rem', right: '1.5rem',
            background: 'var(--gf-bg3)', border: '1px solid var(--gf-border)',
            color: 'var(--gf-muted)', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', zIndex: 1030,
          }}
          title="Scroll to top"
        >
          <i className="bi bi-chevron-up"></i>
        </button>
      )}

      {/* Reader Settings Panel */}
      <ReaderSettings open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Forge Modal */}
      {showForgeModal && (
        <ChapterForgeModal
          novelId={id}
          nextChapterNum={chapters.length + 1}
          onGenerate={handleGenerate}
          onClose={() => setShowForgeModal(false)}
        />
      )}
    </div>
  );
}
