import { useTheme } from '../context/ThemeContext';

const THEMES = [
  { id: 'midnight',  name: 'Midnight',  bg: '#0a0a0f', text: '#ede5d4', accent: '#b82222', border: '#2e2e3a' },
  { id: 'parchment', name: 'Parchment', bg: '#f5edd8', text: '#2a1a0c', accent: '#8b2020', border: '#c4b490' },
  { id: 'daylight',  name: 'Daylight',  bg: '#f4f6f8', text: '#1a1e2e', accent: '#c0392b', border: '#d0d6de' },
  { id: 'abyss',     name: 'Abyss',     bg: '#020b18', text: '#c8e0f8', accent: '#1a78c2', border: '#162840' },
  { id: 'verdant',   name: 'Verdant',   bg: '#040c06', text: '#c0e8c0', accent: '#2d8048', border: '#1a3820' },
  { id: 'twilight',  name: 'Twilight',  bg: '#080510', text: '#e8d8f8', accent: '#8b30c8', border: '#2a1c50' },
];

const FONTS = [
  { id: 'crimson',       label: 'Crimson Text',  style: "'Crimson Text', serif",   desc: 'Classic literary' },
  { id: 'garamond',      label: 'EB Garamond',   style: "'EB Garamond', serif",    desc: 'Elegant & refined' },
  { id: 'merriweather',  label: 'Merriweather',  style: "'Merriweather', serif",   desc: 'Comfortable & clear' },
  { id: 'source-serif',  label: 'Source Serif',  style: "'Source Serif 4', serif", desc: 'Modern & readable' },
  { id: 'georgia',       label: 'Georgia',        style: 'Georgia, serif',          desc: 'Timeless classic' },
  { id: 'lato',          label: 'Lato',           style: "'Lato', sans-serif",      desc: 'Clean sans-serif' },
  { id: 'dancing',       label: 'Dancing Script', style: "'Dancing Script', cursive", desc: 'Flowing cursive' },
];

const LINE_HEIGHTS = [
  { id: 'compact',  label: 'Compact' },
  { id: 'normal',   label: 'Normal' },
  { id: 'relaxed',  label: 'Relaxed' },
  { id: 'spacious', label: 'Spacious' },
];

const WIDTHS = [
  { id: 'narrow',   label: 'Narrow',   icon: 'bi-text-center' },
  { id: 'standard', label: 'Standard', icon: 'bi-justify' },
  { id: 'wide',     label: 'Wide',     icon: 'bi-arrows-expand' },
  { id: 'full',     label: 'Full',     icon: 'bi-fullscreen' },
];

const sectionLabel = {
  fontFamily: 'Cinzel, serif',
  fontSize: '0.6rem',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'var(--gf-muted)',
  marginBottom: '0.7rem',
  paddingBottom: '0.35rem',
  borderBottom: '1px solid var(--gf-border)',
};

const pill = (active) => ({
  flex: 1,
  padding: '0.45rem 0',
  fontSize: '0.68rem',
  fontFamily: 'Cinzel, serif',
  letterSpacing: '0.04em',
  textAlign: 'center',
  background: active ? 'var(--gf-accent)' : 'var(--gf-bg3)',
  border: `1px solid ${active ? 'var(--gf-accent)' : 'var(--gf-border)'}`,
  color: active ? '#fff' : 'var(--gf-muted)',
  cursor: 'pointer',
  transition: 'all 0.15s',
});

