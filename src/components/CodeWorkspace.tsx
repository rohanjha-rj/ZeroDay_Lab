'use client';
import { useState, useEffect } from 'react';
import { Lab } from '@/lib/labData';
import { ShieldCheck, ShieldAlert, RotateCcw, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  lab: Lab;
}

export default function CodeWorkspace({ lab }: Props) {
  const [userCode, setUserCode] = useState(lab.vulnerableCode.snippet);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'editing' | 'success' | 'fail'>('editing');
  const [feedback, setFeedback] = useState('');

  const handleVerify = async () => {
    setIsVerifying(true);
    setStatus('editing');
    
    await new Promise(r => setTimeout(r, 1500)); // Simulate "Scanning"
    
    // Normalize code for comparison (very basic check for this educational demo)
    const normalizedUser = userCode.replace(/\s+/g, ' ').trim();
    const normalizedSecure = lab.secureCode.replace(/\s+/g, ' ').trim();
    
    // Check if they included a security keyword (e.g., ?, escape, sanitize)
    const secureKeywords = ['?', 'params', 'escape', 'sanitize', 'DOMPurify', 'prepare'];
    const hasSecurePattern = secureKeywords.some(k => userCode.includes(k));

    if (normalizedUser === normalizedSecure || hasSecurePattern) {
      setStatus('success');
      setFeedback('✅ VULNERABILITY PATCHED: Security patterns detected and verified.');
    } else {
      setStatus('fail');
      setFeedback('❌ SECURITY AUDIT FAILED: The code is still vulnerable to exploitation.');
    }
    setIsVerifying(false);
  };

  const resetCode = () => {
    setUserCode(lab.vulnerableCode.snippet);
    setStatus('editing');
    setFeedback('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d11' }}>
      {/* Workspace Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={16} color={status === 'success' ? '#10b981' : '#f59e0b'} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            SECURITY_AUDIT_MODE / {lab.slug.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={resetCode}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            style={{ 
                display: 'flex', alignItems: 'center', gap: 5, 
                background: status === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.1)', 
                border: `1px solid ${status === 'success' ? '#10b981' : '#3b82f6'}`, 
                color: status === 'success' ? '#10b981' : '#3b82f6', 
                padding: '4px 14px', borderRadius: 6, fontSize: 10, cursor: 'pointer' 
            }}
          >
            {isVerifying ? 'SCANNING...' : <><Play size={12} /> RUN SECURITY SCAN</>}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {/* Left: Original (Read Only) */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 16px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontSize: 9, fontWeight: 800 }}>VULNERABLE SOURCE</div>
          <pre style={{ margin: 0, padding: 20, flex: 1, overflow: 'auto', fontSize: 12, lineHeight: 1.6, color: '#f8fafc', opacity: 0.6, background: 'rgba(239, 68, 68, 0.02)' }}>
            <code>{lab.vulnerableCode.snippet}</code>
          </pre>
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <strong>ISSUE:</strong> {lab.vulnerableCode.description}
          </div>
        </div>

        {/* Right: Patch (Editable) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 16px', background: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', fontSize: 9, fontWeight: 800 }}>SECURITY PATCH</div>
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            style={{
              flex: 1,
              padding: 20,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#3b82f6',
              fontSize: 12,
              fontFamily: '"JetBrains Mono", monospace',
              lineHeight: 1.6,
              resize: 'none',
              caretColor: '#fff',
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{ 
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', 
                background: status === 'success' ? '#10b981' : '#ef4444', color: '#000',
                padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                zIndex: 100,
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        textarea::selection {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
