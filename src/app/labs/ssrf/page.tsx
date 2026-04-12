'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateSSRF } from '@/lib/attackEngine';

function SSRFTargetApp() {
  const [url, setUrl] = useState('');
  const [fetched, setFetched] = useState('');

  return (
    <div>
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://webapp.com/fetch-preview
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>🔗 URL Preview Fetcher</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
          Enter a URL to generate a link preview. The server fetches the URL on your behalf — can you make it fetch internal services?
        </div>
        <div style={{ padding: '6px 10px', background: 'rgba(255,204,0,0.06)', border: '1px solid rgba(255,204,0,0.15)', borderRadius: 6, fontSize: 11, color: '#ffcc00', marginBottom: 12 }}>
          ⚠️ Server makes HTTP requests to user-supplied URLs without validation!
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... or http://127.0.0.1/admin"
            className="cyber-input"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setFetched(url)}
            className="btn-danger"
          >
            Fetch URL
          </button>
        </div>

        {fetched && (
          <div style={{ marginTop: 14, padding: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>
              SERVER IS FETCHING: <span style={{ color: 'var(--neon-cyan)' }}>{fetched}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>[Response will appear in Attack Result below]</div>
          </div>
        )}

        {/* Internal network topology */}
        <div style={{ marginTop: 14, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 8 }}>INTERNAL NETWORK TOPOLOGY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { addr: '127.0.0.1:80', name: 'Web App (You are here)', access: 'public' },
              { addr: '127.0.0.1:8080', name: 'Admin Panel', access: 'internal' },
              { addr: '127.0.0.1:3306', name: 'MySQL Database', access: 'internal' },
              { addr: '127.0.0.1:6379', name: 'Redis Cache', access: 'internal' },
              { addr: '169.254.169.254', name: 'AWS Metadata Service', access: 'cloud' },
              { addr: '192.168.1.100', name: 'Internal API Server', access: 'internal' },
            ].map((item) => (
              <div key={item.addr} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ fontFamily: 'JetBrains Mono', color: item.access === 'public' ? 'var(--neon-green)' : item.access === 'cloud' ? '#ffcc00' : '#ff3366', width: 160, flexShrink: 0 }}>{item.addr}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 10, marginLeft: 'auto',
                  background: item.access === 'public' ? 'rgba(0,255,136,0.1)' : item.access === 'cloud' ? 'rgba(255,204,0,0.1)' : 'rgba(255,51,102,0.1)',
                  color: item.access === 'public' ? 'var(--neon-green)' : item.access === 'cloud' ? '#ffcc00' : '#ff3366',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {item.access}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SSRFLab() {
  return (
    <LabLayout
      labSlug="ssrf"
      targetApp={<SSRFTargetApp />}
      simulate={(payload) => simulateSSRF(payload)}
    />
  );
}
