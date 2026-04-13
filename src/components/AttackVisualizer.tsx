'use client';
import { useEffect, useRef, useState } from 'react';
import type { VisualStep, AttackVisualization } from '@/lib/attackEngine';
import { Terminal, Globe, Database, User, ShieldAlert } from 'lucide-react';

interface Props {
  visualization: AttackVisualization | null;
  isRunning: boolean;
}

type NodeKey = 'attacker' | 'webapp' | 'db' | 'victim';

const NODES: Record<NodeKey, { label: string; icon: any; x: number; y: number; color: string }> = {
  attacker: { label: 'Attacker', icon: Terminal, x: 80, y: 160, color: '#ef4444' },
  webapp: { label: 'Web App', icon: Globe, x: 280, y: 80, color: '#3b82f6' },
  db: { label: 'Database', icon: Database, x: 480, y: 160, color: '#f59e0b' },
  victim: { label: 'Victim', icon: User, x: 280, y: 240, color: '#8b5cf6' },
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
    if (!from || !to) return { x: 280, y: 160 }; // Fallback to center
    const t = progress / 100;
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  };

  const getPacketColor = (type: VisualStep['type']) => {
    switch (type) {
      case 'exploit': return '#ef4444';
      case 'data': return '#f59e0b';
      case 'response': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const currentStep = visualization?.steps[activeStep];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 12,
        padding: 16,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>
        ZERODAY LAB — ATTACK FLOW VISUALIZER
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
            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.1)" />
          </marker>
          <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(239,68,68,0.5)" />
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
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 4"
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
              opacity={0.4}
            >
              <animate attributeName="stroke-dashoffset" values="16;0" dur="0.8s" repeatCount="indefinite" />
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
                  stroke={isExploited ? '#ef4444' : node.color}
                  strokeWidth="1"
                  opacity={0.2}
                >
                  <animate attributeName="r" values="34;42;34" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y} r="32"
                fill={isExploited ? 'rgba(239,68,68,0.1)' : isActive ? `${node.color}15` : 'rgba(10,10,10,0.8)'}
                stroke={isExploited ? '#ef4444' : isActive ? node.color : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive || isExploited ? "2" : "1"}
              />

              {/* Icon component within foreignObject for SVG support */}
              <foreignObject x={node.x - 12} y={node.y - 12} width="24" height="24">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <node.icon size={20} color={isExploited ? '#ef4444' : isActive ? node.color : 'rgba(255,255,255,0.4)'} />
                </div>
              </foreignObject>
              {isExploited && (
                <foreignObject x={node.x + 18} y={node.y - 30} width="16" height="16">
                  <ShieldAlert size={14} color="#ef4444" />
                </foreignObject>
              )}

              {/* Label */}
              <text
                x={node.x} y={node.y + 50}
                textAnchor="middle"
                fontSize="11"
                fill={isExploited ? '#ef4444' : node.color}
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
            <rect x="160" y="282" width="260" height="28" rx="6" fill="rgba(0,0,0,0.8)" stroke='rgba(255,255,255,0.05)' strokeWidth="1" />
            <text x="290" y="300" textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontFamily="JetBrains Mono">
              {currentStep.label}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          { color: '#ef4444', label: 'Exploit' },
          { color: '#f59e0b', label: 'Exfiltration' },
          { color: '#10b981', label: 'Response' },
          { color: '#3b82f6', label: 'Request' },
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
