'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LABS, RANKS, BADGES } from '@/lib/labData';
import { useProgressStore } from '@/lib/progressStore';
import {
  Shield, Zap, Target, Award, TrendingUp,
  Clock, ChevronRight, Activity, Lock, Globe,
  Database, Code2, Upload, Server, Terminal, UserX
} from 'lucide-react';

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#ff3366',
  High: '#ff6600',
  Medium: '#ffcc00',
  Low: '#00d4ff',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  XSS: Code2,
  Injection: Database,
  CSRF: Globe,
  Auth: Lock,
  Upload: Upload,
  SSRF: Server,
  RCE: Terminal,
  IDOR: UserX,
};

const LIVE_THREATS = [
  { time: '00:00:12', msg: 'XSS payload injected in /search endpoint', sev: 'High' },
  { time: '00:00:31', msg: 'SQL injection attempt on login API', sev: 'Critical' },
  { time: '00:01:04', msg: 'CSRF forged bank transfer detected', sev: 'High' },
  { time: '00:01:47', msg: 'Malicious file upload: shell.php.jpg', sev: 'Critical' },
  { time: '00:02:18', msg: 'SSRF to AWS metadata endpoint', sev: 'Critical' },
  { time: '00:03:05', msg: 'Command injection via ping utility', sev: 'Critical' },
];

