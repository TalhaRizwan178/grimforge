import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingForge from '../components/LoadingForge';

export default function Library() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/novels/user/library')
      .then(res => setLibrary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingForge message="Retrieving your grimoire..." fullPage />;

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--gf-bg)', padding: '2.5rem 1rem' }}>
      <div className="container-xl" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div className="mb-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <i className="bi bi-collection" style={{ fontSize: '1.75rem', color: 'var(--gf-accent)' }}></i>
            <h1 className="font-display mb-0" style={{ fontSize: '1.4rem', letterSpacing: '0.18em', color: 'var(--gf-text)' }}>
              YOUR GRIMOIRE
            </h1>
          </div>
          <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem', marginLeft: '2.4rem' }}>
            Tales you have forged and continued
          </p>
        </div>

        {library.length === 0 ? (
          <div
            className="gf-card"
            style={{ padding: '4rem 2rem', textAlign: 'center' }}
          >
            <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: 'var(--gf-faint)', display: 'block', marginBottom: '1.25rem' }}></i>
            <h3
              className="font-display tracking-widest mb-2"
              style={{ fontSize: '0.8rem', letterSpacing: '0.25em', color: 'var(--gf-muted)' }}
            >
              YOUR GRIMOIRE IS EMPTY
            </h3>
            <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
              Start reading and continuing novels to fill your library.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/" className="btn-gf-secondary">
                <i className="bi bi-book me-2"></i>Browse Novels
              </Link>
              <Link to="/create" className="btn-gf-primary">
                <i className="bi bi-hammer me-2"></i>Forge New Tale
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 slide-up">
            {library.map(({ novel, latest_chapter }) => {
              const isCreator = novel.creator_id === novel.creator?.id;
              return (
                <div key={novel.id} className="library-item">
                  <img
                    src={novel.thumbnail_url || `https://picsum.photos/seed/${novel.id}/160/112`}
                    alt={novel.title}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="gf-badge">{novel.genre}</span>
                      {latest_chapter > 1 && (
                        <span
                          style={{
                            fontSize: '0.58rem',
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '0.1em',
                            color: 'var(--gf-accent)',
                            textTransform: 'uppercase',
                            alignSelf: 'center',
                          }}
                        >
                          <i className="bi bi-lock-fill me-1"></i>Your branch
                        </span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '1rem',
                        color: 'var(--gf-text)',
                        marginBottom: '0.2rem',
                        marginTop: '0.4rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {novel.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gf-muted)', marginBottom: '0.4rem' }}>
                      by {novel.creator?.username}
                    </p>
                    {/* Chapter progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          background: 'var(--gf-border)',
                          borderRadius: 2,
                          maxWidth: 120,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--gf-accent)',
                            borderRadius: 2,
                            width: `${Math.min((latest_chapter / 10) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gf-muted)' }}>
                        Chapter {latest_chapter}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/novels/${novel.id}/read`}
                    className="btn-gf-primary flex-shrink-0 d-flex align-items-center gap-1"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.65rem' }}
                  >
                    <i className="bi bi-book-half"></i>
                    <span className="d-none d-sm-inline ms-1">Continue</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
