'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { LABS } from '@/lib/labData';
import { useProgressStore } from '@/lib/progressStore';
import type { AttackOutcome } from '@/lib/attackEngine';
import AttackVisualizer from '@/components/AttackVisualizer';
import AIMentor from '@/components/AIMentor';
import CyberTerminal from '@/components/Terminal';
import CyberWindow from '@/components/CyberWindow';
import BottomDock from '@/components/BottomDock';
import CodeWorkspace from '@/components/CodeWorkspace';
import RequestInterceptor from '@/components/RequestInterceptor';
import BlitzTimer from '@/components/BlitzTimer';
import Visualizer3D from '@/components/Visualizer3D';
import { generateTechnicalReport } from '@/lib/ReportEngine';
import {
  ChevronRight, Zap, Shield, AlertTriangle, CheckCircle, Copy,
  Eye, EyeOff, Terminal as TermIcon, Bot, BarChart3, Target,
  RotateCcw, ShieldAlert, FileText, Search
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useWindowStore } from '@/lib/windowStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LabLayoutProps {
  labSlug: string;
  targetApp: React.ReactNode;
  simulate: (payload: string, extra?: string) => AttackOutcome | Promise<AttackOutcome>;
  extraInput?: { label: string; placeholder: string };
}

export const LabContext = createContext<{
  executeAttack: (payload: string, extra?: string) => Promise<void>;
  isRunning: boolean;
  isDefenseMode: boolean;
  setDefenseMode: (val: boolean) => void;
  isIntercepting: boolean;
  setIntercepting: (val: boolean) => void;
} | null>(null);

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) throw new Error('useLab must be used within LabLayout');
  return context;
};

