'use client';
import { useState } from 'react';
import { LABS } from '@/lib/labData';
import { useProgressStore } from '@/lib/progressStore';
import type { AttackOutcome } from '@/lib/attackEngine';
import AttackVisualizer from '@/components/AttackVisualizer';
import AIMentor from '@/components/AIMentor';
import CyberTerminal from '@/components/Terminal';
import {
  ChevronRight, Zap, Shield, AlertTriangle, CheckCircle, Copy,
  Eye, EyeOff, Terminal as TermIcon, Bot, BarChart3, Target,
  RotateCcw
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface LabLayoutProps {
  labSlug: string;
  targetApp: React.ReactNode;
  simulate: (payload: string, extra?: string) => AttackOutcome | Promise<AttackOutcome>;
  extraInput?: { label: string; placeholder: string };
}

type TabId = 'attack' | 'visualizer' | 'terminal' | 'mentor';

export default function LabLayout({ labSlug, targetApp, simulate, extraInput }: LabLayoutProps) {
  const lab = LABS.find((l) => l.slug === labSlug);
  const { completelab, addXP } = useProgressStore();

  const [payload, setPayload] = useState('');
  const [extra, setExtra] = useState('');
  const [outcome, setOutcome] = useState<AttackOutcome | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('attack');
  const [isRunning, setIsRunning] = useState(false);
  const [showPayloads, setShowPayloads] = useState(false);
  const [copied, setCopied] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [steps, setSteps] = useState<{ timestamp: number; action: string; payload: string; result: 'success' | 'failure'; detail: string }[]>([]);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);

  if (!lab) return <div>Lab not found</div>;

  const handleLaunch = async () => {
    if (!payload.trim()) return;
    setIsRunning(true);
    setOutcome(null);

    await new Promise((r) => setTimeout(r, 800));

    const result = await simulate(payload, extra);
    setOutcome(result);
    setIsRunning(false);

    const step = {
      timestamp: Date.now(),
      action: 'attack',
      payload,
      result: result.success ? 'success' as const : 'failure' as const,
      detail: result.title,
    };
    setSteps((prev) => [...prev, step]);

    if (result.success) {
      setShowSuccess(true);
      addXP(result.xpEarned);
      setTimeout(() => setShowSuccess(false), 2000);

      // Complete lab after first success
      if (!steps.some((s) => s.result === 'success')) {
        completelab({
          labId: lab.id,
          completedAt: Date.now(),
          xpEarned: lab.xpReward,
          hintsUsed,
          timeSeconds: Math.round((Date.now() - startTime) / 1000),
          steps: [...steps, step],
        });
      }

      if (result.visualization.steps.length > 0) {
        setActiveTab('visualizer');
        setTimeout(() => setActiveTab('attack'), 4000);
      }
    }
  };

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'attack', label: 'Attack', icon: Target },
    { id: 'visualizer', label: 'Visualizer', icon: BarChart3 },
    { id: 'terminal', label: 'Terminal', icon: TermIcon },
    { id: 'mentor', label: 'AI Mentor', icon: Bot },
  ];

  const SEVERITY_COLOR: Record<string, string> = {
    Critical: '#ff3366', High: '#ff6600', Medium: '#ffcc00', Low: '#00d4ff',
  };

  const copyPayload = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopied(p);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      {/* Success flash */}
      {showSuccess && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9000,
          background: 'linear-gradient(135deg, rgba(0,255,136,0.9), rgba(0,212,255,0.9))',
          color: '#050a10',
          padding: '14px 24px',
          borderRadius: 12,
          fontFamily: 'JetBrains Mono',
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 0 40px rgba(0,255,136,0.5)',
          animation: 'slideIn 0.3s ease',
        }}>
          ✅ EXPLOIT SUCCESS! +{outcome?.xpEarned} XP
        </div>
      )}

      {/* Lab Header */}
      <div
        style={{
          padding: '18px 22px',
          background: `linear-gradient(135deg, ${lab.color}0d, rgba(0,0,0,0))`,
          border: `1px solid ${lab.color}25`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(() => {
              const LabIcon = (LucideIcons as any)[lab.icon] || LucideIcons.Code;
              return <LabIcon size={36} color={lab.color} />;
            })()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                {lab.title}
              </h1>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lab.subtitle}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: `${SEVERITY_COLOR[lab.severity]}15`, color: SEVERITY_COLOR[lab.severity], border: `1px solid ${SEVERITY_COLOR[lab.severity]}25` }}>
                ⚠️ {lab.severity}
              </span>
              <span className="badge badge-cyan">{lab.difficulty}</span>
              <span className="badge badge-purple">CVSS {lab.cvss}</span>
              {lab.tags.map((t) => (
                <span key={t} className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
            +{lab.xpReward} XP
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>on completion</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cyber-tab ${activeTab === tab.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon size={13} />
              {tab.label}
              {tab.id === 'mentor' && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, flex: 1 }}>
        {/* Left: Tab content */}
        <div>
          {activeTab === 'attack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Target app */}
              <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 10 }}>
                  🎯 VULNERABLE TARGET APPLICATION
                </div>
                {targetApp}
              </div>

              {/* Attack panel */}
              <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>⚔️ ATTACK CONSOLE</span>
                  <button
                    onClick={() => setShowPayloads(!showPayloads)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', color: 'var(--neon-green)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  >
                    {showPayloads ? <EyeOff size={12} /> : <Eye size={12} />}
                    Payloads
                  </button>
                </div>

                {showPayloads && (
                  <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lab.payloads.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(0,255,136,0.1)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => { setPayload(p.payload); setShowPayloads(false); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neon-green)' }}>{p.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: 'var(--neon-yellow)', fontFamily: 'JetBrains Mono' }}>+{p.xp} XP</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyPayload(p.payload); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                        <code style={{ fontSize: 11, color: '#a8ff78', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                          {p.payload.slice(0, 80)}{p.payload.length > 80 ? '...' : ''}
                        </code>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{p.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder={`Enter attack payload...\ne.g., ' OR 1=1 --`}
                    rows={3}
                    className="cyber-input"
                    style={{ resize: 'vertical', fontFamily: 'JetBrains Mono', fontSize: 13 }}
                  />
                  {extraInput && (
                    <input
                      value={extra}
                      onChange={(e) => setExtra(e.target.value)}
                      placeholder={extraInput.placeholder}
                      className="cyber-input"
                    />
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleLaunch}
                      disabled={!payload.trim() || isRunning}
                      className="btn-danger"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      {isRunning ? (
                        <>
                          <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Launch Attack
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setPayload(''); setOutcome(null); }}
                      className="btn-ghost"
                      style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <RotateCcw size={13} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Result */}
              {outcome && (
                <div
                  className="glass-card"
                  style={{
                    padding: 16,
                    borderColor: outcome.success ? 'rgba(255,51,102,0.3)' : 'rgba(0,255,136,0.2)',
                    animation: 'fadeInUp 0.4s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {outcome.success ? (
                      <AlertTriangle size={18} style={{ color: '#ff3366' }} />
                    ) : (
                      <CheckCircle size={18} style={{ color: 'var(--neon-green)' }} />
                    )}
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: outcome.success ? '#ff3366' : 'var(--neon-green)',
                      fontFamily: 'JetBrains Mono',
                    }}>
                      {outcome.title}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {outcome.description}
                  </p>

                  {/* Server response */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>SERVER RESPONSE</div>
                    <div className="code-block" style={{ fontSize: 12 }}>
                      {outcome.serverResponse}
                    </div>
                  </div>

                  {outcome.dbQuery && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>EXECUTED SQL QUERY</div>
                      <div className="code-block" style={{ color: '#ff9966' }}>
                        {outcome.dbQuery}
                      </div>
                    </div>
                  )}

                  {outcome.cookieStolen && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--neon-red)', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>🍪 STOLEN COOKIE</div>
                      <div className="code-block" style={{ color: '#ff3366' }}>
                        {outcome.cookieStolen}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'visualizer' && (
            <AttackVisualizer
              visualization={outcome?.visualization ?? null}
              isRunning={isRunning || (outcome?.success ?? false)}
            />
          )}

          {activeTab === 'terminal' && <CyberTerminal />}

          {activeTab === 'mentor' && (
            <AIMentor
              labSlug={labSlug}
              lastPayload={payload}
              lastOutcome={outcome?.description}
            />
          )}
        </div>

        {/* Right: Objectives + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Objectives */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 10 }}>
              📋 OBJECTIVES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lab.objectives.map((obj, i) => {
                const done = steps.some((s) => s.result === 'success') && i === 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      background: done ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${done ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12.5, color: done ? 'var(--neon-green)' : 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {obj}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* hints */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 10 }}>
              💡 HINTS ({hintsUsed}/{lab.hints.length} used)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lab.hints.map((hint, i) => (
                <div key={i}>
                  {i < hintsUsed ? (
                    <div style={{
                      padding: '8px 10px',
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.15)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      {hint}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHintsUsed(i + 1)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px dashed rgba(168,85,247,0.2)',
                        borderRadius: 8,
                        fontSize: 11,
                        color: '#a855f7',
                        cursor: 'pointer',
                        fontFamily: 'JetBrains Mono',
                      }}
                    >
                      🔒 Reveal Hint {i + 1}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attack log */}
          {steps.length > 0 && (
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 10 }}>
                📜 ATTACK LOG
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {steps.slice(-5).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span style={{ color: s.result === 'success' ? '#ff3366' : 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
                      {s.result === 'success' ? '💥' : '🛡️'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.payload.slice(0, 30)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
