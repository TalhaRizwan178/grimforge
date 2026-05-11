import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ChapterForgeModal({ novelId, nextChapterNum, onGenerate, onClose }) {
  const [selected, setSelected] = useState(null); // 'natural' | 'branch-0' | 'branch-1' | 'branch-2' | 'custom'
  const [customText, setCustomText] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState('');

  useEffect(() => {
    fetchBranches();
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    setBranchError('');
    setBranches([]);
    setSelected(prev => prev?.startsWith('branch') ? null : prev);
    try {
      const res = await api.get(`/novels/${novelId}/chapters/branches`);
      setBranches(res.data.branches || []);
    } catch {
      setBranchError('Failed to generate suggestions.');
    } finally {
      setLoadingBranches(false);
    }
  };

  const canForge =
    selected === 'natural' ||
    (selected === 'custom' && customText.trim().length > 0) ||
    (selected?.startsWith('branch-') && branches.length > 0);

  const handleForge = () => {
    if (!canForge) return;
    if (selected === 'natural') {
      onGenerate(null);
    } else if (selected === 'custom') {
      onGenerate(customText.trim());
    } else if (selected?.startsWith('branch-')) {
      const i = parseInt(selected.split('-')[1]);
      const b = branches[i];
      onGenerate(`${b.title}: ${b.description}`);
    }
    onClose();
  };

  const optionStyle = (key) => ({
    background: selected === key ? 'rgba(184,34,34,0.12)' : 'var(--gf-bg3)',
    border: `1px solid ${selected === key ? 'var(--gf-accent)' : 'var(--gf-border)'}`,
    padding: '0.9rem 1.1rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    color: 'var(--gf-text)',
    width: '100%',
    position: 'relative',
    display: 'block',
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1060,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--gf-bg2)',
          border: '1px solid var(--gf-border)',
          width: '100%', maxWidth: 580,
          maxHeight: '90vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--gf-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h5 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.2em', color: 'var(--gf-text)', margin: 0 }}>
            <i className="bi bi-hammer me-2" style={{ color: 'var(--gf-accent)' }}></i>
            Forge Chapter {nextChapterNum}
          </h5>
          <button className="btn-gf-icon" onClick={onClose} style={{ border: 'none' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--gf-muted)', fontSize: '0.82rem', margin: 0 }}>
            Choose how Chapter {nextChapterNum} unfolds — select one option and forge.
          </p>

          {/* Option 1 — Continue Naturally */}
          <button
            style={optionStyle('natural')}
            onClick={() => setSelected('natural')}
          >
            {selected === 'natural' && (
              <i className="bi bi-check-circle-fill" style={{ position: 'absolute', top: 10, right: 12, color: 'var(--gf-accent)', fontSize: '0.85rem' }}></i>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: '1.3rem', color: 'var(--gf-accent)', flexShrink: 0 }}></i>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>
                  Continue Naturally
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gf-muted)' }}>
                  Let the AI follow the story's momentum — no direction needed.
                </div>
              </div>
            </div>
          </button>

          {/* Options 2-4 — AI Branches */}
          <div style={{ borderTop: '1px solid var(--gf-border)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--gf-faint)', textTransform: 'uppercase' }}>
                <i className="bi bi-diagram-3-fill me-1" style={{ color: '#8b30c8' }}></i>
                AI Story Branches
              </span>
              {!loadingBranches && (
                <button
                  onClick={fetchBranches}
                  style={{ background: 'none', border: 'none', color: 'var(--gf-muted)', fontSize: '0.7rem', cursor: 'pointer', padding: '0.1rem 0.3rem' }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>Regenerate
                </button>
              )}
            </div>

            {loadingBranches && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--gf-muted)', fontSize: '0.82rem' }}>
                <div className="forge-spinner mx-auto mb-2" style={{ width: 36, height: 36 }}>
                  <div className="forge-spinner-icon"><i className="bi bi-diagram-3"></i></div>
                </div>
                Generating story branches...
              </div>
            )}

            {branchError && !loadingBranches && (
              <div style={{ fontSize: '0.78rem', color: 'var(--gf-accent)', padding: '0.5rem 0' }}>
                <i className="bi bi-exclamation-triangle me-1"></i>{branchError}
                <button onClick={fetchBranches} style={{ background: 'none', border: 'none', color: 'var(--gf-accent)', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline', marginLeft: '0.4rem' }}>Retry</button>
              </div>
            )}

            {!loadingBranches && branches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {branches.map((b, i) => (
                  <button
                    key={i}
                    style={optionStyle(`branch-${i}`)}
                    onClick={() => setSelected(`branch-${i}`)}
                  >
                    {selected === `branch-${i}` && (
                      <i className="bi bi-check-circle-fill" style={{ position: 'absolute', top: 10, right: 12, color: '#8b30c8', fontSize: '0.85rem' }}></i>
                    )}
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#8b30c8', marginBottom: '0.3rem' }}>
                      Branch {i + 1} — {b.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gf-text2)', lineHeight: 1.55 }}>
                      {b.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Option 5 — Custom */}
          <div style={{ borderTop: '1px solid var(--gf-border)', paddingTop: '0.75rem' }}>
            <button
              style={{ ...optionStyle('custom'), marginBottom: selected === 'custom' ? '0.6rem' : 0 }}
              onClick={() => setSelected('custom')}
            >
              {selected === 'custom' && (
                <i className="bi bi-check-circle-fill" style={{ position: 'absolute', top: 10, right: 12, color: 'var(--gf-gold)', fontSize: '0.85rem' }}></i>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="bi bi-pencil-square" style={{ fontSize: '1.3rem', color: 'var(--gf-gold)', flexShrink: 0 }}></i>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>
                    Write Your Own Direction
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gf-muted)' }}>
                    Tell the AI exactly what should happen next.
                  </div>
                </div>
              </div>
            </button>

            {selected === 'custom' && (
              <textarea
                className="gf-input"
                placeholder="e.g. 'Dragneel finally speaks to Liliana alone — she is cold but intrigued. A rival faction attacks, forcing them to fight side by side...'"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                rows={4}
                autoFocus
                style={{ resize: 'vertical', minHeight: 100, fontFamily: 'Crimson Text, serif', fontSize: '0.95rem' }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid var(--gf-border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn-gf-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-gf-primary"
            onClick={handleForge}
            disabled={!canForge}
            style={{ padding: '0.6rem 1.5rem' }}
          >
            <i className="bi bi-hammer me-2"></i>
            Forge Chapter {nextChapterNum}
          </button>
        </div>
      </div>
    </div>
  );
}
