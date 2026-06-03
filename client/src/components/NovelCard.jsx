import { Link } from 'react-router-dom';

const GENRE_COLORS = {
  Fantasy:    { color: '#c9a227', bg: 'rgba(201,162,39,0.15)' },
  Horror:     { color: '#d43030', bg: 'rgba(212,48,48,0.15)' },
  Mystery:    { color: '#a040e0', bg: 'rgba(160,64,224,0.15)' },
  Thriller:   { color: '#e06020', bg: 'rgba(224,96,32,0.15)' },
  Romance:    { color: '#e040a0', bg: 'rgba(224,64,160,0.15)' },
  'Sci-Fi':   { color: '#2090e0', bg: 'rgba(32,144,224,0.15)' },
  Historical: { color: '#c09040', bg: 'rgba(192,144,64,0.15)' },
  Dark:       { color: '#b82222', bg: 'rgba(184,34,34,0.15)' },
};

function wordCount(text = '') {
  return text.trim().split(/\s+/).length;
}

function cleanThumbnailUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.searchParams.delete('nologo');
    u.searchParams.delete('enhance');
    if (u.searchParams.get('model') === 'flux') u.searchParams.set('model', 'turbo');
    return u.toString();
  } catch {
    return url;
  }
}

export default function NovelCard({ novel }) {
  const gc = GENRE_COLORS[novel.genre] || { color: 'var(--gf-muted)', bg: 'var(--gf-bg4)' };

  return (
    <Link
      to={`/novels/${novel.id}`}
      className="gf-card d-block text-decoration-none"
      style={{ overflow: 'hidden' }}
    >
      <div style={{ overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
        <img
          src={cleanThumbnailUrl(novel.thumbnail_url) || `https://picsum.photos/seed/${novel.id}/800/450`}
          alt={novel.title}
          className="card-img-top"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${novel.id}/800/450`; }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
          }}
        />
        <span
          className="gf-badge"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: gc.color,
            background: gc.bg,
            borderColor: 'transparent',
          }}
        >
          {novel.genre}
        </span>
      </div>

      <div className="card-body">
        <h3
          className="font-display mb-1"
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--gf-text)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.2s',
          }}
        >
          {novel.title}
        </h3>
        <p
          className="font-display tracking-wider mb-2"
          style={{ fontSize: '0.6rem', color: 'var(--gf-faint)' }}
        >
          by {novel.creator?.username || 'Unknown'}
        </p>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--gf-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.55,
            marginBottom: '0.75rem',
          }}
        >
          {novel.plot}
        </p>
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ borderTop: '1px solid var(--gf-border)', paddingTop: '0.6rem' }}
        >
          <span
            className="font-display tracking-wider"
            style={{ fontSize: '0.58rem', color: 'var(--gf-faint)' }}
          >
            {novel.tone}
          </span>
          {novel.reader_count > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--gf-faint)' }}>
              <i className="bi bi-book me-1"></i>
              {novel.reader_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
