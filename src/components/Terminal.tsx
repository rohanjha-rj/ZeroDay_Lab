'use client';
import { useEffect, useRef, useState } from 'react';
import { executeCommand } from '@/lib/terminalCommands';
import { Terminal as TermIcon, X, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalLine {
  id: number;
  type: 'command' | 'output' | 'error' | 'info' | 'prompt';
  content: string;
}

interface TerminalProps {
  onClose?: () => void;
}

export default function CyberTerminal({ onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: 'info', content: '>>> CyberSec Lab Terminal v1.0.0 init...' },
    { id: 1, type: 'info', content: '>>> Security Environment: Isolated-Sandbox' },
    { id: 2, type: 'info', content: '>>> System Status: Ready' },
    { id: 4, type: 'info', content: '' },
    { id: 5, type: 'info', content: 'Type "help" for available commands.' },
    { id: 6, type: 'info', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(7);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l) => ({ ...l, id: nextId.current++ })),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const cmd = input.trim();
    setHistory((h) => [cmd, ...h]);
    setHistIdx(-1);
    setInput('');

    // Show command
    addLines([{ type: 'command', content: `$ ${cmd}` }]);

    // Special commands
    if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      return;
    }

    setIsLoading(true);
    const result = executeCommand(cmd);

    if (result.delay && result.delay > 0) {
      addLines([{ type: 'info', content: `[Running...]` }]);
      await new Promise((r) => setTimeout(r, result.delay));
      setLines((prev) => prev.filter((l) => l.content !== '[Running...]'));
    }

    const outputLines = result.output.split('\n').map((line) => ({
      type: result.type as 'output' | 'error' | 'info',
      content: line,
    }));
    addLines([...outputLines, { type: 'info', content: '' }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx]);
    }
  };

  const getLineColor = (type: TerminalLine['type']): string => {
    switch (type) {
      case 'command': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      case 'output': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  return (
    <div
      style={{
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? 0 : undefined,
        left: isMaximized ? 0 : undefined,
        right: isMaximized ? 0 : undefined,
        bottom: isMaximized ? 0 : undefined,
        width: isMaximized ? '100%' : '100%',
        height: isMaximized ? '100vh' : 400,
        zIndex: isMaximized ? 1000 : undefined,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: isMaximized ? 0 : 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}
      >
        <TermIcon size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
          cybersec-lab / bin / bash
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Output area */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 14px',
          cursor: 'text',
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: getLineColor(line.type),
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {line.content || '\u00A0'}
          </div>
        ))}
        {isLoading && (
          <div style={{ color: '#f59e0b', fontSize: 12 }}>
            ⠿ Processing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderTop: '1px solid var(--border-primary)',
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#10b981', fontSize: 12, flexShrink: 0 }}>
          www-data@lab:~$
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#10b981',
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            caretColor: '#10b981',
          }}
          placeholder="Enter command..."
          disabled={isLoading}
        />
        <span
          className="cursor-blink"
          style={{ width: 8, height: 14, background: '#10b981', display: 'inline-block' }}
        />
      </form>
    </div>
  );
}
