'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Target, BarChart3, Bot, Globe, 
  ShieldCheck, FileText, LayoutGrid, Search,
  Zap, Settings
} from 'lucide-react';
import { useWindowStore, WindowId } from '@/lib/windowStore';

const DOCK_ITEMS: { id: WindowId; icon: any; color: string; label: string }[] = [
  { id: 'attack', icon: Target, color: '#ef4444', label: 'Attack' },
  { id: 'visualizer', icon: BarChart3, color: '#00d4ff', label: 'Visualizer' },
  { id: 'terminal', icon: Terminal, color: '#10b981', label: 'Terminal' },
  { id: 'mentor', icon: Bot, color: '#a855f7', label: 'AI Mentor' },
  { id: 'osint', icon: Search, color: '#f59e0b', label: 'OSINT' },
  { id: 'code', icon: ShieldCheck, color: '#3b82f6', label: 'Defense' },
  { id: 'report', icon: FileText, color: '#94a3b8', label: 'Reports' },
  { id: 'leaderboard', icon: Zap, color: '#ffcc00', label: 'Blitz' },
];

export default function BottomDock() {
  const { windows, openWindow, focusWindow } = useWindowStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: 'rgba(10, 10, 10, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-primary)',
      borderRadius: 16,
      boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
      maxWidth: 'calc(100vw - 40px)',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {DOCK_ITEMS.map((item) => {
        const win = windows[item.id];
        const isActive = win.isOpen && !win.isMinimized;
        
        return (
          <motion.div
            key={item.id}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (win.isOpen) {
                focusWindow(item.id);
              } else {
                openWindow(item.id);
              }
            }}
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 10,
              background: isActive ? `${item.color}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? `${item.color}40` : 'rgba(255,255,255,0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <item.icon size={18} color={isActive ? item.color : 'rgba(255,255,255,0.5)'} />
            
            {/* Active Indicator */}
            {win.isOpen && (
              <motion.div
                layoutId={`dot-${item.id}`}
                style={{
                  position: 'absolute',
                  bottom: -4,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                }}
              />
            )}

            {/* Tooltip */}
            <div className="dock-tooltip">
              {item.label}
            </div>
          </motion.div>
        );
      })}
      
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      
      <motion.div
        whileHover={{ y: -4, scale: 1.1 }}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Settings size={18} color="rgba(255,255,255,0.5)" />
      </motion.div>

      <style jsx>{`
        .dock-tooltip {
          position: absolute;
          top: -36px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: rgba(0,0,0,0.8);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          color: white;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'JetBrains Mono';
        }
        div:hover > .dock-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </div>
  );
}
