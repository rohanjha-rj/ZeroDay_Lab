'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateXSS } from '@/lib/attackEngine';

function XSSTargetApp() {
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [comments, setComments] = useState([
    { user: 'alice', text: 'Great blog post! Very informative.' },
    { user: 'bob', text: 'Thanks for sharing this tutorial.' },
  ]);
  const [comment, setComment] = useState('');
  const [tab, setTab] = useState<'reflected' | 'stored'>('reflected');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Fake browser bar */}
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://vulnerable-blog.com/{tab === 'stored' ? 'posts/1' : 'search'}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['reflected', 'stored'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`cyber-tab ${tab === t ? 'active' : ''}`}
            >
              {t === 'reflected' ? '🔄 Reflected XSS' : '💾 Stored XSS'}
            </button>
          ))}
        </div>

        {tab === 'reflected' ? (
          <div>
            <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              🔍 <strong>Search the blog</strong> — your query is reflected in the page without sanitization.
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="cyber-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setSubmitted(search)}
                className="btn-ghost"
              >
                Search
              </button>
            </div>
            {submitted && (
              <div style={{ padding: 12, background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.15)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Search results for:</div>
                <div
                  style={{ fontSize: 13, color: 'var(--neon-yellow)' }}
                  dangerouslySetInnerHTML={{ __html: submitted }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>No articles found. ← Your payload is rendered here!</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              💬 <strong>Post a comment</strong> — comments are stored and rendered for all visitors!
            </div>
            <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: 'var(--neon-cyan)', marginBottom: 4 }}>@{c.user}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.text }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment (try your XSS payload)..."
                className="cyber-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => {
                  if (comment) {
                    setComments((prev) => [...prev, { user: 'hacker', text: comment }]);
                    setComment('');
                  }
                }}
                className="btn-ghost"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function XSSLab() {
  return (
    <LabLayout
      labSlug="xss"
      targetApp={<XSSTargetApp />}
      simulate={(payload) => simulateXSS(payload)}
    />
  );
}
