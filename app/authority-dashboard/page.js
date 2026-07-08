'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PortalNav from '@/components/PortalNav';
import ChatBot from '@/components/ChatBot';

const STAFF_ROSTER = [
  { name: 'Marcus Johnson',   role: 'Security Officer', sector: 'North Concourse', status: 'on-duty',  lastSeen: '1 min ago'  },
  { name: 'Sofia Herrera',    role: 'Event Volunteer',  sector: 'North Concourse', status: 'on-duty',  lastSeen: '3 min ago'  },
  { name: 'Wei Zhang',        role: 'Tech Support',     sector: 'West Concourse',  status: 'alert',    lastSeen: 'Just now'   },
  { name: 'Amara Okonkwo',    role: 'Cleaning Crew',    sector: 'South Concourse', status: 'on-duty',  lastSeen: '2 min ago'  },
  { name: 'Diego Fernández',  role: 'Medical Staff',    sector: 'East Concourse',  status: 'on-duty',  lastSeen: '4 min ago'  },
  { name: 'Priya Venkatesh',  role: 'Security Officer', sector: 'East Concourse',  status: 'on-duty',  lastSeen: '2 min ago'  },
  { name: 'Lena Müller',      role: 'Event Volunteer',  sector: 'South Concourse', status: 'on-duty',  lastSeen: '6 min ago'  },
  { name: 'Kwame Asante',     role: 'Cleaning Crew',    sector: 'North Concourse', status: 'on-duty',  lastSeen: '3 min ago'  },
  { name: 'Yuki Tanaka',      role: 'Tech Support',     sector: 'Pitch Zone',      status: 'on-duty',  lastSeen: '1 min ago'  },
  { name: 'Carlos Mendez',    role: 'Security Officer', sector: 'South Concourse', status: 'on-break', lastSeen: '11 min ago' },
  { name: 'Fatima Al-Rashid', role: 'Medical Staff',    sector: 'North Concourse', status: 'on-duty',  lastSeen: '5 min ago'  },
];

const KPI_DATA = [
  { label: 'Sustainability Score', value: '87', unit: '/100', delta: '+4 vs. last match', up: true, color: 'var(--green)' },
  { label: 'Energy Consumption',   value: '22.4', unit: 'MW',  delta: '-2.8 MW optimized', up: true, color: 'var(--blue)' },
  { label: 'Staff On Duty',        value: '147',  unit: '',    delta: '9 on break', up: null, color: 'var(--purple)' },
  { label: 'Crowd Capacity',       value: '68K',  unit: '',    delta: '94% North Zone', up: null, color: 'var(--amber)' },
  { label: 'Active Alerts',        value: '3',    unit: '',    delta: '1 critical', up: false, color: 'var(--red)' },
  { label: 'Renewable Energy',     value: '42',   unit: '%',   delta: 'Solar + grid blend', up: true, color: 'var(--green)' },
];

const SECTOR_OVERVIEW = [
  { name: 'North Concourse', crowd: 94, hvac: 100, status: 'warning', energy: 4.8 },
  { name: 'South Concourse', crowd: 12, hvac: 38,  status: 'good',    energy: 1.4 },
  { name: 'East Concourse',  crowd: 76, hvac: 88,  status: 'good',    energy: 4.0 },
  { name: 'West Concourse',  crowd: 68, hvac: 82,  status: 'good',    energy: 3.8 },
  { name: 'Pitch Zone',      crowd: 100,hvac: 95,  status: 'good',    energy: 5.1 },
];

const ALERTS_LOG = [
  { time: '74:52', type: 'critical', title: 'South HVAC Waste Detected',    msg: 'HVAC at 100% with only 12% occupancy — 2.8 MW being wasted. Auto-reducing to 38%.', sector: 'South Concourse' },
  { time: '74:30', type: 'warning',  title: 'North Zone Crowd Density',     msg: 'Density at 94%. Safety rule: maintain full ventilation. No egress restrictions.', sector: 'North Concourse' },
  { time: '73:15', type: 'info',     title: 'Peak Demand Threshold',        msg: 'Grid draw at 22.4 MW — approaching peak charge threshold. Dimming non-critical lights.', sector: 'All Sectors' },
  { time: '60:00', type: 'info',     title: 'Solar Array Output Update',    msg: 'Solar generating 9.4 MW — 42% of current stadium load. Battery bank at 78%.', sector: 'Roof Array' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const numeric = parseFloat(target);
    if (isNaN(numeric)) { setVal(target); return; }
    let start = 0, duration = 1200;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setVal((progress * numeric).toFixed(target.includes('.') ? 1 : 0));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}{suffix}</>;
}

