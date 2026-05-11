import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const THEME_ICONS = {
  midnight: 'bi-moon-stars-fill',
  parchment: 'bi-sun',
  daylight: 'bi-brightness-high-fill',
  abyss: 'bi-water',
  verdant: 'bi-tree-fill',
  twilight: 'bi-stars',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const cycleTheme = () => {
    const themes = ['midnight', 'parchment', 'daylight', 'abyss', 'verdant', 'twilight'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const navLink = {
    display: 'block',
    padding: '0.55rem 0',
    fontFamily: 'Cinzel, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--gf-muted)',
    textDecoration: 'none',
    textAlign: 'right',
  };

  const navLinkActive = {
    ...navLink,
    color: 'var(--gf-text)',
  };

  return (
    <nav className="gf-navbar sticky-top" style={{ position: 'sticky', top: 0, zIndex: 1040 }}>
      <div className="container-xl d-flex align-items-center" style={{ height: 60 }}>

        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2" style={{ marginRight: 'auto' }}>
          <i className="bi bi-fire" style={{ color: 'var(--gf-accent)', fontSize: '1.3rem' }}></i>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--gf-text)' }}>
            GRIM<span style={{ color: 'var(--gf-accent)' }}>FORGE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <Link to="/" className="nav-link" style={isActive('/') ? navLinkActive : navLink}>Browse</Link>
          {user && <Link to="/library" className="nav-link" style={isActive('/library') ? navLinkActive : navLink}>My Library</Link>}
          <button className="btn-gf-icon" onClick={cycleTheme} title={`Theme: ${theme}`} style={{ border: 'none', fontSize: '0.9rem' }}>
            <i className={`bi ${THEME_ICONS[theme]}`}></i>
          </button>
          {user ? (
            <>
              <Link to="/create" className="btn-gf-primary d-flex align-items-center gap-1" style={{ padding: '0.5rem 1rem' }}>
                <i className="bi bi-hammer me-1"></i>Forge Novel
              </Link>
              <div className="dropdown">
                <div className="gf-avatar dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                  {user.username[0].toUpperCase()}
                </div>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--gf-muted)', fontFamily: 'Cinzel, serif' }}>{user.username}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link to="/profile" className="dropdown-item"><i className="bi bi-person me-2"></i>Profile</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item" style={{ color: 'var(--gf-accent)', cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1.1rem', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn-gf-primary" style={{ padding: '0.5rem 1.1rem' }}>Enter the Forge</Link>
          )}
        </div>

        {/* Mobile right controls */}
        <div className="d-flex d-md-none align-items-center gap-2">
          <button className="btn-gf-icon" onClick={cycleTheme} style={{ border: 'none', width: 32, height: 32, fontSize: '1rem' }}>
            <i className={`bi ${THEME_ICONS[theme]}`}></i>
          </button>
          <button
            onClick={() => setMobileOpen(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--gf-muted)', fontSize: '1.4rem', cursor: 'pointer', padding: '0.2rem' }}
          >
            <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile menu — slides down, all right aligned */}
      {mobileOpen && (
        <div style={{
          background: 'var(--gf-nav-bg)',
          borderTop: '1px solid var(--gf-border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.25rem',
        }}>
          <Link to="/" onClick={() => setMobileOpen(false)} style={isActive('/') ? navLinkActive : navLink}>Browse</Link>
          {user && <Link to="/library" onClick={() => setMobileOpen(false)} style={isActive('/library') ? navLinkActive : navLink}>My Library</Link>}

          {user ? (
            <>
              <Link to="/create" onClick={() => setMobileOpen(false)} style={isActive('/create') ? navLinkActive : navLink}>
                <i className="bi bi-hammer me-1"></i>Forge Novel
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={isActive('/profile') ? navLinkActive : navLink}>
                <i className="bi bi-person me-1"></i>Profile
              </Link>
              <div style={{ borderTop: '1px solid var(--gf-border)', width: '100%', marginTop: '0.5rem', paddingTop: '0.5rem', textAlign: 'right' }}>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--gf-accent)', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-gf-primary mt-2" style={{ padding: '0.5rem 1.5rem' }}>
              Enter the Forge
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
