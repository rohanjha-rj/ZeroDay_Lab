'use client';
import { useEffect, useRef, useState } from 'react';
import type { VisualStep, AttackVisualization } from '@/lib/attackEngine';

interface Props {
  visualization: AttackVisualization | null;
  isRunning: boolean;
}

type NodeKey = 'attacker' | 'webapp' | 'db' | 'victim';

const NODES: Record<NodeKey, { label: string; icon: string; x: number; y: number; color: string }> = {
  attacker: { label: 'Attacker', icon: '💀', x: 80, y: 160, color: '#ff3366' },
  webapp: { label: 'Web App', icon: '🌐', x: 280, y: 80, color: '#00d4ff' },
  db: { label: 'Database', icon: '🗄️', x: 480, y: 160, color: '#ffcc00' },
  victim: { label: 'Victim', icon: '👤', x: 280, y: 240, color: '#a855f7' },
};

export default function AttackVisualizer({ visualization, isRunning }: Props) {
  const [activeStep, setActiveStep] = useState(-1);
  const [exploited, setExploited] = useState<Set<string>>(new Set());
  const [packets, setPackets] = useState<{ id: number; step: VisualStep; progress: number }[]>([]);
  const animRef = useRef<NodeJS.Timeout | null>(null);
  const packetId = useRef(0);

  useEffect(() => {
    if (!visualization || !isRunning) {
      setActiveStep(-1);
      setExploited(new Set());
      setPackets([]);
      return;
    }

    setExploited(new Set(visualization.exploitedNodes));
    visualization.steps.forEach((step, i) => {
      const timeout = setTimeout(() => {
        setActiveStep(i);
        const pid = packetId.current++;
        setPackets((prev) => [...prev, { id: pid, step, progress: 0 }]);
        let p = 0;
        const interval = setInterval(() => {
          p += 4;
          setPackets((prev) =>
            prev.map((pk) => (pk.id === pid ? { ...pk, progress: Math.min(p, 100) } : pk))
          );
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setPackets((prev) => prev.filter((pk) => pk.id !== pid)), 400);
          }
        }, 30);
      }, step.delay);
      return () => clearTimeout(timeout);
    });

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [visualization, isRunning]);

  const getPacketPos = (step: VisualStep, progress: number) => {
    const from = NODES[step.from as NodeKey];
    const to = NODES[step.to as NodeKey];
    if (!from || !to) return { x: 0, y: 0 };
    const t = progress / 100;
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  };

  const getPacketColor = (type: VisualStep['type']) => {
    switch (type) {
      case 'exploit': return '#ff3366';
      case 'data': return '#ffcc00';
      case 'response': return '#00ff88';
      default: return '#00d4ff';
    }
  };

  const currentStep = visualization?.steps[activeStep];

  return (
    <div
      style={{
        background: 'rgba(5,10,20,0.9)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 12,
        padding: 16,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 12, fontFamily: 'JetBrains Mono' }}>
        📊 ATTACK FLOW VISUALIZER
      </div>

      {/* SVG graph */}
      <svg width="100%" viewBox="0 0 580 320" style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
          </pattern>
          <filter id="glow-cyan">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(0,212,255,0.4)" />
          </marker>
          <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,51,102,0.8)" />
          </marker>
        </defs>
        <rect width="580" height="320" fill="url(#grid)" />

        {/* Connection lines */}
        {(['attacker-webapp', 'webapp-db', 'webapp-victim', 'attacker-victim'] as const).map((pair) => {
          const [a, b] = pair.split('-') as [NodeKey, NodeKey];
          const nodeA = NODES[a];
          const nodeB = NODES[b];
          if (!nodeA || !nodeB) return null;
          return (
            <line
              key={pair}
              x1={nodeA.x} y1={nodeA.y}
              x2={nodeB.x} y2={nodeB.y}
              stroke="rgba(0,212,255,0.1)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Active step line */}
        {currentStep && (() => {
          const from = NODES[currentStep.from as NodeKey];
          const to = NODES[currentStep.to as NodeKey];
          if (!from || !to) return null;
          return (
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={getPacketColor(currentStep.type)}
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity={0.6}
              filter="url(#glow-cyan)"
            >
              <animate attributeName="stroke-dashoffset" values="24;0" dur="0.5s" repeatCount="indefinite" />
            </line>
          );
        })()}

        {/* Moving packets */}
        {packets.map((pk) => {
          const pos = getPacketPos(pk.step, pk.progress);
          return (
            <g key={pk.id}>
              <circle
                cx={pos.x} cy={pos.y} r="6"
                fill={getPacketColor(pk.step.type)}
                filter="url(#glow-red)"
                opacity={0.9}
              />
              <circle
                cx={pos.x} cy={pos.y} r="10"
                fill="none"
                stroke={getPacketColor(pk.step.type)}
                strokeWidth="1"
                opacity={0.4}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {Object.entries(NODES).map(([key, node]) => {
          const isExploited = exploited.has(key);
          const isActive = currentStep?.from === key || currentStep?.to === key;
          return (
            <g key={key}>
              {/* Glow ring */}
              {(isExploited || isActive) && (
                <circle
                  cx={node.x} cy={node.y} r="38"
                  fill="none"
                  stroke={isExploited ? '#ff3366' : node.color}
                  strokeWidth="1.5"
                  opacity={0.3}
                >
                  <animate attributeName="r" values="34;42;34" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y} r="32"
                fill={isExploited ? 'rgba(255,51,102,0.15)' : isActive ? `${node.color}22` : 'rgba(0,20,40,0.8)'}
                stroke={isExploited ? '#ff3366' : isActive ? node.color : 'rgba(0,212,255,0.2)'}
                strokeWidth={isActive || isExploited ? "2" : "1"}
                filter={isActive ? "url(#glow-cyan)" : undefined}
              />

              {/* Icon */}
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="18">{node.icon}</text>
              {isExploited && (
                <text x={node.x + 22} y={node.y - 22} fontSize="12">🔴</text>
              )}

              {/* Label */}
              <text
                x={node.x} y={node.y + 50}
                textAnchor="middle"
                fontSize="11"
                fill={isExploited ? '#ff3366' : node.color}
                fontFamily="JetBrains Mono"
                fontWeight={isActive ? "700" : "400"}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Step label */}
        {currentStep && (
          <g>
            <rect x="160" y="282" width="260" height="28" rx="6" fill="rgba(0,0,0,0.7)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
            <text x="290" y="300" textAnchor="middle" fontSize="11" fill="#00d4ff" fontFamily="JetBrains Mono">
              {currentStep.label}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          { color: '#ff3366', label: 'Exploit' },
          { color: '#ffcc00', label: 'Data Transfer' },
          { color: '#00ff88', label: 'Response' },
          { color: '#00d4ff', label: 'Request' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
