'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function PortalNav() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <nav className="portal-navbar" role="navigation" aria-label="Portal navigation">
      <div className="portal-nav-brand">
        <div className="portal-nav-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#050810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12"/>
            <path d="M5 3s.55 7.07 3.5 9.5S17 14 17 14"/>
            <path d="M19 3s-.55 7.07-3.5 9.5S7 14 7 14"/>
            <line x1="12" y1="12" x2="8" y2="17"/>
          </svg>
        </div>
        <span className="portal-nav-brand-text">EcoPulse<span>Stadium</span></span>
      </div>

      <div className="portal-nav-divider" />

      <div className="portal-nav-links">
        <Link href="/" className={`nav-pill nav-pill-engine${pathname === '/' ? ' active' : ''}`}>
          ⚡ Ops Engine
        </Link>
        <Link href="/authority-dashboard" className={`nav-pill nav-pill-authority${pathname.startsWith('/authority') ? ' active' : ''}`}>
          🏟️ Authority
        </Link>
        <Link href="/staff-app" className={`nav-pill nav-pill-staff${pathname.startsWith('/staff') ? ' active' : ''}`}>
          👷 Staff App
        </Link>
      </div>

      <div className="portal-nav-right">
        {user && (
          <div className="portal-nav-user">
            <div className="portal-nav-user-dot" />
            <span>{user.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>·</span>
            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        )}
        {user ? (
          <button className="portal-nav-logout" onClick={handleLogout}>Sign out</button>
        ) : (
          <Link href="/auth/login" className="nav-pill nav-pill-engine" style={{ fontSize: '0.68rem' }}>Sign in</Link>
        )}
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>FIFA WC</span>
      </div>
    </nav>
  );
}
