import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingForge from '../components/LoadingForge';

function cleanThumbnailUrl(url) {
  if (!url) return null;
  try { const u = new URL(url); u.searchParams.delete('nologo'); u.searchParams.delete('enhance'); if (u.searchParams.get('model') === 'flux') u.searchParams.set('model', 'turbo'); return u.toString(); } catch { return url; }
}

export default function NovelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await api.delete(`/novels/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  useEffect(() => {
    api.get(`/novels/${id}`)
      .then(res => setData(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingForge message="Opening the grimoire..." fullPage />;
  if (!data) return null;

  const { chapter1, creator, reader_count, ...novel } = data;
  const isCreator = user?.id === creator?.id;

  const previewParagraphs = chapter1?.content?.split('\n\n') || [];
  const shortPreview = previewParagraphs.slice(0, 3);
  const hasMore = previewParagraphs.length > 3;

  const wordCount = chapter1?.content?.split(' ').length || 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--gf-bg)' }}>
      {/* Hero Image */}
      <div className="novel-hero">
        <img
          src={cleanThumbnailUrl(novel.thumbnail_url) || `https://picsum.photos/seed/${novel.id}/1200/450`}
          alt={novel.title}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${novel.id}/1200/450`; }}
        />
        <div className="novel-hero-overlay">
          <div className="container-xl w-100">
            <span className="gf-badge mb-2 d-inline-block">{novel.genre}</span>
            <h1
              className="font-display"
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', fontWeight: 700, color: '#fff', marginBottom: '0.4rem', lineHeight: 1.2, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
            >
              {novel.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 0 }}>
              Forged by <span style={{ color: 'var(--gf-gold)' }}>{creator?.username}</span>
              {reader_count > 0 && <span> &nbsp;·&nbsp; {reader_count} readers</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="container-xl py-4 py-lg-5">
        <div className="row g-4">
          {/* Main Column */}
          <div className="col-12 col-lg-8">
            {/* Plot */}
            <div className="gf-card mb-4" style={{ padding: '1.5rem' }}>
              <p className="gf-section-title">The Plot</p>
              <p style={{ color: 'var(--gf-text2)', lineHeight: 1.75, marginBottom: 0 }}>
                {novel.plot}
              </p>
            </div>

            {/* Chapter 1 Preview */}
            {chapter1 && (
              <div className="gf-card" style={{ padding: '1.75rem 2rem' }}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h2
                      className="font-display mb-1"
                      style={{ fontSize: '1.05rem', letterSpacing: '0.12em', color: 'var(--gf-text)' }}
                    >
                      Chapter I
                    </h2>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gf-muted)' }}>
                      <i className="bi bi-eye me-1"></i>Public Preview
                      &nbsp;·&nbsp;
                      <i className="bi bi-clock me-1"></i>{readTime} min read
                      &nbsp;·&nbsp;
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>
                </div>

                <div className={`chapter-preview ${!previewExpanded ? '' : ''}`}>
                  <div className="chapter-content" style={{ fontFamily: "'Crimson Text', serif", fontSize: '1.1rem', lineHeight: 1.85 }}>
                    {(previewExpanded ? previewParagraphs : shortPreview).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {!previewExpanded && hasMore && (
                    <div
                      style={{
                        position: 'relative',
                        marginTop: '-80px',
                        height: '100px',
                        background: 'linear-gradient(to bottom, transparent, var(--gf-bg3))',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '0.5rem',
                      }}
                    >
                      <button
                        className="btn-gf-ghost"
                        onClick={() => setPreviewExpanded(true)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        <i className="bi bi-chevron-down me-1"></i>Show more preview
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--gf-border)',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: 'var(--gf-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Continue reading and forge your own path through this story.
                    {!user && ' Sign in to unlock your private chapters.'}
                  </p>
                  {user ? (
                    <Link to={`/novels/${id}/read`} className="btn-gf-primary" style={{ padding: '0.85rem 2.5rem' }}>
                      <i className="bi bi-book-half me-2"></i>
                      {isCreator ? 'Read Your Novel' : 'Begin Your Branch'}
                    </Link>
                  ) : (
                    <Link to="/auth" className="btn-gf-primary" style={{ padding: '0.85rem 2.5rem' }}>
                      <i className="bi bi-lock me-2"></i>
                      Login to Continue
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-4">
            <div className="gf-card mb-3" style={{ padding: '1.5rem' }}>
              <p className="gf-section-title">Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'Genre', value: novel.genre, icon: 'bi-bookmark' },
                  { label: 'Tone', value: novel.tone, icon: 'bi-palette' },
                  { label: 'Chapter Length', value: `~${novel.chapter_length} words`, icon: 'bi-file-text' },
                  { label: 'Readers', value: reader_count, icon: 'bi-people' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="d-flex align-items-start gap-2">
                    <i className={`bi ${icon}`} style={{ color: 'var(--gf-accent)', fontSize: '0.9rem', marginTop: '0.1rem', flexShrink: 0 }}></i>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'var(--gf-faint)', textTransform: 'uppercase' }}>
                        {label}
                      </div>
                      <div style={{ color: 'var(--gf-text2)', fontSize: '0.9rem' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {user && (
              <Link to={`/novels/${id}/read`} className="btn-gf-primary d-block text-center mb-3" style={{ padding: '0.9rem' }}>
                <i className="bi bi-book-half me-2"></i>
                {isCreator ? 'Read Your Novel' : 'Start Your Branch'}
              </Link>
            )}

            <Link to="/" className="btn-gf-ghost d-block text-center" style={{ width: '100%' }}>
              <i className="bi bi-arrow-left me-1"></i>Back to Grimoire
            </Link>

            {isCreator && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-gf-ghost d-block w-100 text-center"
                  style={{
                    color: confirmDelete ? '#fff' : 'var(--gf-accent)',
                    borderColor: 'var(--gf-accent)',
                    background: confirmDelete ? 'var(--gf-accent)' : 'transparent',
                    fontSize: '0.7rem',
                  }}
                >
                  {deleting
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</>
                    : confirmDelete
                      ? <><i className="bi bi-exclamation-triangle me-2"></i>Confirm Delete</>
                      : <><i className="bi bi-trash me-2"></i>Delete Novel</>
                  }
                </button>
                {confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="btn-gf-ghost d-block w-100 text-center mt-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Cancel
                  </button>
                )}
                {confirmDelete && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--gf-muted)', textAlign: 'center', marginTop: '0.4rem' }}>
                    This deletes the novel and all chapters permanently.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