export default function LabLayout({ labSlug, targetApp, simulate, extraInput }: LabLayoutProps) {
  const lab = LABS.find((l) => l.slug === labSlug);
  const { completelab, addXP } = useProgressStore();
  const { windows, openWindow, focusWindow, closeWindow } = useWindowStore();

  const [payload, setPayload] = useState('');
  const [extra, setExtra] = useState('');
  const [outcome, setOutcome] = useState<AttackOutcome | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDefenseMode, setDefenseMode] = useState(false);
  const [isIntercepting, setIntercepting] = useState(false);
  const [interceptedData, setInterceptedData] = useState<{ payload: string } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [steps, setSteps] = useState<{ timestamp: number; action: string; payload: string; result: 'success' | 'failure'; detail: string }[]>([]);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUnderAttack, setIsUnderAttack] = useState(false);

  if (!lab) return <div>Lab not found</div>;

  // Feature #10: AI Red-Teamer Bot (Defender Mode)
  useEffect(() => {
    let interval: any;
    if (isDefenseMode) {
        interval = setInterval(() => {
            setIsUnderAttack(true);
            setTimeout(() => setIsUnderAttack(false), 2000);
        }, 8000);
    }
    return () => clearInterval(interval);
  }, [isDefenseMode]);

  const executeAttack = async (p: string, e?: string) => {
    if (!p.trim()) return;
    setIsRunning(true);
    setOutcome(null);
    setPayload(p);
    if (e) setExtra(e);

    if (isIntercepting) {
        setInterceptedData({ payload: p });
        openWindow('interceptor');
        setIsRunning(false);
        return; 
    }

    await new Promise((r) => setTimeout(r, 800));
    const result = await simulate(p, e || extra);
    setOutcome(result);
    setIsRunning(false);

    const step = {
      timestamp: Date.now(),
      action: 'attack',
      payload: p,
      result: result.success ? 'success' as const : 'failure' as const,
      detail: result.title,
    };
    setSteps((prev) => [...prev, step]);

    if (result.success) {
      setShowSuccess(true);
      addXP(result.xpEarned);
      setTimeout(() => setShowSuccess(false), 2500);
      focusWindow('visualizer');

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
    }
  };

  const handleInterceptedForward = (newP: string) => {
    setInterceptedData(null);
    closeWindow('interceptor');
    executeAttack(newP, extra);
  };

  const handleReportExport = () => {
    generateTechnicalReport({
        lab,
        startTime,
        endTime: Date.now(),
        steps,
        hintsUsed,
        xpEarned: lab.xpReward,
        username: 'ZeroDay_Admin'
    });
  };

  const handleLaunch = () => executeAttack(payload, extra);

  const SEVERITY_COLOR: Record<string, string> = {
    Critical: '#ff3366', High: '#ff6600', Medium: '#ffcc00', Low: '#00d4ff',
  };

  return (
    <LabContext.Provider value={{ 
        executeAttack, isRunning, isDefenseMode, setDefenseMode, 
        isIntercepting, setIntercepting 
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'calc(100vh - 64px)', 
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 42, 80, 0.1) 0%, rgba(0,0,0,0) 100%)',
      }}>
        {/* Workspace background effect */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }} className="grid-bg" />

        {/* Global FX */}
        {isUnderAttack && <div className="danger-vignette" />}
        <AnimatePresence>
            {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="success-glitch">
                    <div className="success-text">SYSTEM_BREACHED</div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Target & Attack Window */}
        <CyberWindow id="attack">
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
             {/* Lab Header Summary */}
             <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{lab.title}</h2>
                    <span className="badge" style={{ background: `${SEVERITY_COLOR[lab.severity]}20`, color: SEVERITY_COLOR[lab.severity], fontSize: 9 }}>{lab.severity}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {lab.tags.slice(0, 3).map(t => <span key={t} style={{ fontSize: 9, color: 'var(--text-muted)' }}>#{t}</span>)}
                </div>
             </div>

             {/* Mode Toggle */}
             <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3 }}>
                <button 
                    onClick={() => setDefenseMode(false)}
                    style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: !isDefenseMode ? 'rgba(255,255,255,0.05)' : 'none', color: !isDefenseMode ? 'var(--neon-green)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                >
                    RED TEAM
                </button>
                <button 
                     onClick={() => {
                         setDefenseMode(true);
                         openWindow('code');
                     }}
                     style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: isDefenseMode ? 'rgba(59,130,246,0.1)' : 'none', color: isDefenseMode ? '#3b82f6' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                >
                    BLUE TEAM
                </button>
             </div>

             {/* Target App */}
             <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>TARGET_APP_STREAM</div>
                {targetApp}
             </div>

             {/* Attack Inputs */}
             {!isDefenseMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>PAYLOAD_INJECTION</span>
                        <button 
                            onClick={() => setIntercepting(!isIntercepting)}
                            style={{ background: isIntercepting ? 'rgba(245,158,11,0.1)' : 'none', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: 4, color: isIntercepting ? '#f59e0b' : 'var(--text-muted)', fontSize: 9, cursor: 'pointer' }}
                        >
                            {isIntercepting ? 'INTERCEPT ON' : 'INTERCEPT OFF'}
                        </button>
                    </div>
                    <textarea
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        placeholder="Enter payload..."
                        rows={3}
                        className="cyber-input"
                        style={{ fontSize: 12 }}
                    />
                    <button 
                        onClick={handleLaunch} 
                        disabled={isRunning}
                        className="btn-danger" 
                        style={{ width: '100%', fontSize: 12 }}
                    >
                        {isRunning ? 'EXECUTING...' : 'RUN EXPLOIT'}
                    </button>
                </div>
             )}
             
             {isDefenseMode && (
                 <div style={{ padding: 12, background: 'rgba(59,130,246,0.05)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: 10, textAlign: 'center' }}>
                    🛡️ DEFENSE MODE ACTIVE: Please open the Security Audit window to patch vulnerabilities.
                 </div>
             )}

             {/* Result Summary */}
             {outcome && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 12, background: outcome.success ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)', borderRadius: 8, border: `1px solid ${outcome.success ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: outcome.success ? '#ef4444' : '#10b981', marginBottom: 4 }}>{outcome.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{outcome.description.slice(0, 100)}...</div>
                 </motion.div>
             )}
          </div>
        </CyberWindow>

        {/* Visualizer Window */}
        <CyberWindow id="visualizer">
            <Visualizer3D 
                visualization={outcome?.visualization ?? null} 
                isRunning={isRunning || (outcome?.success ?? false)} 
            />
        </CyberWindow>

        {/* Terminal Window */}
        <CyberWindow id="terminal">
            <CyberTerminal />
        </CyberWindow>

        {/* Mentor Window */}
        <CyberWindow id="mentor">
            <AIMentor 
                labSlug={labSlug} 
                lastPayload={payload} 
                lastOutcome={outcome?.description} 
            />
        </CyberWindow>

        {/* OSINT Window (Feature 9) */}
        <CyberWindow id="osint">
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#050a10' }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#f59e0b', fontFamily: 'monospace' }}>
                        onion://leaked-intel.zeroday.net
                    </div>
                </div>
                <div style={{ flex: 1, padding: 20, color: '#94a3b8', fontSize: 13, fontFamily: 'JetBrains Mono' }}>
                    <h3 style={{ color: '#f8fafc', marginBottom: 16 }}>{'>>>'} SEARCH RESULTS: {lab.slug}</h3>
                    <div style={{ padding: 12, border: '1px dashed rgba(245,158,11,0.3)', borderRadius: 8, background: 'rgba(245,158,11,0.02)' }}>
                        <p style={{ color: '#f59e0b', fontSize: 11, marginBottom: 8 }}>Found entries in "ShadowForum" data dump:</p>
                        <code style={{ fontSize: 11, opacity: 0.8 }}>
                            {lab.payloads.slice(0, 2).map(p => (
                                <div key={p.id} style={{ marginBottom: 4 }}>- {p.name}: {p.payload}</div>
                            ))}
                        </code>
                    </div>
                </div>
            </div>
        </CyberWindow>

        {/* Defense Window */}
        <CyberWindow id="code">
            <CodeWorkspace lab={lab} />
        </CyberWindow>

        {/* Interceptor Window */}
        <CyberWindow id="interceptor">
            {interceptedData && (
                <RequestInterceptor 
                    method="POST" 
                    url={`/labs/${lab.slug}`} 
                    payload={interceptedData.payload}
                    onDrop={() => {
                        setInterceptedData(null);
                        closeWindow('interceptor');
                    }}
                    onForward={handleInterceptedForward}
                />
            )}
        </CyberWindow>

        {/* Timer Window */}
        <CyberWindow id="leaderboard">
            <BlitzTimer />
        </CyberWindow>

        {/* Report Window */}
        <CyberWindow id="report">
            <div style={{ padding: 30, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
                <FileText size={48} color="#94a3b8" style={{ margin: '0 auto' }} />
                <h3 style={{ fontSize: 18, color: '#fff' }}>Technical Audit Summary</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{steps.length} activities logged in current session.</p>
                <button onClick={handleReportExport} className="btn-primary">DOWNLOAD PDF AUDIT REPORT</button>
            </div>
        </CyberWindow>

        {/* Bottom Dock */}
        <BottomDock />

        <style jsx>{`
            .grid-bg {
                background-image: 
                    linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
                background-size: 40px 40px;
            }
        `}</style>
      </div>
    </LabContext.Provider>
  );
}
