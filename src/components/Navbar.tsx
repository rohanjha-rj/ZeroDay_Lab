'use client';
import { Bell, Search, Wifi, ShieldAlert, Cpu } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useProgressStore } from '@/lib/progressStore';
import { useEffect, useState } from 'react';

const LIVE_EVENTS = [
  '🔴 SQL Injection detected on /api/login',
  '🟡 XSS attempt blocked at /search',
  '🔴 Brute force: 47 failed logins on admin account',
  '🟠 Suspicious file upload: shell.php.jpg',
  '🔴 SSRF to 169.254.169.254 blocked',
  '🟡 Unusual JWT: alg:none detected',
  '🔴 CSRF attack on /bank/transfer',
  '🟠 Command injection in ping utility',
];

export default function Navbar() {
  const { xp, getRank, getProgressPercent } = useProgressStore();
  const rank = getRank();
  const progress = getProgressPercent();
  const [eventIdx, setEventIdx] = useState(0);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setEventIdx((i) => (i + 1) % LIVE_EVENTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  if (!mounted) {
    // Provide a stable, icon-free or default version for SSR/Hydration
    return (
      <header
        style={{
          height: 56,
          background: 'rgba(10,20,40,0.95)',
          borderBottom: '1px solid rgba(0,255,136,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <div style={{ paddingLeft: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
        </div>
        <div style={{ flex: 1 }} />
      </header>
    );
  }

  return (
    <header
      style={{
        height: 56,
        background: 'rgba(10,20,40,0.95)',
        borderBottom: '1px solid rgba(0,255,136,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          placeholder="Search labs, payloads, CVEs..."
          className="cyber-input"
          style={{ paddingLeft: 32, height: 32, fontSize: 12 }}
        />
      </div>

      {/* Live Event Ticker */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,51,102,0.15)',
          borderRadius: 6,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ShieldAlert size={12} style={{ color: 'var(--neon-red)', flexShrink: 0 }} />
        <span
          key={eventIdx}
          style={{
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-secondary)',
            animation: 'fadeIn 0.5s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {LIVE_EVENTS[eventIdx]}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>LIVE</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* System status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={14} style={{ color: 'var(--neon-cyan)' }} />
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{time}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wifi size={14} style={{ color: 'var(--neon-green)' }} />
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--neon-green)' }}>SECURE</span>
        </div>

        {/* Bell */}
        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 8, height: 8, background: 'var(--neon-red)',
            borderRadius: '50%', border: '1px solid var(--bg-primary)',
          }} />
        </button>

        {/* XP + Rank */}
        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 8,
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {(() => {
              const Icon = (LucideIcons as any)[rank.icon] || LucideIcons.User;
              return <Icon size={18} color={rank.color} />;
            })()}
          </span>
          <div>
            <div style={{ fontSize: 10, color: rank.color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
              {rank.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="xp-bar" style={{ width: 60 }}>
                <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--neon-green)' }}>{xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
