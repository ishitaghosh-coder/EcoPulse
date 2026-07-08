'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PortalNav from '@/components/PortalNav';
import ChatBot from '@/components/ChatBot';

// ── TELEMETRY DATA (from existing telemetry.js logic) ───────────
const SCENARIOS = {
  prematch: {
    label: 'Pre-Match',
    time: '16:30',
    desc: 'Stadium filling. Gates open. Concourses at 40% capacity.',
    sectors: [
      { name: 'North Concourse', crowd: 38, hvac: 65, energy: 2.1, status: 'good' },
      { name: 'South Concourse', crowd: 22, hvac: 55, energy: 1.8, status: 'good' },
      { name: 'East Concourse',  crowd: 31, hvac: 60, energy: 2.0, status: 'good' },
      { name: 'West Concourse',  crowd: 29, hvac: 58, energy: 1.9, status: 'good' },
      { name: 'Pitch Zone',      crowd: 5,  hvac: 70, energy: 3.2, status: 'good' },
    ],
    score: 82,
    alerts: [
      { role: 'Gate Steward',    time: '16:28', msg: 'Gate C queues building — open auxiliary lane', sector: 'North Concourse' },
      { role: 'Facilities',      time: '16:15', msg: 'Verify pitch HVAC setpoint 21°C before kickoff', sector: 'Pitch Zone' },
    ],
    commands: [
      { icon: '❄️', text: '<strong>Set North HVAC</strong> to 72% — crowd density projected 65%' },
      { icon: '💡', text: '<strong>Concourse lighting</strong> ramping to 95% — pre-match mode activated' },
      { icon: '⚡', text: '<strong>Solar array</strong> supplementing grid — 41% renewable share active' },
    ],
  },
  minute75: {
    label: '75th Minute',
    time: '75\'',
    desc: 'Peak match intensity. North Concourse near capacity. South near-empty.',
    sectors: [
      { name: 'North Concourse', crowd: 94, hvac: 100, energy: 4.8, status: 'warning' },
      { name: 'South Concourse', crowd: 12, hvac: 100, energy: 4.8, status: 'danger' },
      { name: 'East Concourse',  crowd: 76, hvac: 88,  energy: 4.0, status: 'good' },
      { name: 'West Concourse',  crowd: 68, hvac: 82,  energy: 3.8, status: 'good' },
      { name: 'Pitch Zone',      crowd: 100,hvac: 95,  energy: 5.1, status: 'good' },
    ],
    score: 87,
    alerts: [
      { role: 'HVAC Supervisor', time: '74:52', msg: '⚠️ South Concourse HVAC at 100% — only 12% occupancy. Reduce to 40%', sector: 'South Concourse' },
      { role: 'Safety Officer',  time: '74:30', msg: 'North Concourse crush risk at 94% — do NOT reduce egress ventilation', sector: 'North Concourse' },
      { role: 'Energy Manager',  time: '73:15', msg: 'Grid draw 22.4 MW — peak demand charge. Optimize non-critical zones', sector: 'All Sectors' },
    ],
    commands: [
      { icon: '❄️', text: '<strong>SAFETY OVERRIDE</strong> — North Concourse HVAC stays at 100%. Fan safety takes priority.' },
      { icon: '🔻', text: '<strong>South HVAC → 38%</strong> — 12% occupancy does not justify full load. Saving 2.8 MW.' },
      { icon: '⚡', text: '<strong>Non-critical lighting</strong> dimmed 20% — reducing peak demand by 1.2 MW.' },
      { icon: '📡', text: '<strong>East/West HVAC</strong> adjusted to match real-time density. Saving 0.9 MW combined.' },
    ],
  },
  postmatch: {
    label: 'Post-Match Egress',
    time: '90\'+',
    desc: 'Crowds exiting. Egress fans maintain full ventilation. Non-egress areas powering down.',
    sectors: [
      { name: 'North Concourse', crowd: 82, hvac: 100, energy: 4.8, status: 'warning' },
      { name: 'South Concourse', crowd: 44, hvac: 78,  energy: 3.4, status: 'good' },
      { name: 'East Concourse',  crowd: 38, hvac: 70,  energy: 3.0, status: 'good' },
      { name: 'West Concourse',  crowd: 29, hvac: 60,  energy: 2.4, status: 'good' },
      { name: 'Pitch Zone',      crowd: 8,  hvac: 30,  energy: 1.2, status: 'good' },
    ],
    score: 91,
    alerts: [
      { role: 'Safety Officer',  time: '90:05', msg: '🚨 Egress corridors — NEVER reduce ventilation during active crowd flow', sector: 'All Egress' },
      { role: 'Facilities',      time: '89:50', msg: 'Pitch and media areas can begin power-down sequence', sector: 'Pitch Zone' },
    ],
    commands: [
      { icon: '🛡️', text: '<strong>SAFETY RULE:</strong> All egress corridor HVAC locked at maximum until crowd < 10%.' },
      { icon: '💡', text: '<strong>Pitch lighting</strong> off — saving 3.8 MW immediately.' },
      { icon: '❄️', text: '<strong>West/East HVAC</strong> reducing as crowds thin — auto-proportional control.' },
      { icon: '♻️', text: '<strong>Waste collection</strong> vehicles dispatched to all 5 sectors — post-match sweep.' },
    ],
  },
  datagap: {
    label: 'Data Gap',
    time: '60\'',
    desc: 'Sensor telemetry interrupted. Operating on last-known values + conservative defaults.',
    sectors: [
      { name: 'North Concourse', crowd: null, hvac: 90, energy: 4.2, status: 'warning' },
      { name: 'South Concourse', crowd: null, hvac: 90, energy: 4.2, status: 'warning' },
      { name: 'East Concourse',  crowd: null, hvac: 90, energy: 4.2, status: 'warning' },
      { name: 'West Concourse',  crowd: null, hvac: 90, energy: 4.2, status: 'warning' },
      { name: 'Pitch Zone',      crowd: 100, hvac: 95,  energy: 5.0, status: 'good' },
    ],
    score: 70,
    alerts: [
      { role: 'Tech Support',    time: '59:42', msg: '📡 Sensor network offline — telemetry feed interrupted', sector: 'All Sectors' },
      { role: 'Safety Officer',  time: '59:40', msg: 'All HVAC defaulting to 90% max until sensors restored — safety-first', sector: 'All Sectors' },
    ],
    commands: [
      { icon: '📡', text: '<strong>DATA GAP PROTOCOL ACTIVE</strong> — Conservative defaults applied to all sectors.' },
      { icon: '⚠️', text: '<strong>All HVAC → 90%</strong> — Over-provision until sensor data restored.' },
      { icon: '🔔', text: '<strong>Manual headcount</strong> requested — ground staff deploying to all concourses.' },
      { icon: '🔧', text: '<strong>Tech team alerted</strong> — sensor restoration estimated 8 minutes.' },
    ],
  },
};

