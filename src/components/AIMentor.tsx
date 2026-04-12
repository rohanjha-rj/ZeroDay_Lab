'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Lightbulb, BookOpen, AlertTriangle } from 'lucide-react';
import { getHint, explainAttack, type Difficulty, type MentorMessage } from '@/lib/aiMentor';

interface AIMentorProps {
  labSlug: string;
  lastPayload?: string;
  lastOutcome?: string;
  onClose?: () => void;
}

export default function AIMentor({ labSlug, lastPayload, lastOutcome, onClose }: AIMentorProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: '0',
      role: 'mentor',
      content: `**Hello, Hacker!** 🤖\n\nI'm your AI Security Mentor. I'll guide you through the **${labSlug.toUpperCase().replace('-', ' ')}** lab.\n\nAsk me anything! Try:\n- "help" or "hint"\n- "explain [concept]"\n- "explain my attack" (after an attack)`,
      timestamp: Date.now(),
      type: 'hint',
    },
  ]);
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');

    const userMsg: MentorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    let response: string;
    if (/explain my attack|what did i do|analyze/i.test(msg) && lastPayload) {
      response = explainAttack(labSlug, lastPayload, lastOutcome ?? 'N/A');
    } else {
      response = getHint(labSlug, msg, difficulty);
    }

    const mentorMsg: MentorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'mentor',
      content: response,
      timestamp: Date.now(),
      type: 'hint',
    };
    setMessages((prev) => [...prev, mentorMsg]);
    setIsTyping(false);
  };

  const QUICK_ACTIONS = [
    { label: '💡 Hint', msg: 'hint' },
    { label: '📚 Explain', msg: 'explain my attack' },
    { label: '⚠️ Warning', msg: 'what are the risks' },
    { label: '🔓 Bypass', msg: 'how to bypass filters' },
  ];

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <strong key={i} style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: 4 }}>
              {line.slice(2, -2)}
            </strong>
          );
        }
        if (line.startsWith('```')) return null;
        if (line.startsWith('- ')) {
          return (
            <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>
              <span style={{ color: 'var(--neon-green)' }}>•</span>
              <span style={{ marginLeft: 6 }}>{line.slice(2)}</span>
            </div>
          );
        }
        // Inline code
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <div key={i} style={{ marginBottom: 2 }}>
            {parts.map((part, j) =>
              part.startsWith('`') && part.endsWith('`') ? (
                <code
                  key={j}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    color: '#a8ff78',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 4,
                    border: '1px solid rgba(0,255,136,0.1)',
                  }}
                >
                  {part.slice(1, -1)}
                </code>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(5, 10, 20, 0.95)',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1))',
          borderBottom: '1px solid rgba(168,85,247,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a855f7' }}>AI Security Mentor</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            {labSlug.toUpperCase()} · {difficulty}
          </div>
        </div>

        {/* Difficulty selector */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 6,
            color: '#a855f7',
            fontSize: 11,
            padding: '3px 8px',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
          }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick actions */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      >
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => sendMessage(a.msg)}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.2)',
              color: '#a855f7',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono',
              transition: 'all 0.2s',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'mentor' && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Bot size={14} color="#fff" />
              </div>
            )}
            <div
              style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? 'rgba(0,212,255,0.1)' : 'rgba(168,85,247,0.08)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.2)' : 'rgba(168,85,247,0.15)'}`,
                borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                padding: '9px 12px',
                fontSize: 12.5,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
              }}
            >
              {msg.role === 'mentor' ? renderContent(msg.content) : <span>{msg.content}</span>}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={14} color="#fff" />
            </div>
            <div
              style={{
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: '4px 12px 12px 12px',
                padding: '9px 14px',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#a855f7',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        style={{
          padding: '10px 12px',
          borderTop: '1px solid rgba(168,85,247,0.1)',
          display: 'flex',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this attack..."
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Send size={14} color="#fff" />
        </button>
      </form>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
