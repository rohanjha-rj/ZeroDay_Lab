'use client';
import { useState } from 'react';
import { Play, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  method: string;
  url: string;
  payload: string;
  onForward: (newPayload: string) => void;
  onDrop: () => void;
}

export default function RequestInterceptor({ method, url, payload, onForward, onDrop }: Props) {
  const [editedPayload, setEditedPayload] = useState(payload);
  const rawRequest = `${method} ${url} HTTP/1.1\nHost: vulnerable-target.lab\nUser-Agent: ZeroDay-Scanner/2.0\nAccept: */*\nContent-Type: application/x-www-form-urlencoded\nContent-Length: ${editedPayload.length}\n\npayload=${editedPayload}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d11', fontFamily: 'JetBrains Mono' }}>
      <div style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: 11, fontWeight: 800 }}>
            <ShieldAlert size={14} /> REQUEST_INTERCEPTED
         </div>
         <div style={{ display: 'flex', gap: 8 }}>
            <button 
                onClick={onDrop}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 12px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
            >
                <Trash2 size={12} style={{ marginRight: 4 }} /> DROP
            </button>
            <button 
                onClick={() => onForward(editedPayload)}
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '4px 12px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
            >
                <Play size={12} style={{ marginRight: 4 }} /> FORWARD
            </button>
         </div>
      </div>

      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>EDITABLE_RAW_HTTP:</div>
        <textarea
            value={rawRequest}
            onChange={(e) => {
                const parts = e.target.value.split('\n\npayload=');
                if (parts.length > 1) setEditedPayload(parts[1]);
            }}
            style={{
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: 16,
                color: '#f59e0b',
                fontSize: 12,
                lineHeight: 1.5,
                outline: 'none',
                resize: 'none',
            }}
        />
      </div>
      
      <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', fontSize: 10, color: 'var(--text-muted)' }}>
        ⚠️ Modifying the request headers may alter the exploitation path. Proceed with caution.
      </div>
    </div>
  );
}
