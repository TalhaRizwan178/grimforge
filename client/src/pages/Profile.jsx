import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NovelCard from '../components/NovelCard';
import LoadingForge from '../components/LoadingForge';

const THEMES = [
  { id: 'midnight', name: 'Midnight', bg: '#0a0a0f', text: '#ede5d4', accent: '#b82222' },
  { id: 'parchment', name: 'Parchment', bg: '#f5edd8', text: '#2a1a0c', accent: '#8b2020' },
  { id: 'daylight', name: 'Daylight', bg: '#f4f6f8', text: '#1a1e2e', accent: '#c0392b' },
  { id: 'abyss', name: 'Abyss', bg: '#020b18', text: '#c8e0f8', accent: '#1a78c2' },
  { id: 'verdant', name: 'Verdant', bg: '#040c06', text: '#c0e8c0', accent: '#2d8048' },
  { id: 'twilight', name: 'Twilight', bg: '#080510', text: '#e8d8f8', accent: '#8b30c8' },
];

const FONTS = [
  { id: 'crimson',       label: 'Crimson Text',  style: "'Crimson Text', serif" },
  { id: 'garamond',      label: 'EB Garamond',   style: "'EB Garamond', serif" },
  { id: 'merriweather',  label: 'Merriweather',  style: "'Merriweather', serif" },
  { id: 'source-serif',  label: 'Source Serif',  style: "'Source Serif 4', serif" },
  { id: 'georgia',       label: 'Georgia',        style: 'Georgia, serif' },
  { id: 'lato',          label: 'Lato',           style: "'Lato', sans-serif" },
  { id: 'dancing',       label: 'Dancing Script', style: "'Dancing Script', cursive" },
];

const LINE_HEIGHTS = [
  { id: 'compact', label: 'Compact' },
  { id: 'normal', label: 'Normal' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'spacious', label: 'Spacious' },
];

const WIDTHS = [
  { id: 'narrow', label: 'Narrow' },
  { id: 'standard', label: 'Standard' },
  { id: 'wide', label: 'Wide' },
  { id: 'full', label: 'Full' },
];

