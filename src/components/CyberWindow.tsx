'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Move } from 'lucide-react';
import { useWindowStore, WindowId } from '@/lib/windowStore';
import { ReactNode } from 'react';

interface Props {
  id: WindowId;
  children: ReactNode;
}

export default function CyberWindow({ id, children }: Props) {
  const { windows, focusWindow, closeWindow, minimizeWindow, updatePosition } = useWindowStore();
  const win = windows[id];

  if (!win.isOpen || win.isMinimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      drag
      dragMomentum={false}
      onDragStart={() => focusWindow(id)}
      onDragEnd={(e, info) => {
        updatePosition(id, win.x + info.offset.x, win.y + info.offset.y);
      }}
      style={{
        position: 'absolute',
        top: win.y,
        left: win.x,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: win.zIndex > 50 ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Title Bar */}
      <div
        onPointerDown={() => focusWindow(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid var(--border-primary)',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div 
            onClick={() => closeWindow(id)}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={8} color="rgba(0,0,0,0.5)" />
          </div>
          <div 
            onClick={() => minimizeWindow(id)}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', cursor: 'pointer' }}
          >
             <Minus size={8} color="rgba(0,0,0,0.5)" />
          </div>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', opacity: 0.5 }} />
        </div>
        
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {win.title.toUpperCase()}
        </div>

        <div style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          <Move size={12} />
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Resize Handle (Simplified) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 15,
        height: 15,
        cursor: 'nwse-resize',
        background: 'linear-gradient(135deg, transparent 50%, var(--border-primary) 50%)',
      }} />
    </motion.div>
  );
}
