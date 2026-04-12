'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateCSRF } from '@/lib/attackEngine';

function CSRFTargetApp() {
  const [balance, setBalance] = useState(25000);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHistory, setTxHistory] = useState([
    { id: 'TX001', to: 'Netflix', amount: -15, date: '2024-01-10' },
    { id: 'TX002', to: 'Salary', amount: 5000, date: '2024-01-15' },
  ]);

  return (
    <div>
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://vulnerable-bank.com/transfer
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        {/* Balance */}
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.05))', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>ACCOUNT BALANCE</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
              ${balance.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
            <div>victim@bank.com</div>
            <div style={{ color: 'var(--neon-cyan)' }}>ACC: ****4892</div>
          </div>
        </div>

        {/* Transfer form — vulnerable (no CSRF token) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Fund Transfer</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Recipient Account</label>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Account number" className="cyber-input" style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Amount ($)</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="cyber-input" style={{ fontSize: 12 }} />
            </div>
          </div>
          <div style={{ padding: '6px 10px', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.15)', borderRadius: 6, fontSize: 10, color: '#ff3366', fontFamily: 'JetBrains Mono', marginBottom: 8 }}>
            ⚠️ POST /bank/transfer — NO CSRF TOKEN! Vulnerable to CSRF attack.
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => {
            if (amount) { setBalance(b => b - parseInt(amount)); setTxHistory(h => [...h, { id: `TX${Date.now()}`, to: to || 'Unknown', amount: -parseInt(amount), date: new Date().toISOString().slice(0,10) }]); setTo(''); setAmount(''); }
          }}>
            Transfer Funds
          </button>
        </div>

        {/* TX history */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>RECENT TRANSACTIONS</div>
          {txHistory.map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{tx.to}</span>
              <span style={{ color: tx.amount > 0 ? 'var(--neon-green)' : '#ff3366', fontFamily: 'JetBrains Mono' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CSRFLab() {
  return (
    <LabLayout
      labSlug="csrf"
      targetApp={<CSRFTargetApp />}
      simulate={(payload) => simulateCSRF(payload)}
    />
  );
}