function ScoreRing({ score }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? 'var(--green)' : score >= 70 ? 'var(--amber)' : 'var(--red)';
  return (
    <div className="score-ring-wrapper">
      <svg className="score-ring-svg" viewBox="0 0 76 76">
        <circle className="score-ring-bg" cx="38" cy="38" r={r} />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s' }} />
      </svg>
      <div className="score-ring-text">
        <div className="score-value" style={{ color }}>{score}</div>
        <div className="score-label">SCORE</div>
      </div>
    </div>
  );
}

function SectorCard({ sector }) {
  const crowdColor = sector.crowd === null ? 'var(--amber)'
    : sector.crowd > 90 ? 'var(--red)'
    : sector.crowd > 70 ? 'var(--amber)'
    : 'var(--green)';
  const barClass = sector.status === 'danger' ? 'sector-bar-red' : sector.status === 'warning' ? 'sector-bar-amber' : 'sector-bar-green';
  return (
    <div className="sector-card">
      <div className="sector-card-header">
        <span className="sector-name">{sector.name}</span>
        <span className={`badge badge-${sector.status === 'good' ? 'green' : sector.status === 'warning' ? 'amber' : 'red'}`}>
          {sector.status === 'good' ? 'OK' : sector.status === 'warning' ? 'WARN' : 'HIGH'}
        </span>
      </div>
      <div className="sector-value" style={{ color: crowdColor }}>
        {sector.crowd === null ? '–– %' : `${sector.crowd}%`}
      </div>
      <div className="sector-label">Crowd Density</div>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <span>HVAC {sector.hvac}%</span>
        <span>{sector.energy} MW</span>
      </div>
      <div className="sector-bar">
        <div className={`sector-bar-fill ${barClass}`} style={{ width: `${sector.crowd ?? sector.hvac}%` }} />
      </div>
    </div>
  );
}

