import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'var(--gf-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <i className="bi bi-fire" style={{ fontSize: '3rem', color: 'var(--gf-accent)', display: 'block', marginBottom: '0.75rem', textShadow: '0 0 30px var(--gf-accent)' }}></i>
          <h1 className="font-display tracking-widest" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gf-text)', marginBottom: '0.25rem' }}>
            GRIMFORGE
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--gf-muted)' }}>Where dark stories are born</p>
        </div>

        <div className="auth-card">
          {/* Tabs */}
          <div className="d-flex" style={{ borderBottom: '1px solid var(--gf-border)' }}>
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
              Login
            </button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
              Register
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {error && (
              <div className="gf-alert-error mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="gf-label">Pen Name (Username)</label>
                  <input
                    type="text"
                    className="gf-input"
                    placeholder="Your writer's name"
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="gf-label">Email</label>
                <input
                  type="email"
                  className="gf-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mb-4">
                <label className="gf-label">Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="gf-input"
                    placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--gf-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '1rem',
                    }}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-gf-primary w-100"
                disabled={loading}
                style={{ padding: '0.85rem', fontSize: '0.72rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {mode === 'login' ? 'Entering...' : 'Joining...'}
                  </>
                ) : (
                  mode === 'login' ? 'Enter the Forge' : 'Join the Forge'
                )}
              </button>
            </form>

            <p className="text-center mt-3" style={{ fontSize: '0.82rem', color: 'var(--gf-muted)' }}>
              {mode === 'login' ? (
                <>New here?{' '}
                  <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--gf-gold)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                    Create an account
                  </button>
                </>
              ) : (
                <>Already a member?{' '}
                  <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--gf-gold)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center mt-3">
          <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--gf-muted)' }}>
            <i className="bi bi-arrow-left me-1"></i>Back to the Grimoire
          </Link>
        </p>
      </div>
    </div>
  );
}
