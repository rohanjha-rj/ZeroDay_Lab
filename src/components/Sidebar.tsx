'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, Terminal, LayoutDashboard, Trophy, User,
  ChevronRight, Zap, Lock, Globe, Upload,
  Database, Code2, Server, UserX, Swords
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
      { label: 'Multiplayer', href: '/multiplayer', icon: Swords },
    ],
  },
  {
    title: 'Attack Labs',
    items: [
      { label: 'XSS Attack', href: '/labs/xss', icon: Code2, severity: 'high', color: '#f59e0b' },
      { label: 'SQL Injection', href: '/labs/sqli', icon: Database, severity: 'critical', color: '#ef4444' },
      { label: 'CSRF Attack', href: '/labs/csrf', icon: Globe, severity: 'high', color: '#3b82f6' },
      { label: 'Broken Auth', href: '/labs/broken-auth', icon: Lock, severity: 'critical', color: '#8b5cf6' },
      { label: 'File Upload', href: '/labs/file-upload', icon: Upload, severity: 'critical', color: '#f97316' },
    ],
  },
  {
    title: 'Advanced Labs',
    items: [
      { label: 'SSRF', href: '/labs/ssrf', icon: Server, severity: 'critical', color: '#10b981' },
      { label: 'Cmd Injection', href: '/labs/command-injection', icon: Terminal, severity: 'critical', color: '#ef4444' },
      { label: 'IDOR', href: '/labs/idor', icon: UserX, severity: 'high', color: '#8b5cf6' },
    ],
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#f97316',
  low: '#3b82f6',
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 220, background: 'var(--bg-glass)', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}
      className="flex flex-col h-full overflow-y-auto py-4"
    >
      {/* Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div style={{ background: 'var(--accent-gradient)', borderRadius: 8, padding: 6 }}>
            <Shield size={18} color="#050a10" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
              ZERODAY
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              ATTACK LAB
            </div>
          </div>
        </div>
      </div>

      {/* Nav Sections */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-4">
          <div
            className="px-4 mb-1"
            style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {section.title}
          </div>
          <div className="px-2 flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const sev = (item as { severity?: string }).severity;
              return (
                <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                  <Icon size={15} style={{ color: isActive ? 'var(--neon-green)' : (item as { color?: string }).color ?? 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
                  {sev && !isActive && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: SEVERITY_COLORS[sev] ?? 'var(--text-muted)',
                    }} />
                  )}
                  {isActive && <ChevronRight size={12} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom status */}
      <div className="mt-auto px-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="status-dot online" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>LAB ACTIVE</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Environment: <span style={{ color: 'var(--neon-green)' }}>Sandboxed</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Status: <span style={{ color: 'var(--neon-green)' }}>Safe Mode ON</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Zap size={10} style={{ color: 'var(--neon-yellow)' }} />
          <span style={{ fontSize: 10, color: 'var(--neon-yellow)', fontFamily: 'JetBrains Mono' }}>8 LABS AVAILABLE</span>
        </div>
      </div>
    </aside>
  );
}
