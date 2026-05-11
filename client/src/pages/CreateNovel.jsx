import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingForge from '../components/LoadingForge';

const DEFAULT_GENRES = ['Fantasy', 'Horror', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Historical', 'Dark', 'Action', 'Adventure', 'Comedy', 'Drama', 'Supernatural', 'Crime', 'Dystopian', 'Psychological'];
const TONES = ['Dark & Gritty', 'Gothic', 'Atmospheric', 'Epic', 'Suspenseful', 'Melancholic', 'Lyrical', 'Visceral'];
const LENGTHS = [
  { label: 'Short', sub: '~800 words', value: 800 },
  { label: 'Standard', sub: '~1500 words', value: 1500 },
  { label: 'Long', sub: '~2500 words', value: 2500 },
];

const GENRE_ICONS = {
  Fantasy: 'bi-stars',
  Horror: 'bi-moon',
  Mystery: 'bi-search',
  Thriller: 'bi-lightning',
  Romance: 'bi-heart',
  'Sci-Fi': 'bi-rocket',
  Historical: 'bi-hourglass',
  Dark: 'bi-fire',
  Action: 'bi-shield-fill',
  Adventure: 'bi-compass',
  Comedy: 'bi-emoji-laughing',
  Drama: 'bi-camera-reels',
  Supernatural: 'bi-eye',
  Crime: 'bi-incognito',
  Dystopian: 'bi-building-slash',
  Psychological: 'bi-person-bounding-box',
};

export default function CreateNovel() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    plot: '',
    genres: [],
    tone: '',
    chapter_length: 1500,
  });
  const [customGenres, setCustomGenres] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [publicNovels, setPublicNovels] = useState([]);
  const [showInspiration, setShowInspiration] = useState(false);

  useEffect(() => {
    api.get('/novels?limit=8').then(res => setPublicNovels(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plot.trim()) { setError('The plot cannot be empty.'); return; }
    if (form.genres.length === 0) { setError('Please select at least one genre.'); return; }
    if (!form.tone) { setError('Please choose a tone.'); return; }

    setError('');
    setLoading(true);

    const messages = [
      'Lighting the forge...',
      'Generating your title...',
      'Writing Chapter I...',
      'Mapping the story world...',
      'Almost ready...',
    ];
    let msgIdx = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMsg(messages[msgIdx]);
    }, 3500);

    try {
      const res = await api.post('/novels', { ...form, genre: form.genres.join(' / ') });
      clearInterval(interval);
      navigate(`/novels/${res.data.novel.id}/read`);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || 'Failed to forge novel. Try again.');
      setLoading(false);
    }
  };

  const toggleGenre = (g) => {
    setForm(p => {
      if (p.genres.includes(g)) return { ...p, genres: p.genres.filter(x => x !== g) };
      if (p.genres.length >= 4) return p; // max 4
      return { ...p, genres: [...p.genres, g] };
    });
  };

  const addCustomGenre = () => {
    const val = customInput.trim();
    if (!val) return;
    if (form.genres.length >= 4) return;
    const normalised = val.charAt(0).toUpperCase() + val.slice(1);
    if ([...DEFAULT_GENRES, ...customGenres].includes(normalised)) {
      if (!form.genres.includes(normalised)) toggleGenre(normalised);
    } else {
      setCustomGenres(p => [...p, normalised]);
      setForm(p => ({ ...p, genres: [...p.genres, normalised] }));
    }
    setCustomInput('');
  };

  const borrowPlot = (novel) => {
    const borrowed = novel.genre ? novel.genre.split(' / ').map(g => g.trim()) : [];
    setForm(p => ({ ...p, plot: novel.plot, genres: borrowed, tone: novel.tone }));
    setShowInspiration(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', gap: '1rem', background: 'var(--gf-bg)' }}>
        <LoadingForge message={loadingMsg} />
        <p style={{ color: 'var(--gf-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 380 }}>
          Your novel is being born from the forge. Chapter I is being written fresh — this takes 15-40 seconds.
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gf-accent)', animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--gf-bg)', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <i className="bi bi-hammer" style={{ fontSize: '2.5rem', color: 'var(--gf-accent)', display: 'block', marginBottom: '0.75rem' }}></i>
          <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--gf-text)' }}>
            FORGE A NOVEL
          </h1>
          <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem' }}>
            Shape the world — let the darkness write the words.
          </p>
        </div>

        {/* Inspiration drawer */}
        <div className="mb-4">
          <button
            type="button"
            className="inspiration-toggle"
            onClick={() => setShowInspiration(p => !p)}
          >
            <span>
              <i className="bi bi-lightbulb me-2"></i>
              Draw Inspiration from Existing Tales
            </span>
            <i className={`bi ${showInspiration ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
          {showInspiration && (
            <div className="inspiration-list">
              {publicNovels.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--gf-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No public novels yet. Be the first to forge one!
                </div>
              ) : publicNovels.map(novel => (
                <div
                  key={novel.id}
                  className="inspiration-item"
                  onClick={() => borrowPlot(novel)}
                >
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: 'var(--gf-text)', marginBottom: '0.2rem' }}>
                    {novel.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gf-muted)', marginBottom: '0.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {novel.plot}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gf-gold)' }}>
                    {novel.genre} · {novel.tone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="gf-alert-error mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="gf-card" style={{ padding: '2rem' }}>
            {/* Title */}
            <div className="mb-4">
              <label className="gf-label">
                Title <span style={{ color: 'var(--gf-faint)', textTransform: 'none', fontFamily: 'Crimson Text, serif', letterSpacing: 0, fontSize: '0.85rem' }}>— leave blank to auto-generate</span>
              </label>
              <input
                type="text"
                className="gf-input"
                placeholder="Leave blank for an AI-generated title..."
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                maxLength={200}
              />
            </div>

            {/* Plot */}
            <div className="mb-4">
              <label className="gf-label">Core Plot *</label>
              <textarea
                className="gf-input"
                placeholder="Describe the heart of your story — its central conflict, world, and what drives it. The AI will follow this faithfully across every chapter. Include key characters, the main tension, and the world if relevant."
                value={form.plot}
                onChange={e => setForm(p => ({ ...p, plot: e.target.value }))}
                rows={5}
                style={{ resize: 'vertical', minHeight: 110 }}
                required
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--gf-faint)', marginTop: '0.25rem', textAlign: 'right' }}>
                {form.plot.length} / 2000 recommended
              </div>
            </div>

            {/* Genre */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <label className="gf-label mb-0">
                  Genre *
                  <span style={{ color: 'var(--gf-faint)', textTransform: 'none', fontFamily: 'Crimson Text, serif', letterSpacing: 0, fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                    — select up to 4
                  </span>
                </label>
                <span style={{ fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: form.genres.length >= 4 ? 'var(--gf-accent)' : 'var(--gf-faint)' }}>
                  {form.genres.length} / 4
                </span>
              </div>

              <div className="row g-2 mb-3">
                {[...DEFAULT_GENRES, ...customGenres].map(g => (
                  <div key={g} className="col-6 col-sm-3">
                    <button
                      type="button"
                      className={`genre-btn ${form.genres.includes(g) ? 'selected' : ''}`}
                      onClick={() => toggleGenre(g)}
                    >
                      {GENRE_ICONS[g] && (
                        <i className={`bi ${GENRE_ICONS[g]} d-block mb-1`} style={{ fontSize: '1.1rem' }}></i>
                      )}
                      {!GENRE_ICONS[g] && (
                        <i className="bi bi-bookmark d-block mb-1" style={{ fontSize: '1.1rem' }}></i>
                      )}
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g}</span>
                      {form.genres.includes(g) && (
                        <i className="bi bi-check-circle-fill" style={{ position: 'absolute', top: 6, right: 6, fontSize: '0.65rem', color: '#fff', opacity: 0.85 }}></i>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom genre input */}
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="gf-input"
                  placeholder="Add a custom genre..."
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomGenre())}
                  maxLength={40}
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  className="btn-gf-secondary"
                  onClick={addCustomGenre}
                  disabled={!customInput.trim()}
                  style={{ padding: '0.5rem 1rem', flexShrink: 0, fontSize: '0.65rem' }}
                >
                  <i className="bi bi-plus-lg me-1"></i>Add
                </button>
              </div>

              {/* Selected genres tags */}
              {form.genres.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {form.genres.map(g => (
                    <span
                      key={g}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'var(--gf-accent)',
                        color: '#fff',
                        fontSize: '0.62rem',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '0.1em',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 0,
                      }}
                    >
                      {g}
                      <button
                        type="button"
                        onClick={() => toggleGenre(g)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.75rem' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tone */}
            <div className="mb-4">
              <label className="gf-label">Narrative Tone *</label>
              <div className="row g-2">
                {TONES.map(t => (
                  <div key={t} className="col-6 col-sm-3">
                    <button
                      type="button"
                      className={`genre-btn ${form.tone === t ? 'selected' : ''}`}
                      onClick={() => setForm(p => ({ ...p, tone: t }))}
                      style={{ fontSize: '0.58rem' }}
                    >
                      {t}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter Length */}
            <div className="mb-5">
              <label className="gf-label">Chapter Length</label>
              <div className="row g-2">
                {LENGTHS.map(l => (
                  <div key={l.value} className="col-4">
                    <button
                      type="button"
                      className={`genre-btn ${form.chapter_length === l.value ? 'selected' : ''}`}
                      onClick={() => setForm(p => ({ ...p, chapter_length: l.value }))}
                    >
                      <span style={{ fontSize: '0.8rem', display: 'block' }}>{l.label}</span>
                      <span style={{ fontSize: '0.6rem', color: form.chapter_length === l.value ? 'rgba(255,255,255,0.7)' : 'var(--gf-faint)' }}>{l.sub}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-gf-primary w-100"
              style={{ padding: '1rem', fontSize: '0.75rem', letterSpacing: '0.25em' }}
            >
              <i className="bi bi-hammer me-2"></i>
              IGNITE THE FORGE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