export default function ReaderSettings({ open, onClose }) {
  const { theme, setTheme, reading, updateReading, incrementFontSize, decrementFontSize } = useTheme();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1045,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 320,
          background: 'var(--gf-bg2)',
          borderLeft: '1px solid var(--gf-border)',
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gf-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.22em', color: 'var(--gf-text)', textTransform: 'uppercase' }}>
              Reading Preferences
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gf-muted)', marginTop: '0.1rem' }}>
              Personalize your experience
            </div>
          </div>
          <button className="btn-gf-icon" onClick={onClose} style={{ border: 'none' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem' }}>

          {/* Theme */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Theme</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {THEMES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.name}
                  style={{
                    background: t.bg,
                    border: `2px solid ${theme === t.id ? t.accent : t.border}`,
                    boxShadow: theme === t.id ? `0 0 0 1px ${t.accent}, 0 0 10px ${t.accent}55` : 'none',
                    borderRadius: 4,
                    aspectRatio: '16/8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 3,
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '0.55rem', fontFamily: 'Cinzel, serif', color: t.text, letterSpacing: '0.05em' }}>
                    {t.name}
                  </span>
                  {theme === t.id && (
                    <i className="bi bi-check-circle-fill" style={{ position: 'absolute', top: 3, right: 4, fontSize: '0.55rem', color: t.accent }} />
                  )}
                </div>
              ))}
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Font */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Font</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => updateReading({ fontFamily: f.id })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    background: reading.fontFamily === f.id ? 'var(--gf-bg4)' : 'var(--gf-bg3)',
                    border: `1px solid ${reading.fontFamily === f.id ? 'var(--gf-accent)' : 'var(--gf-border)'}`,
                    color: reading.fontFamily === f.id ? 'var(--gf-text)' : 'var(--gf-text2)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: f.style,
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                >
                  The quick brown fox
                  <span style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.07em', color: 'var(--gf-muted)', marginTop: 2 }}>
                    {f.label} — {f.desc}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Font Size */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Text Size</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button
                className="btn-gf-icon"
                onClick={decrementFontSize}
                disabled={reading.fontSize <= 14}
                style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', width: 40, height: 40, flexShrink: 0 }}
              >
                A<sub style={{ fontSize: '0.5em' }}>-</sub>
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gf-text)' }}>{reading.fontSize}px</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--gf-muted)', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>SIZE</div>
              </div>
              <button
                className="btn-gf-icon"
                onClick={incrementFontSize}
                disabled={reading.fontSize >= 28}
                style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', width: 40, height: 40, flexShrink: 0 }}
              >
                A<sup style={{ fontSize: '0.5em' }}>+</sup>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[15, 17, 19, 21, 24].map(size => (
                <button key={size} onClick={() => updateReading({ fontSize: size })} style={pill(reading.fontSize === size)}>
                  {size}
                </button>
              ))}
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Line Spacing */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Line Spacing</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {LINE_HEIGHTS.map(lh => (
                <button key={lh.id} onClick={() => updateReading({ lineHeight: lh.id })} style={pill(reading.lineHeight === lh.id)}>
                  {lh.label}
                </button>
              ))}
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Reading Width */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Reading Width</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {WIDTHS.map(w => (
                <button key={w.id} onClick={() => updateReading({ width: w.id })} title={w.label} style={pill(reading.width === w.id)}>
                  <i className={`bi ${w.icon}`} style={{ display: 'block', marginBottom: 2, fontSize: '0.85rem' }}></i>
                  {w.label}
                </button>
              ))}
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Alignment */}
          <section style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Text Alignment</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => updateReading({ alignment: 'left' })} style={pill(reading.alignment === 'left')}>
                <i className="bi bi-text-left" style={{ display: 'block', marginBottom: 2, fontSize: '0.9rem' }}></i>
                Left
              </button>
              <button onClick={() => updateReading({ alignment: 'justify' })} style={pill(reading.alignment === 'justify')}>
                <i className="bi bi-justify" style={{ display: 'block', marginBottom: 2, fontSize: '0.9rem' }}></i>
                Justified
              </button>
            </div>
          </section>

          <hr style={{ borderColor: 'var(--gf-border)', margin: '0 0 1.25rem' }} />

          {/* Keyboard Shortcuts */}
          <section>
            <p style={sectionLabel}>Keyboard Shortcuts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--gf-muted)' }}>
              {[
                ['Previous chapter', '← Arrow'],
                ['Next chapter', '→ Arrow'],
                ['Toggle settings', 'S'],
                ['Toggle chapters', 'C'],
              ].map(([label, key]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{label}</span>
                  <span style={{ fontFamily: 'monospace', background: 'var(--gf-bg4)', padding: '1px 6px', borderRadius: 3, fontSize: '0.72rem' }}>{key}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
