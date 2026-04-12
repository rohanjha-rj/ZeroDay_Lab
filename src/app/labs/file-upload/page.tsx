'use client';
import { useState } from 'react';
import LabLayout from '@/components/LabLayout';
import { simulateFileUpload } from '@/lib/attackEngine';
import { UploadCloud, FileType, CheckCircle } from 'lucide-react';

function UploadTargetApp() {
  const [drag, setDrag] = useState(false);
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Company Portal: Secure File Upload</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Please upload your profile avatar. Allowed formats: JPG, PNG, GIF. Max size: 2MB.
        </p>
      </div>

      <div 
        style={{
          border: `2px dashed ${drag ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          background: drag ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); }}
      >
        <UploadCloud size={32} style={{ margin: '0 auto 12px', color: drag ? 'var(--neon-green)' : 'var(--text-muted)' }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
          Drag & Drop your avatar here
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          or click to browse from computer
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          <FileType size={16} /> Backend Filters Active:
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}><CheckCircle size={12} color="var(--neon-green)" /> Mime Type Validator active</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}><CheckCircle size={12} color="var(--neon-green)" /> Extension Blacklist (.php, .exe, .sh)</li>
        </ul>
      </div>
    </div>
  );
}

export default function FileUploadLab() {
  return (
    <LabLayout
      labSlug="file-upload"
      targetApp={<UploadTargetApp />}
      extraInput={{ label: 'Filename', placeholder: 'e.g. image.jpg' }}
      simulate={(payload, extra) => simulateFileUpload(payload, extra || 'avatar.png')}
    />
  );
}
