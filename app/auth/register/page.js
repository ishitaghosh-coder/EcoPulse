'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return; }
      // Redirect based on role
      if (form.role === 'authority') router.push('/authority-dashboard');
      else router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left — Visual panel */}
      <div className="auth-visual">
        <Image
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&auto=format&fit=crop&q=80"
          alt="FIFA World Cup stadium atmosphere"
          fill
          style={{ objectFit: 'cover', opacity: 0.5 }}
          priority
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-visual-quote">
            "Sustainability and <em>performance</em> — the future of football."
          </div>
          <div className="auth-visual-caption">EcoPulse Stadium · FIFA World Cup</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            {['68K Fans', '5 Sectors', '94% Efficiency', 'AI-Powered'].map(t => (
              <span key={t} className="badge badge-green">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#050810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V12"/><path d="M5 3s.55 7.07 3.5 9.5S17 14 17 14"/>
                <path d="M19 3s-.55 7.07-3.5 9.5S7 14 7 14"/><line x1="12" y1="12" x2="8" y2="17"/>
              </svg>
            </div>
            <span className="auth-logo-text">EcoPulse<span>Stadium</span></span>
          </div>

          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Join the EcoPulse operations network for FIFA World Cup stadium management.</p>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.3)', color: 'var(--red)', fontSize: '0.82rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" className="form-input" type="text" placeholder="Alex Rivera" value={form.name} onChange={set('name')} required autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" className="form-input" type="email" placeholder="alex@stadium.org" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Role</label>
              <select id="reg-role" className="form-select" value={form.role} onChange={set('role')}>
                <option value="staff">👷 Ground Staff</option>
                <option value="authority">🏟️ Authority / Organizer</option>
              </select>
              <span className="form-hint">Staff → Staff App portal · Authority → Authority Dashboard</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </div>

          <div style={{ marginTop: 32, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            🛡️ <strong style={{ color: 'var(--text-secondary)' }}>Demo mode:</strong> If MongoDB is not configured, any credentials are accepted and stored in a session token only.
          </div>
        </div>
      </div>
    </div>
  );
}
