import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import NovelCard from '../components/NovelCard';
import LoadingForge from '../components/LoadingForge';

const GENRES = ['All', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Historical', 'Dark', 'Action', 'Adventure', 'Comedy', 'Drama', 'Supernatural', 'Crime', 'Dystopian', 'Psychological', 'Noir', 'Satire', 'Western', 'Mythology', 'Light Novel', 'Anime', 'Isekai', 'Manhwa', 'Shonen', 'Shojo', 'Seinen', 'Cultivation'];

export default function Home() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genreSearch, setGenreSearch] = useState('');
  const [genreOpen, setGenreOpen] = useState(false);
  const genreDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchNovels();
  }, [genre, search]);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (genre !== 'All') params.genre = genre;
      if (search) params.search = search;
      const res = await api.get('/novels', { params });
      setNovels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div>
      {/* Hero */}
      <div className="gf-hero">
        <div className="container-xl position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <i className="bi bi-fire hero-icon"></i>
              <h1 className="hero-title mb-3">
                WHERE DARK STORIES<br />
                <span className="accent">ARE BORN</span>
              </h1>
              <p className="hero-subtitle mx-auto mb-4">
                Forge your own tale, chapter by chapter. Read what others have begun,
                then write your own path through the darkness. Every reader, their own story.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/create" className="btn-gf-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.72rem' }}>
                  <i className="bi bi-hammer me-2"></i>Begin Your Tale
                </Link>
                <a href="#browse" className="btn-gf-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.72rem' }}>
                  <i className="bi bi-book me-2"></i>Browse Stories
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Section */}
      <div className="container-xl py-5" id="browse">
        {/* Search + Filters */}
        <div className="mb-4">
          <div className="row g-3 align-items-center mb-3">
            <div className="col-12 col-sm-auto flex-grow-1" style={{ maxWidth: 340 }}>
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                  type="text"
                  className="gf-input"
                  placeholder="Search novels..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ padding: '0.55rem 0.9rem' }}
                />
                <button type="submit" className="btn-gf-ghost" style={{ flexShrink: 0 }}>
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>
            {search && (
              <div className="col-auto">
                <button
                  className="btn-gf-ghost"
                  onClick={() => { setSearch(''); setSearchInput(''); }}
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-x me-1"></i>Clear
                </button>
              </div>
            )}
          </div>

          {/* Genre filter */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Active genre pill */}
            <button
              className={`filter-pill ${genre === 'All' ? 'active' : ''}`}
              onClick={() => setGenre('All')}
            >
              All
            </button>

            {genre !== 'All' && (
              <button
                className="filter-pill active"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => setGenre('All')}
              >
                {genre}
                <i className="bi bi-x" style={{ fontSize: '0.75rem' }}></i>
              </button>
            )}

            {/* Genre dropdown */}
            <div style={{ position: 'relative' }} ref={genreDropdownRef}>
              <button
                className="filter-pill"
                onClick={() => setGenreOpen(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className="bi bi-funnel"></i>
                Browse Genres
                <i className={`bi ${genreOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '0.65rem' }}></i>
              </button>

              {genreOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: 'var(--gf-bg2)',
                  border: '1px solid var(--gf-border)',
                  zIndex: 100,
                  width: 260,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {/* Search inside dropdown */}
                  <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--gf-border)' }}>
                    <input
                      type="text"
                      className="gf-input"
                      placeholder="Search genres..."
                      value={genreSearch}
                      onChange={e => setGenreSearch(e.target.value)}
                      autoFocus
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  {/* Genre list */}
                  <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {GENRES.filter(g => g !== 'All' && g.toLowerCase().includes(genreSearch.toLowerCase())).map(g => (
                      <button
                        key={g}
                        onClick={() => { setGenre(g); setGenreOpen(false); setGenreSearch(''); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.55rem 0.85rem',
                          background: genre === g ? 'rgba(184,34,34,0.15)' : 'transparent',
                          border: 'none',
                          borderLeft: `3px solid ${genre === g ? 'var(--gf-accent)' : 'transparent'}`,
                          color: genre === g ? 'var(--gf-text)' : 'var(--gf-muted)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontFamily: 'Cinzel, serif',
                          letterSpacing: '0.05em',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (genre !== g) e.currentTarget.style.background = 'var(--gf-bg3)'; }}
                        onMouseLeave={e => { if (genre !== g) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {genre === g && <i className="bi bi-check me-2" style={{ color: 'var(--gf-accent)' }}></i>}
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingForge message="Summoning tales from the forge..." />
        ) : novels.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: 'var(--gf-faint)', display: 'block', marginBottom: '1rem' }}></i>
            <p className="font-display tracking-wider" style={{ color: 'var(--gf-muted)', fontSize: '0.75rem', letterSpacing: '0.25em' }}>
              NO TALES FOUND
            </p>
            <Link to="/create" className="btn-gf-primary mt-3 d-inline-block">
              Forge the First One
            </Link>
          </div>
        ) : (
          <div className="row g-4 fade-in">
            {novels.map(novel => (
              <div key={novel.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer callout */}
      <div
        style={{
          borderTop: '1px solid var(--gf-border)',
          padding: '3rem 0',
          background: 'var(--gf-bg2)',
          textAlign: 'center',
        }}
      >
        <div className="container-xl">
          <p className="font-display tracking-widest" style={{ fontSize: '0.65rem', color: 'var(--gf-faint)', marginBottom: '1rem' }}>
            THE GRIMOIRE AWAITS
          </p>
          <Link to="/create" className="btn-gf-primary">
            <i className="bi bi-hammer me-2"></i>Start Forging
          </Link>
        </div>
      </div>
    </div>
  );
}