export default function Profile() {
  const { user } = useAuth();
  const { theme, setTheme, reading, updateReading, incrementFontSize, decrementFontSize } = useTheme();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraryCount, setLibraryCount] = useState(0);
  const [activeTab, setActiveTab] = useState('novels'); // 'novels' | 'preferences'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [novelsRes, libRes] = await Promise.all([
          api.get('/novels?limit=50'),
          api.get('/novels/user/library'),
        ]);
        setNovels(novelsRes.data.filter(n => n.creator_id === user?.id));
        setLibraryCount(libRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const sampleText = 'The raven perched on the iron gate, its eyes like two drops of midnight.';

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--gf-bg)', padding: '2.5rem 1rem' }}>
      <div className="container-xl">
        <div className="row g-4">

          {/* ── Sidebar ── */}
          <div className="col-12 col-lg-3">
            <div className="gf-card mb-3" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div className="profile-avatar mx-auto mb-3">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <h2 className="font-display" style={{ fontSize: '1rem', letterSpacing: '0.12em', color: 'var(--gf-text)', marginBottom: '0.25rem' }}>
                {user?.username}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--gf-muted)', marginBottom: '1.25rem' }}>
                {user?.email}
              </p>
              <div className="d-flex justify-content-center gap-4" style={{ borderTop: '1px solid var(--gf-border)', paddingTop: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: 'var(--gf-accent)', fontWeight: 700 }}>{novels.length}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: 'var(--gf-faint)', textTransform: 'uppercase' }}>Forged</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: 'var(--gf-gold)', fontWeight: 700 }}>{libraryCount}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: 'var(--gf-faint)', textTransform: 'uppercase' }}>Reading</div>
                </div>
              </div>
            </div>

            <div className="gf-card" style={{ padding: '0.5rem 0' }}>
              {[
                { id: 'novels', icon: 'bi-journal-richtext', label: 'My Novels' },
                { id: 'preferences', icon: 'bi-sliders', label: 'Preferences' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'transparent',
                    border: 'none', borderLeft: activeTab === tab.id ? '3px solid var(--gf-accent)' : '3px solid transparent',
                    padding: '0.75rem 1.1rem', cursor: 'pointer', transition: 'all 0.15s',
                    color: activeTab === tab.id ? 'var(--gf-text)' : 'var(--gf-muted)',
                    fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                  }}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main ── */}
          <div className="col-12 col-lg-9">

            {/* Novels tab */}
            {activeTab === 'novels' && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <h2 className="font-display mb-0" style={{ fontSize: '0.8rem', letterSpacing: '0.25em', color: 'var(--gf-muted)', textTransform: 'uppercase' }}>
                    Your Forged Novels
                  </h2>
                  <Link to="/create" className="btn-gf-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.65rem' }}>
                    <i className="bi bi-hammer me-1"></i>New Novel
                  </Link>
                </div>
                {loading ? (
                  <LoadingForge />
                ) : novels.length === 0 ? (
                  <div className="gf-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <i className="bi bi-journal-plus" style={{ fontSize: '3rem', color: 'var(--gf-faint)', display: 'block', marginBottom: '1rem' }}></i>
                    <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      You haven't forged any novels yet.
                    </p>
                    <Link to="/create" className="btn-gf-primary d-inline-block">
                      <i className="bi bi-hammer me-2"></i>Forge Your First Tale
                    </Link>
                  </div>
                ) : (
                  <div className="row g-4 fade-in">
                    {novels.map(novel => (
                      <div key={novel.id} className="col-12 col-sm-6 col-xl-4">
                        <NovelCard novel={novel} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Preferences tab */}
            {activeTab === 'preferences' && (
              <div className="fade-in">
                <h2 className="font-display mb-4" style={{ fontSize: '0.8rem', letterSpacing: '0.25em', color: 'var(--gf-muted)', textTransform: 'uppercase' }}>
                  Reading Preferences
                </h2>

                {/* Live preview */}
                <div
                  className="gf-card mb-4"
                  style={{
                    padding: '1.5rem 2rem',
                    fontFamily: FONTS.find(f => f.id === reading.fontFamily)?.style || 'inherit',
                    fontSize: reading.fontSize + 'px',
                    lineHeight: { compact: 1.55, normal: 1.8, relaxed: 2.05, spacious: 2.3 }[reading.lineHeight] || 1.8,
                    textAlign: reading.alignment,
                    color: 'var(--gf-reader-text)',
                    background: 'var(--gf-reader-bg)',
                    borderLeft: '3px solid var(--gf-accent)',
                  }}
                >
                  <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'var(--gf-muted)', marginBottom: '0.75rem' }}>
                    LIVE PREVIEW
                  </div>
                  {sampleText}
                </div>

                {/* ── Theme ── */}
                <div className="gf-card mb-3" style={{ padding: '1.5rem' }}>
                  <p className="gf-section-title">App Theme</p>
                  <div className="row g-2">
                    {THEMES.map(t => (
                      <div key={t.id} className="col-4 col-sm-2">
                        <div
                          onClick={() => setTheme(t.id)}
                          style={{
                            background: t.bg, color: t.text,
                            border: `2px solid ${theme === t.id ? t.accent : 'transparent'}`,
                            boxShadow: theme === t.id ? `0 0 0 1px ${t.accent}` : 'none',
                            padding: '0.6rem 0.3rem', textAlign: 'center',
                            cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2,
                            fontSize: '0.58rem', fontFamily: 'Cinzel, serif',
                          }}
                        >
                          {t.name}
                          {theme === t.id && (
                            <i className="bi bi-check-circle-fill d-block mt-1" style={{ color: t.accent, fontSize: '0.65rem' }}></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Font Family ── */}
                <div className="gf-card mb-3" style={{ padding: '1.5rem' }}>
                  <p className="gf-section-title">Reading Font</p>
                  <div className="row g-2">
                    {FONTS.map(f => (
                      <div key={f.id} className="col-12 col-sm-6">
                        <button
                          onClick={() => updateReading({ fontFamily: f.id })}
                          style={{
                            width: '100%', textAlign: 'left', background: reading.fontFamily === f.id ? 'var(--gf-bg4)' : 'var(--gf-bg3)',
                            border: `1px solid ${reading.fontFamily === f.id ? 'var(--gf-accent)' : 'var(--gf-border)'}`,
                            padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.2s',
                            fontFamily: f.style, fontSize: '1rem', color: 'var(--gf-text)',
                          }}
                        >
                          The quick brown fox
                          <span style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'var(--gf-muted)', marginTop: '2px' }}>
                            {f.label}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Font Size ── */}
                <div className="gf-card mb-3" style={{ padding: '1.5rem' }}>
                  <p className="gf-section-title">Text Size — {reading.fontSize}px</p>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <button className="btn-gf-icon" onClick={decrementFontSize} disabled={reading.fontSize <= 14} style={{ fontSize: '1.1rem' }}>
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <input
                      type="range"
                      min={14} max={28} step={1}
                      value={reading.fontSize}
                      onChange={e => updateReading({ fontSize: parseInt(e.target.value) })}
                      style={{ flex: 1, accentColor: 'var(--gf-accent)' }}
                    />
                    <button className="btn-gf-icon" onClick={incrementFontSize} disabled={reading.fontSize >= 28} style={{ fontSize: '1.1rem' }}>
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {[14, 16, 18, 19, 21, 24, 28].map(size => (
                      <button
                        key={size}
                        onClick={() => updateReading({ fontSize: size })}
                        className="option-pill"
                        style={{ flex: 'none', padding: '0.35rem 0.75rem', minWidth: 44,
                          background: reading.fontSize === size ? 'var(--gf-accent)' : 'var(--gf-bg3)',
                          borderColor: reading.fontSize === size ? 'var(--gf-accent)' : 'var(--gf-border)',
                          color: reading.fontSize === size ? '#fff' : 'var(--gf-muted)',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Line Height ── */}
                <div className="gf-card mb-3" style={{ padding: '1.5rem' }}>
                  <p className="gf-section-title">Line Spacing</p>
                  <div className="d-flex gap-2 flex-wrap">
                    {LINE_HEIGHTS.map(lh => (
                      <button
                        key={lh.id}
                        onClick={() => updateReading({ lineHeight: lh.id })}
                        className="option-pill"
                        style={{
                          flex: 1, minWidth: 80, padding: '0.5rem 0',
                          background: reading.lineHeight === lh.id ? 'var(--gf-accent)' : 'var(--gf-bg3)',
                          borderColor: reading.lineHeight === lh.id ? 'var(--gf-accent)' : 'var(--gf-border)',
                          color: reading.lineHeight === lh.id ? '#fff' : 'var(--gf-muted)',
                        }}
                      >
                        {lh.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Width & Alignment ── */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-7">
                    <div className="gf-card" style={{ padding: '1.5rem' }}>
                      <p className="gf-section-title">Reading Width</p>
                      <div className="d-flex gap-2 flex-wrap">
                        {WIDTHS.map(w => (
                          <button
                            key={w.id}
                            onClick={() => updateReading({ width: w.id })}
                            className="option-pill"
                            style={{
                              flex: 1, minWidth: 60, padding: '0.5rem 0',
                              background: reading.width === w.id ? 'var(--gf-accent)' : 'var(--gf-bg3)',
                              borderColor: reading.width === w.id ? 'var(--gf-accent)' : 'var(--gf-border)',
                              color: reading.width === w.id ? '#fff' : 'var(--gf-muted)',
                            }}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-5">
                    <div className="gf-card" style={{ padding: '1.5rem' }}>
                      <p className="gf-section-title">Alignment</p>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => updateReading({ alignment: 'left' })}
                          className="option-pill"
                          style={{
                            flex: 1, padding: '0.5rem 0',
                            background: reading.alignment === 'left' ? 'var(--gf-accent)' : 'var(--gf-bg3)',
                            borderColor: reading.alignment === 'left' ? 'var(--gf-accent)' : 'var(--gf-border)',
                            color: reading.alignment === 'left' ? '#fff' : 'var(--gf-muted)',
                          }}
                        >
                          <i className="bi bi-text-left d-block mb-1"></i>Left
                        </button>
                        <button
                          onClick={() => updateReading({ alignment: 'justify' })}
                          className="option-pill"
                          style={{
                            flex: 1, padding: '0.5rem 0',
                            background: reading.alignment === 'justify' ? 'var(--gf-accent)' : 'var(--gf-bg3)',
                            borderColor: reading.alignment === 'justify' ? 'var(--gf-accent)' : 'var(--gf-border)',
                            color: reading.alignment === 'justify' ? '#fff' : 'var(--gf-muted)',
                          }}
                        >
                          <i className="bi bi-justify d-block mb-1"></i>Justify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--gf-faint)', textAlign: 'center' }}>
                  <i className="bi bi-check-circle me-1"></i>
                  All preferences save automatically and apply instantly.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
