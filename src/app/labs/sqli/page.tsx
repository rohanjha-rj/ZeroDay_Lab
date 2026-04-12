'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateSQLi } from '@/lib/attackEngine';

function SQLiTargetApp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<null | 'trying' | 'blocked'>(null);

  const USERS_TABLE = [
    { id: 1, username: 'admin', role: 'superadmin' },
    { id: 2, username: 'alice', role: 'user' },
    { id: 3, username: 'bob', role: 'user' },
  ];

  return (
    <div>
      {/* Browser bar */}
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://vulnerable-bank.com/login
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ maxWidth: 380, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🏛️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>SecureBank Login</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter your credentials</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="cyber-input"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="cyber-input"
              />
            </div>

            <button
              onClick={() => setLoginStatus('trying')}
              className="btn-primary"
              style={{ width: '100%', marginTop: 4 }}
            >
              Login →
            </button>

            {loginStatus === 'trying' && (
              <div style={{ padding: 10, background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 8, fontSize: 12, color: '#ff3366', textAlign: 'center' }}>
                ⚠️ Invalid credentials. Use an SQLi payload above!
              </div>
            )}
          </div>
        </div>

        {/* Visible SQL query (educational) */}
        <div style={{ marginTop: 16, padding: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 8, border: '1px solid rgba(255,153,0,0.15)' }}>
          <div style={{ fontSize: 9, color: '#ff9900', fontFamily: 'JetBrains Mono', marginBottom: 5 }}>⚠️ VULNERABLE BACKEND CODE (exposed for learning)</div>
          <code style={{ fontSize: 11, color: '#ff9966', fontFamily: 'JetBrains Mono' }}>
            {`$query = "SELECT * FROM users WHERE username='${username || 'INPUT'}' AND password='${password || '...'}'"}`}
          </code>
        </div>

        {/* DB Schema */}
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>DATABASE SCHEMA (users table)</div>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['id', 'username', 'password', 'role'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', color: 'var(--neon-cyan)', padding: '2px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS_TABLE.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '3px 8px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{u.id}</td>
                  <td style={{ padding: '3px 8px', color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>{u.username}</td>
                  <td style={{ padding: '3px 8px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>$2b$10$****</td>
                  <td style={{ padding: '3px 8px', color: '#ffcc00', fontFamily: 'JetBrains Mono' }}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SQLiLab() {
  return (
    <LabLayout
      labSlug="sqli"
      targetApp={<SQLiTargetApp />}
      extraInput={{ label: 'Password', placeholder: 'Enter password...' }}
      simulate={(payload, extra) => simulateSQLi(payload, extra)}
    />
  );
}
