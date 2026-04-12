'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateCommandInjection } from '@/lib/attackEngine';

function CmdInjTargetApp() {
  const [target, setTarget] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runPing = async () => {
    if (!target) return;
    setIsRunning(true);
    setOutput('');
    await new Promise((r) => setTimeout(r, 1200));
    const isInjected = /[;|&`]/.test(target);
    if (isInjected) {
      setOutput(`PING ${target.split(/[;|&]/)[0].trim()} ...\n\n⚡ INJECTION DETECTED!\n[EXECUTING INJECTED COMMAND]\n...\n[Use the Attack Console below for full simulation]`);
    } else {
      setOutput(`PING ${target} (${target}): 56 data bytes\n64 bytes from ${target}: icmp_seq=0 ttl=64 time=0.061 ms\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.045 ms\n64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.052 ms\n\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`);
    }
    setIsRunning(false);
  };

  return (
    <div>
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px 8px 0 0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px', color: 'var(--text-muted)' }}>
          🔒 https://network-tools.com/ping
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>🏓 Network Ping Tool</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Enter a host to ping. The input is passed directly to the OS shell: <code style={{ fontFamily: 'JetBrains Mono', color: '#ff9966', fontSize: 11 }}>ping -c 3 [USER_INPUT]</code>
        </div>
        <div style={{ padding: '6px 10px', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.15)', borderRadius: 6, fontSize: 11, color: '#ff3366', marginBottom: 12 }}>
          ⚠️ Input is passed to shell_exec() without sanitization!
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="127.0.0.1 (try: 127.0.0.1; whoami)"
            className="cyber-input"
            style={{ flex: 1 }}
          />
          <button onClick={runPing} disabled={isRunning || !target} className="btn-primary">
            {isRunning ? '...' : 'Ping'}
          </button>
        </div>

        {output && (
          <div className="code-block" style={{ fontSize: 11 }}>
            {output}
          </div>
        )}

        <div style={{ marginTop: 12, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, color: '#ff9900', fontFamily: 'JetBrains Mono', marginBottom: 6 }}>⚠️ BACKEND CODE</div>
          <code style={{ fontSize: 11, color: '#ff9966', fontFamily: 'JetBrains Mono' }}>
            {`$host = $_GET['host'];\n$output = shell_exec("ping -c 3 " . $host);\necho $output;  // No sanitization!`}
          </code>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['127.0.0.1; whoami', '127.0.0.1 | cat /etc/passwd', '127.0.0.1 && id', '`id`'].map((p) => (
            <button
              key={p}
              onClick={() => setTarget(p)}
              style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', color: '#ff3366', fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommandInjectionLab() {
  return (
    <LabLayout
      labSlug="command-injection"
      targetApp={<CmdInjTargetApp />}
      simulate={(payload) => simulateCommandInjection(payload)}
    />
  );
}
