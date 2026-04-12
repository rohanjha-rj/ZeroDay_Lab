'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateBrokenAuth } from '@/lib/attackEngine';

function BrokenAuthTargetApp() {
  const [tab, setTab] = useState<'bruteforce' | 'jwt' | 'cookie'>('bruteforce');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [jwtToken, setJwtToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidXNlcjEyMyIsInJvbGUiOiJ1c2VyIn0.SxAoMcq7xVZjPBlOx8WcQk');
  const [cookieVal, setCookieVal] = useState('user=user123; role=user; remember=1');

  return (
    <div>
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://auth-vulnerable.com
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['bruteforce', 'jwt', 'cookie'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`cyber-tab ${tab === t ? 'active' : ''}`} style={{ fontSize: 11 }}>
              {t === 'bruteforce' ? '🔨 Brute Force' : t === 'jwt' ? '🎫 JWT Bypass' : '🍪 Cookie Tamper'}
            </button>
          ))}
        </div>

        {tab === 'bruteforce' && (
          <div>
            <div style={{ padding: 10, background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.1)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
              ⚠️ No rate limiting! No account lockout! Brute force at will.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, margin: '0 auto' }}>
              <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Username" className="cyber-input" />
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="cyber-input" />
              <button onClick={() => setAttempts(a => a + 1)} className="btn-danger" style={{ width: '100%' }}>
                Try Login
              </button>
              {attempts > 0 && (
                <div style={{ padding: 8, background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 6, fontSize: 11, color: '#ffcc00', textAlign: 'center' }}>
                  Attempts: {attempts} — No lockout mechanism! → Use payload " admin:password123"
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'jwt' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              🎫 Current JWT token (modify the header to set <code style={{ color: '#a8ff78', fontFamily: 'JetBrains Mono', fontSize: 11 }}>alg:none</code>):
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>HEADER (base64)</div>
              <div style={{ padding: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#ff9966', wordBreak: 'break-all' }}>
                {jwtToken.split('.')[0]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 6, marginBottom: 4 }}>PAYLOAD (base64)</div>
              <div style={{ padding: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#a8ff78', wordBreak: 'break-all' }}>
                {jwtToken.split('.')[1]}
              </div>
              <div style={{ fontSize: 10, color: '#a855f7', marginTop: 4, fontFamily: 'JetBrains Mono' }}>Decoded: {`{"user":"user123","role":"user"}`}</div>
            </div>
            <textarea
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              rows={3}
              className="cyber-input"
              style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <div style={{ fontSize: 10, color: '#ffcc00', marginTop: 6 }}>
              Hint: Try JWT with alg:none — <code style={{ color: '#a8ff78' }}>eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ.</code>
            </div>
          </div>
        )}

        {tab === 'cookie' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              🍪 Session cookie is stored in plaintext. Modify it to escalate privileges:
            </div>
            <textarea
              value={cookieVal}
              onChange={(e) => setCookieVal(e.target.value)}
              rows={3}
              className="cyber-input"
              style={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Try changing <code style={{ color: '#ff3366', fontFamily: 'JetBrains Mono' }}>role=user</code> to <code style={{ color: '#ff3366', fontFamily: 'JetBrains Mono' }}>role=admin</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrokenAuthLab() {
  return (
    <LabLayout
      labSlug="broken-auth"
      targetApp={<BrokenAuthTargetApp />}
      simulate={(payload) => simulateBrokenAuth(payload)}
    />
  );
}