export default function OpsEnginePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scenario, setScenario] = useState('minute75');

  const sc = SCENARIOS[scenario];

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
      <p>Authenticating…</p>
    </div>
  );

  if (!user) return null;

  return (
    <>
      <PortalNav />
      <div style={{ minHeight: '100dvh' }}>
        {/* ── HEADER ── */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#050810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12"/><path d="M5 3s.55 7.07 3.5 9.5S17 14 17 14"/>
                  <path d="M19 3s-.55 7.07-3.5 9.5S7 14 7 14"/><line x1="12" y1="12" x2="8" y2="17"/>
                </svg>
              </div>
              <span className="logo-text">EcoPulse<span>Stadium</span></span>
            </div>
            <div className="venue-pill">MetLife Stadium · NY/NJ</div>
          </div>
          <div className="header-center">
            <div className="match-clock">
              <div className="clock-label">Match Time</div>
              <div className="clock-value">{sc.time}</div>
            </div>
            <ScoreRing score={sc.score} />
          </div>
          <div className="header-right">
            <div className="live-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 1.5s infinite', display: 'inline-block' }} />
              Live Monitoring
            </div>
            <div className="safety-badge">🛡️ Safety Rule Active</div>
          </div>
        </header>

        {/* ── SCENARIO CONTROLS ── */}
        <div className="controls-bar">
          <span className="controls-label">Scenario →</span>
          <div className="scenario-tabs">
            {Object.entries(SCENARIOS).map(([id, s]) => (
              <button key={id} className={`scenario-tab${scenario === id ? ' active' : ''}`} onClick={() => setScenario(id)}>
                {id === 'prematch' ? '⚽' : id === 'minute75' ? '🔥' : id === 'postmatch' ? '🚪' : '📡'} {s.label}
              </button>
            ))}
          </div>
          <div className="scenario-desc">{sc.desc}</div>
        </div>

        {/* ── MAIN ── */}
        <main className="main-content">
          {/* Sector Grid */}
          <div className="sector-grid">
            {sc.sectors.map(s => <SectorCard key={s.name} sector={s} />)}
          </div>

          {/* Three panels */}
          <div className="output-grid">
            {/* Panel 1 — Organizer Metrics */}
            <article className="output-panel organizer-panel">
              <div className="panel-header">
                <span className="panel-icon">📊</span>
                <h2 className="panel-title">Organizer Sustainability Metrics</h2>
                <span className="panel-badge badge-green">Score: {sc.score}</span>
              </div>
              <div className="panel-content">
                {sc.sectors.map(s => (
                  <div key={s.name} className="metric-row">
                    <span className="metric-name">{s.name}</span>
                    <span className={`metric-value ${s.status}`}>HVAC {s.hvac}% · {s.energy}MW</span>
                  </div>
                ))}
                <div className="metric-row">
                  <span className="metric-name">Sustainability Score</span>
                  <span className={`metric-value ${sc.score >= 85 ? 'good' : sc.score >= 70 ? 'warning' : 'danger'}`}>{sc.score}/100</span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Total Energy Draw</span>
                  <span className="metric-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {sc.sectors.reduce((a, s) => a + s.energy, 0).toFixed(1)} MW
                  </span>
                </div>
              </div>
            </article>

            {/* Panel 2 — Staff Alerts */}
            <article className="output-panel alerts-panel">
              <div className="panel-header">
                <span className="panel-icon">🔔</span>
                <h2 className="panel-title">Ground Staff Alerts</h2>
                <span className="panel-badge badge-amber">{sc.alerts.length} alerts</span>
              </div>
              <div className="panel-content">
                {sc.alerts.map((a, i) => (
                  <div key={i} className="alert-item">
                    <div className="alert-header">
                      <span className="alert-role">{a.role}</span>
                      <span className="alert-time">{a.time}</span>
                    </div>
                    <div className="alert-msg">{a.msg}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>📍 {a.sector}</div>
                  </div>
                ))}
              </div>
            </article>

            {/* Panel 3 — Utility Commands */}
            <article className="output-panel utility-panel">
              <div className="panel-header">
                <span className="panel-icon">⚡</span>
                <h2 className="panel-title">Automated Utility Commands</h2>
                <span className="panel-badge badge-blue">{sc.commands.length} commands</span>
              </div>
              <div className="panel-content">
                {sc.commands.map((c, i) => (
                  <div key={i} className="cmd-item">
                    <span className="cmd-icon">{c.icon}</span>
                    <span className="cmd-text" dangerouslySetInnerHTML={{ __html: c.text }} />
                  </div>
                ))}
              </div>
            </article>
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-rule">
            🛡️ SAFETY PRIORITY RULE ENFORCED — Fan &amp; staff safety always overrides sustainability optimizations.
          </div>
          <div className="footer-meta">EcoPulse Stadium v2.0 · FIFA World Cup</div>
        </footer>
      </div>
      <ChatBot />
    </>
  );
}
