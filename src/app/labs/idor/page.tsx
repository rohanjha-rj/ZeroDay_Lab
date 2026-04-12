'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateIDOR } from '@/lib/attackEngine';

function IDORTargetApp() {
  const [tab, setTab] = useState<'users' | 'files' | 'orders'>('users');
  const [userId, setUserId] = useState('5');
  const [fileId, setFileId] = useState('private_user5.pdf');
  const [orderId, setOrderId] = useState('2048');

  const USERS_PREVIEW: Record<string, { name: string; email: string; role: string }> = {
    '1': { name: 'Admin', email: 'admin@company.com', role: '👑 superadmin' },
    '2': { name: 'Alice', email: 'alice@user.com', role: 'user' },
    '3': { name: 'Bob', email: 'bob@user.com', role: 'user' },
    '5': { name: 'You', email: 'you@user.com', role: 'user' },
  };

  return (
    <div>
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://api.webapp.com/{tab === 'users' ? `users/${userId}` : tab === 'files' ? `files/${fileId}` : `orders/${orderId}`}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['users', 'files', 'orders'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`cyber-tab ${tab === t ? 'active' : ''}`} style={{ fontSize: 11 }}>
              {t === 'users' ? '👤 User API' : t === 'files' ? '📄 File API' : '🛒 Order API'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Your account is user ID <strong style={{ color: 'var(--neon-green)' }}>#5</strong>. The API returns user data by ID — no authorization check!
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>User ID</label>
                <input value={userId} onChange={(e) => setUserId(e.target.value)} className="cyber-input" style={{ fontFamily: 'JetBrains Mono' }} />
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['1', '2', '3', '5'].map((id) => (
                  <button key={id} onClick={() => setUserId(id)} style={{ padding: '6px 10px', borderRadius: 6, background: userId === id ? 'rgba(0,255,136,0.15)' : 'rgba(0,0,0,0.4)', border: `1px solid ${userId === id ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`, color: userId === id ? 'var(--neon-green)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                    #{id}
                  </button>
                ))}
              </div>
            </div>
            {USERS_PREVIEW[userId] ? (
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.4)', border: `1px solid ${userId === '1' ? 'rgba(255,51,102,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>API RESPONSE: GET /api/users/{userId}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                  {Object.entries(USERS_PREVIEW[userId]).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--text-muted)', width: 60, flexShrink: 0, fontFamily: 'JetBrains Mono' }}>{k}:</span>
                      <span style={{ color: k === 'role' ? '#ffcc00' : 'var(--text-secondary)' }}>{v}</span>
                    </div>
                  ))}
                  {userId === '1' && <div style={{ color: '#ff3366', fontSize: 11, marginTop: 4 }}>⚠️ Admin data exposed! api_key: sk-admin-X9mK2p</div>}
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                Try user IDs: 1 (admin), 2, 3, 5
              </div>
            )}
          </div>
        )}

        {tab === 'files' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Access files by name. No ownership check — can you access admin's private report?
            </div>
            <input value={fileId} onChange={(e) => setFileId(e.target.value)} className="cyber-input" placeholder="filename" style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['private_user5.pdf', 'private_admin_report.pdf', 'admin_backup.zip', 'config_secrets.txt'].map((f) => (
                <button key={f} onClick={() => setFileId(f)} style={{ padding: '3px 10px', borderRadius: 20, background: fileId === f ? 'rgba(255,51,102,0.1)' : 'rgba(0,0,0,0.3)', border: `1px solid ${fileId === f ? 'rgba(255,51,102,0.3)' : 'rgba(255,255,255,0.06)'}`, color: fileId === f ? '#ff3366' : 'var(--text-muted)', cursor: 'pointer', fontSize: 10, fontFamily: 'JetBrains Mono' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Your order ID is #2048. Try other order numbers to view different users' orders.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="cyber-input" style={{ fontFamily: 'JetBrains Mono' }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {['1001', '1002', '2048'].map((id) => (
                  <button key={id} onClick={() => setOrderId(id)} style={{ padding: '6px 10px', borderRadius: 6, background: orderId === id ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.4)', border: `1px solid ${orderId === id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`, color: orderId === id ? 'var(--neon-cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono' }}>
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IDORLab() {
  return (
    <LabLayout
      labSlug="idor"
      targetApp={<IDORTargetApp />}
      simulate={(payload) => simulateIDOR(payload, 5)}
    />
  );
}
