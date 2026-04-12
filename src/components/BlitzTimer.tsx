'use client';
import { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Trophy, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlitzTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isBlitzing = seconds < 60;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d11', fontFamily: 'JetBrains Mono' }}>
      <div style={{ padding: 20, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: isBlitzing ? '#ffcc00' : 'var(--text-primary)', textShadow: isBlitzing ? '0 0 20px rgba(255,204,0,0.3)' : 'none' }}>
           {formatTime(seconds)}
        </div>
        
        {isBlitzing && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ fontSize: 10, color: '#ffcc00', letterSpacing: '0.2em' }}
          >
            ⚡ BLITZ_MULTIPLIER_ACTIVE (2.0x XP)
          </motion.div>
        )}

        <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
           <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'left' }}>LOCAL_SESSION_HISTORY:</div>
           {history.length === 0 ? (
               <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>NO_DATA_AVAILABLE</div>
           ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   {history.map((t, i) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                           <span style={{ color: 'var(--text-muted)' }}>RUN_{i+1}</span>
                           <span style={{ color: t < 60 ? '#ffcc00' : '#fff' }}>{formatTime(t)}</span>
                       </div>
                   ))}
               </div>
           )}
        </div>
      </div>
      
      <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: 20 }}>
          <button onClick={() => setSeconds(0)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer' }}>RESET</button>
          <button onClick={() => setIsActive(!isActive)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer' }}>{isActive ? 'PAUSE' : 'RESUME'}</button>
      </div>
    </div>
  );
}
