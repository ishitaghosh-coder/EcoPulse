'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return; }
      // Redirect based on role
      if (data.user?.role === 'authority') router.push('/authority-dashboard');
      else if (data.user?.role === 'staff') router.push('/staff-app');
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
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&auto=format&fit=crop&q=80"
          alt="Football stadium at night"
          fill
          style={{ objectFit: 'cover', opacity: 0.55 }}
          priority
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-visual-quote">
            "Every watt saved,<br/>every fan safe."
          </div>
          <div className="auth-visual-caption">EcoPulse Stadium · Live Operations Engine</div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: '⚡ Ops Engine', desc: 'For authorized staff' },
                { label: '🏟️ Authority', desc: 'For organizers' },
                { label: '👷 Staff App', desc: 'For ground crew' },
              ].map(p => (
                <div key={p.label} style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', fontSize: '0.72rem' }}>
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{p.desc}</div>
                </div>
              ))}
            </div>
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

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to access the EcoPulse stadium operations portal.</p>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.3)', color: 'var(--red)', fontSize: '0.82rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input id="login-email" className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input id="login-password" className="form-input" type="password" placeholder="Your password" value={form.password} onChange={set('password')} required autoComplete="current-password" />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="auth-switch">
            Don&apos;t have an account? <Link href="/auth/register">Create one</Link>
          </div>

          {/* Demo hint box */}
          <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(45,156,255,0.06)', border: '1px solid rgba(45,156,255,0.15)', fontSize: '0.72rem', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>🔵 Demo Login (no MongoDB needed)</div>
            <div style={{ color: 'var(--text-muted)' }}>
              Use any email + password. Roles are auto-detected:<br />
              • Email with "authority" → Authority Dashboard<br />
              • Any other email → Staff App
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
