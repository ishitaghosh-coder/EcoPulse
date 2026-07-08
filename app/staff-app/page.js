'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalNav from '@/components/PortalNav';
import ChatBot from '@/components/ChatBot';

const ROLE_ALERTS = {
  'Security Officer': [
    { title: 'North Concourse — Crowd Density Critical', msg: 'Density at 94%. Ensure all emergency exits clear. Do not restrict movement.', type: 'critical', time: '74:30', sector: 'North Concourse' },
    { title: 'Gate C Queue Building', msg: 'Open auxiliary lane immediately. Estimated 400 fans waiting.', type: 'warning', time: '16:28', sector: 'Gate C' },
  ],
  'Cleaning Crew': [
    { title: 'South Concourse — Post-Interval Sweep', msg: 'South at 12% occupancy. Good window for rapid waste collection round.', type: 'info', time: '74:00', sector: 'South Concourse' },
    { title: 'West Concourse Bin B4 — Full', msg: 'Bin B4 requires immediate collection. Overflow risk.', type: 'warning', time: '71:15', sector: 'West Concourse' },
  ],
  'Medical Staff': [
    { title: 'Standby — North Concourse', msg: 'High density in North. Station medic team at checkpoint N-7.', type: 'warning', time: '74:30', sector: 'North Concourse' },
    { title: 'Heat Protocol Active', msg: 'Ambient temp 28°C. Monitor fans for heat exhaustion in sunny concourses.', type: 'info', time: '70:00', sector: 'East Concourse' },
  ],
  'Event Volunteer': [
    { title: 'Information Booth Override', msg: 'Redirect general enquiries to digital kiosks — high traffic at booth 3.', type: 'info', time: '73:00', sector: 'North Concourse' },
    { title: 'VIP Area Assistance Requested', msg: 'Box level 4 requires volunteer for accessibility assistance.', type: 'warning', time: '70:45', sector: 'VIP Level' },
  ],
  'Tech Support': [
    { title: '⚠️ Sensor Fault — West Zone', msg: 'Crowd density sensor WC-09 offline. Manual headcount requested.', type: 'critical', time: 'Just now', sector: 'West Concourse' },
    { title: 'HVAC Network Latency', msg: 'Control latency elevated to 340ms. Within tolerance but monitor.', type: 'info', time: '68:00', sector: 'South Concourse' },
  ],
  'Facilities': [
    { title: 'HVAC — South Concourse Reduction Active', msg: 'Auto-reducing to 38% from 100% — occupancy only 12%. Monitor comfort level.', type: 'info', time: '74:52', sector: 'South Concourse' },
    { title: 'Pre-Match Pitch HVAC Setpoint', msg: 'Verify pitch HVAC setpoint 21°C before kickoff. Confirmed or escalate.', type: 'warning', time: '16:15', sector: 'Pitch Zone' },
  ],
};

const ROLE_OPTIONS = Object.keys(ROLE_ALERTS);

const SECTOR_STATUS = [
  { name: 'North', crowd: 94, color: 'var(--red)',    status: 'DENSE' },
  { name: 'South', crowd: 12, color: 'var(--amber)',  status: 'LIGHT' },
  { name: 'East',  crowd: 76, color: 'var(--green)',  status: 'OK'    },
  { name: 'West',  crowd: 68, color: 'var(--green)',  status: 'OK'    },
  { name: 'Pitch', crowd: 100,color: 'var(--purple)', status: 'FULL'  },
];

export default function StaffAppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Security Officer');
  const [checkedAlerts, setCheckedAlerts] = useState({});

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
      <p>Loading Staff App…</p>
    </div>
  );

  if (!user) return null;

  const alerts = ROLE_ALERTS[selectedRole] || [];

  function toggleAlert(i) {
    setCheckedAlerts(prev => ({ ...prev, [selectedRole + i]: !prev[selectedRole + i] }));
  }

  return (
    <>
      <PortalNav />
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(155,109,255,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                EcoPulse Staff App
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {user.name} 👋
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 600, marginTop: 2 }}>Match in progress · 75&apos;</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(0,232,124,0.1)', border: '1px solid rgba(0,232,124,0.2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 1.5s infinite' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)' }}>ON SHIFT</span>
            </div>
          </div>

          {/* Sector status mini bar */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SECTOR_STATUS.map(s => (
              <div key={s.name} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: s.color }}>{s.crowd}%</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role selector */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Your Role
          </label>
          <select
            className="form-select"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            style={{ background: 'rgba(155,109,255,0.08)', borderColor: 'rgba(155,109,255,0.2)', color: 'var(--text-primary)' }}
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Alerts feed */}
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Your Alerts
            </div>
            <span className={`badge badge-${alerts.some(a => a.type === 'critical') ? 'red' : 'amber'}`}>
              {alerts.length} active
            </span>
          </div>

          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              ✅ No alerts for your role right now
            </div>
          )}

          <div className="alert-feed">
            {alerts.map((a, i) => {
              const key = selectedRole + i;
              const done = checkedAlerts[key];
              return (
                <div key={key} className={`alert-card ${a.type}`} style={{ opacity: done ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                  <div className="alert-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge badge-${a.type === 'critical' ? 'red' : a.type === 'warning' ? 'amber' : 'blue'}`}>
                        {a.type.toUpperCase()}
                      </span>
                      <span className="alert-card-title">{a.title}</span>
                    </div>
                    <span className="alert-card-time">{a.time}&apos;</span>
                  </div>
                  <div className="alert-card-desc">{a.msg}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <span className="alert-card-sector">📍 {a.sector}</span>
                    <button
                      className={`btn btn-sm ${done ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ padding: '5px 14px', fontSize: '0.7rem' }}
                      onClick={() => toggleAlert(i)}
                    >
                      {done ? '↩ Reopen' : '✓ Mark Done'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety reminder footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'rgba(255,183,0,0.04)', fontSize: '0.7rem', color: 'var(--amber)', textAlign: 'center', letterSpacing: '0.02em' }}>
          🛡️ Safety first — fan wellbeing always overrides all other priorities
        </div>
      </div>
      <ChatBot />
    </>
  );
}
