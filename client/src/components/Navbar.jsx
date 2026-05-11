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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const cycleTheme = () => {
    const themes = ['midnight', 'parchment', 'daylight', 'abyss', 'verdant', 'twilight'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <nav className="navbar navbar-expand-md gf-navbar sticky-top">
      <div className="container-xl">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <i className="bi bi-fire" style={{ color: 'var(--gf-accent)', fontSize: '1.3rem' }}></i>
          <span>GRIM<span>FORGE</span></span>
        </Link>

        {/* Mobile right controls */}
        <div className="d-flex d-md-none align-items-center gap-2 ms-auto me-2">
          <button className="btn-gf-icon" onClick={cycleTheme} title={`Theme: ${theme}`} style={{ border: 'none', width: 32, height: 32, fontSize: '1rem' }}>
            <i className={`bi ${THEME_ICONS[theme]}`}></i>
          </button>

<button
            className="navbar-toggler border-0 p-1"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#gfNavbar"
            aria-controls="gfNavbar"
            aria-expanded="false"
            style={{ color: 'var(--gf-muted)', fontSize: '1.2rem' }}
          >
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="gfNavbar" style={{ justifyContent: 'flex-end' }}>
          {/* Nav links */}
          <ul className="navbar-nav gap-1 text-end text-md-start me-md-auto">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Browse
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link to="/library" className={`nav-link ${isActive('/library') ? 'active' : ''}`}>
                  My Library
                </Link>
              </li>
            )}
          </ul>

          {/* Right controls */}
          <div className="d-flex align-items-center justify-content-end gap-2 mt-2 mt-md-0">
            {/* Theme cycle button (desktop) */}
            <button
              className="btn-gf-icon d-none d-md-flex"
              onClick={cycleTheme}
              title={`Theme: ${theme}`}
              style={{ fontSize: '0.9rem' }}
            >
              <i className={`bi ${THEME_ICONS[theme]}`}></i>
            </button>

            {user ? (
              <>
                <Link to="/create" className="btn-gf-primary d-none d-sm-inline-flex align-items-center gap-1" style={{ padding: '0.5rem 1rem' }}>
                  <i className="bi bi-hammer me-1"></i>
                  Forge Novel
                </Link>

                {/* User dropdown */}
                <div className="dropdown">
                  <div
                    className="gf-avatar dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ cursor: 'pointer' }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end" style={{ right: 0, left: 'auto' }}>
                    <li>
                      <span style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--gf-muted)', fontFamily: 'Cinzel, serif' }}>
                        {user.username}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link to="/create" className="dropdown-item d-md-none">
                        <i className="bi bi-hammer me-2"></i>Forge Novel
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/library" className="dropdown-item d-md-none">
                        <i className="bi bi-collection me-2"></i>Library
                      </Link>
                    </li>
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
              <Link to="/auth" className="btn-gf-primary ms-auto ms-md-0" style={{ padding: '0.5rem 1.1rem' }}>
                Enter the Forge
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