export default function AuthorityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rosterFilter, setRosterFilter] = useState('all');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
        else router.push('/auth/login');
        setAuthLoading(false);
      })
      .catch(() => { router.push('/auth/login'); setAuthLoading(false); });
  }, [router]);

  if (authLoading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p>Loading Authority Dashboard…</p>
    </div>
  );

  if (!user) return null;

  const filteredRoster = rosterFilter === 'all' ? STAFF_ROSTER : STAFF_ROSTER.filter(s => s.status === rosterFilter);

  return (
    <>
      <PortalNav />
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* ── HERO BANNER ── */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&auto=format&fit=crop&q=80"
            alt="Stadium aerial view"
            fill
            style={{ objectFit: 'cover', opacity: 0.3 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(4,7,16,0.95) 40%, rgba(45,156,255,0.1) 100%)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className="badge badge-blue badge-live">LIVE OPERATIONS</span>
                <span className="badge badge-green">Match 75&apos;</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Authority Operations Center
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                MetLife Stadium · New York/New Jersey · FIFA World Cup
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Logged in as</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--blue)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div className="kpi-grid" style={{ padding: '16px 24px', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {KPI_DATA.map((kpi, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value" style={{ color: kpi.color }}>
                <AnimatedCounter target={kpi.value} suffix={kpi.unit} />
              </div>
              <div className={`kpi-delta${kpi.up === true ? ' up' : kpi.up === false ? ' down' : ''}`}>{kpi.delta}</div>
            </div>
          ))}
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display: 'flex', gap: 4, padding: '0 24px 0', borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'sectors',  label: '🏟️ Sectors'  },
            { id: 'roster',   label: '👷 Staff Roster' },
            { id: 'alerts',   label: '🔔 Alert Log'   },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--blue)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ flex: 1, padding: '20px 24px' }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="authority-body" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {/* Sector status summary */}
              <div>
                <div className="authority-section-title">Sector Status</div>
                {SECTOR_OVERVIEW.map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>HVAC {s.hvac}% · {s.energy} MW</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.crowd > 90 ? 'var(--red)' : s.crowd < 20 ? 'var(--amber)' : 'var(--green)' }}>
                        {s.crowd}%
                      </div>
                      <span className={`badge badge-${s.status === 'good' ? 'green' : 'amber'}`}>{s.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent alerts summary */}
              <div>
                <div className="authority-section-title">Recent Alerts</div>
                {ALERTS_LOG.slice(0, 3).map((a, i) => (
                  <div key={i} className={`alert-card ${a.type}`} style={{ marginBottom: 10 }}>
                    <div className="alert-card-header">
                      <span className="alert-card-title">{a.title}</span>
                      <span className="alert-card-time">{a.time}&apos;</span>
                    </div>
                    <div className="alert-card-desc">{a.msg}</div>
                    <div className="alert-card-sector">📍 {a.sector}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTORS TAB */}
          {activeTab === 'sectors' && (
            <div>
              <div className="authority-section-title" style={{ marginBottom: 16 }}>Live Sector Telemetry — Match 75&apos;</div>
              <div className="sector-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {SECTOR_OVERVIEW.map(s => (
                  <div key={s.name} className="card" style={{ borderColor: s.crowd > 90 ? 'var(--border-purple)' : s.crowd < 20 ? 'rgba(255,183,0,0.2)' : 'var(--border-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</span>
                      <span className={`badge badge-${s.status === 'good' ? 'green' : 'amber'}`}>{s.status.toUpperCase()}</span>
                    </div>
                    {[
                      { label: 'Crowd Density', value: `${s.crowd}%`, color: s.crowd > 90 ? 'var(--red)' : s.crowd < 20 ? 'var(--amber)' : 'var(--green)' },
                      { label: 'HVAC Load', value: `${s.hvac}%`, color: 'var(--blue)' },
                      { label: 'Energy Draw', value: `${s.energy} MW`, color: 'var(--purple)' },
                    ].map(m => (
                      <div key={m.label} className="metric-row">
                        <span className="metric-name">{m.label}</span>
                        <span className="metric-value" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                      </div>
                    ))}
                    <div className="sector-bar" style={{ marginTop: 12 }}>
                      <div className={`sector-bar-fill ${s.crowd > 90 ? 'sector-bar-red' : s.crowd < 20 ? 'sector-bar-amber' : 'sector-bar-green'}`}
                        style={{ width: `${s.crowd}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROSTER TAB */}
          {activeTab === 'roster' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', 'on-duty', 'on-break', 'alert'].map(f => (
                  <button key={f} className={`btn btn-sm btn-ghost${rosterFilter === f ? '' : ''}`}
                    style={{ borderColor: rosterFilter === f ? 'var(--blue)' : undefined, color: rosterFilter === f ? 'var(--blue)' : undefined }}
                    onClick={() => setRosterFilter(f)}>
                    {f === 'all' ? 'All Staff' : f === 'on-duty' ? '🟢 On Duty' : f === 'on-break' ? '🟡 On Break' : '🔴 Alert'}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  {filteredRoster.length} shown
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="roster-table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Sector</th>
                      <th>Status</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.map((s, i) => (
                      <tr key={i}>
                        <td>{s.name}</td>
                        <td>{s.role}</td>
                        <td>{s.sector}</td>
                        <td>
                          <span className={`status-dot ${s.status}`}>
                            {s.status === 'on-duty' ? 'On Duty' : s.status === 'on-break' ? 'On Break' : '⚠️ Alert'}
                          </span>
                        </td>
                        <td>{s.lastSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div>
              <div className="authority-section-title" style={{ marginBottom: 16 }}>System Alert Log — Last 90 Minutes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ALERTS_LOG.map((a, i) => (
                  <div key={i} className={`alert-card ${a.type}`}>
                    <div className="alert-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge badge-${a.type === 'critical' ? 'red' : a.type === 'warning' ? 'amber' : 'blue'}`}>
                          {a.type.toUpperCase()}
                        </span>
                        <span className="alert-card-title">{a.title}</span>
                      </div>
                      <span className="alert-card-time">Min {a.time}</span>
                    </div>
                    <div className="alert-card-desc" style={{ marginTop: 8 }}>{a.msg}</div>
                    <div className="alert-card-sector" style={{ marginTop: 6 }}>📍 {a.sector}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="app-footer">
          <div className="footer-rule">🛡️ Authority Operations Center — Read-only telemetry view. Commands issued via Ops Engine.</div>
          <div className="footer-meta">EcoPulse Stadium v2.0 · FIFA World Cup</div>
        </footer>
      </div>
      <ChatBot />
    </>
  );
}