export default function Dashboard() {
  const { xp, completedLabs, earnedBadges, totalAttacks, getRank, getProgressPercent, getXPToNextRank } = useProgressStore();
  const rank = getRank();
  const progress = getProgressPercent();
  const xpToNext = getXPToNextRank();

  const [counter, setCounter] = useState({ attacks: 0, labs: 0, xp: 0 });
  const [threatIdx, setThreatIdx] = useState(0);
  const [glitchText, setGlitchText] = useState('CYBERSEC LAB');

  // Animate counters
  useEffect(() => {
    const target = { attacks: 24187, labs: 8, xp };
    const dur = 1500;
    const steps = 60;
    const interval = dur / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const ease = 1 - Math.pow(1 - t, 3);
      setCounter({
        attacks: Math.round(target.attacks * ease),
        labs: Math.round(target.labs * ease),
        xp: Math.round(target.xp * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [xp]);

  // Rotate live threats
  useEffect(() => {
    const t = setInterval(() => setThreatIdx((i) => (i + 1) % LIVE_THREATS.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Glitch effect
  useEffect(() => {
    const chars = '!@#$%^&*<>?/\\|';
    let frame = 0;
    const text = 'CYBERSEC LAB';
    const t = setInterval(() => {
      if (frame < 12) {
        const glitched = text.split('').map((c, i) =>
          Math.random() < 0.3 ? chars[Math.floor(Math.random() * chars.length)] : c
        ).join('');
        setGlitchText(glitched);
        frame++;
      } else {
        setGlitchText(text);
        frame = 0;
      }
    }, 100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* Hero */}
      <div
        style={{
          marginBottom: 28,
          padding: 32,
          background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,212,255,0.05) 50%, rgba(168,85,247,0.05) 100%)',
          border: '1px solid rgba(0,255,136,0.1)',
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* BG pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,255,136,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,212,255,0.08) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Shield size={28} style={{ color: 'var(--neon-green)' }} />
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono',
                    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {glitchText}
                </h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, lineHeight: 1.6 }}>
                A virtual cybersecurity lab where you safely simulate real-world attacks —{' '}
                <span style={{ color: 'var(--neon-green)' }}>XSS, SQL Injection, CSRF</span>, and more.
                Learn ethical hacking with real-time visualization and AI guidance.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <Link href="/labs/sqli">
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} />
                    Start Hacking
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={14} />
                    My Progress
                  </button>
                </Link>
              </div>
            </div>

            {/* Rank Card */}
            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${rank.color}33`,
                borderRadius: 12,
                padding: '16px 22px',
                minWidth: 200,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 4 }}>{rank.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: rank.color, fontFamily: 'JetBrains Mono' }}>
                {rank.name}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', margin: '8px 0 4px' }}>
                {xp.toLocaleString()} XP
              </div>
              <div className="xp-bar" style={{ margin: '6px 0' }}>
                <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              {xpToNext > 0 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  {xpToNext} XP to next rank
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Global Attacks', value: counter.attacks.toLocaleString(), icon: Activity, color: '#ff3366', sub: 'simulated today' },
          { label: 'Labs Available', value: `${counter.labs}`, icon: Target, color: '#00d4ff', sub: 'attack scenarios' },
          { label: 'Your XP', value: counter.xp.toLocaleString(), icon: Zap, color: '#00ff88', sub: `${completedLabs.length} labs done` },
          { label: 'Badges Earned', value: `${earnedBadges.length}/${BADGES.length}`, icon: Award, color: '#a855f7', sub: 'achievements' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card glass-card-hover" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                  {stat.label}
                </span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: 'JetBrains Mono' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 28 }}>
        {/* Labs grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
              🧪 Attack Labs
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{LABS.length} scenarios</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {LABS.map((lab) => {
              const Icon = CATEGORY_ICONS[lab.category] ?? Shield;
              const isCompleted = completedLabs.some((c) => c.labId === lab.id);
              return (
                <Link key={lab.id} href={`/labs/${lab.slug}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="glass-card glass-card-hover"
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      borderColor: isCompleted ? 'rgba(0,255,136,0.3)' : undefined,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isCompleted && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,255,136,0.15)',
                        border: '1px solid rgba(0,255,136,0.3)',
                        borderRadius: 20,
                        padding: '1px 8px',
                        fontSize: 9,
                        color: 'var(--neon-green)',
                        fontFamily: 'JetBrains Mono',
                      }}>✓ DONE</div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: `${lab.color}15`,
                        border: `1px solid ${lab.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}>
                        {lab.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{lab.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lab.subtitle}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {lab.description.slice(0, 80)}...
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span
                          className="badge"
                          style={{
                            background: `${SEVERITY_COLOR[lab.severity]}15`,
                            color: SEVERITY_COLOR[lab.severity],
                            border: `1px solid ${SEVERITY_COLOR[lab.severity]}30`,
                          }}
                        >
                          {lab.severity}
                        </span>
                        <span className="badge badge-cyan">{lab.difficulty}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
                        <Zap size={11} />
                        {lab.xpReward} XP
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live threat feed */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className="status-dot danger" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-red)', fontFamily: 'JetBrains Mono' }}>
                LIVE THREAT FEED
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LIVE_THREATS.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: i === threatIdx ? 'rgba(255,51,102,0.08)' : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${i === threatIdx ? 'rgba(255,51,102,0.2)' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{t.time}</span>
                    <span style={{
                      fontSize: 9,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: `${SEVERITY_COLOR[t.sev]}15`,
                      color: SEVERITY_COLOR[t.sev],
                      fontFamily: 'JetBrains Mono',
                    }}>
                      {t.sev}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.msg}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent badges */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 12 }}>
              🏆 BADGES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {BADGES.map((badge) => {
                const earned = earnedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.description}`}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderRadius: 8,
                      background: earned ? 'rgba(0,255,136,0.08)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${earned ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.04)'}`,
                      filter: earned ? 'none' : 'grayscale(1) opacity(0.3)',
                      transition: 'all 0.3s',
                      cursor: 'help',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{badge.icon}</div>
                    <div style={{ fontSize: 8, color: earned ? 'var(--neon-green)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', lineHeight: 1.2 }}>
                      {badge.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick tip */}
          <div
            style={{
              padding: 14,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.05))',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', marginBottom: 6, fontFamily: 'JetBrains Mono' }}>
              💡 MENTOR TIP
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Start with <strong style={{ color: 'var(--neon-yellow)' }}>SQL Injection</strong> — it's the #1 exploited vulnerability. Try{' '}
              <code style={{ background: 'rgba(0,0,0,0.5)', padding: '0 4px', borderRadius: 3, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#a8ff78' }}>
                {`' OR 1=1 --`}
              </code>{' '}
              in the login form!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
