'use client';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Swords } from 'lucide-react';

let socket: Socket;

export default function MultiplayerPage() {
  const [role, setRole] = useState<null | 'attacker' | 'defender' | 'viewer'>(null);
  const [joined, setJoined] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [payloadText, setPayloadText] = useState('');

  // Auto-generate a dummy username for this session
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(`hacker_${Math.floor(Math.random() * 1000)}`);
  }, []);

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('rooms-list', (serverRooms) => {
      setRooms(serverRooms);
    });

    socket.on('room-updated', (room) => {
      setCurrentRoom(room);
    });

    socket.on('action-log', (log) => {
      setLogs((prev) => [...prev, log]);
    });

    socket.emit('get-rooms');

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = () => {
    socket.emit('create-room', { roomName: `${username}'s Arena`, type: 'XSS' });
  };

  const joinRoom = (roomId: string, targetRole: 'attacker' | 'defender' | 'viewer') => {
    setRole(targetRole);
    socket.emit('join-room', { roomId, role: targetRole, username });
    setJoined(true);
  };

  const sendPayload = () => {
    if (!payloadText.trim() || !currentRoom) return;
    socket.emit('attack-payload', { roomId: currentRoom.id, payload: payloadText });
    setPayloadText('');
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Swords size={28} style={{ color: 'var(--neon-red)' }} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
            Multiplayer — Attack vs Defend
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Real-Time WebSocket Combat (Powered by Node.js & Socket.io)
          </div>
        </div>
      </div>

      {!joined ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                Live Combat Rooms
              </div>
              <button className="btn-primary" onClick={createRoom} style={{ padding: '6px 16px', fontSize: 12, flexShrink: 0 }}>
                + Create Room
              </button>
            </div>
            
            {rooms.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No active rooms. Create one to start!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map((room) => (
                <div key={room.id} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="status-dot online" style={{ width: 10, height: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{room.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                      {room.attacker || 'WAITING'} vs {room.defender || 'WAITING'}
                    </div>
                  </div>
                  {!room.attacker && (
                    <button className="btn-primary" onClick={() => joinRoom(room.id, 'attacker')} style={{ padding: '5px 14px', fontSize: 11, background: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}>
                      Join Attacker
                    </button>
                  )}
                  {!room.defender && (
                    <button className="btn-primary" onClick={() => joinRoom(room.id, 'defender')} style={{ padding: '5px 14px', fontSize: 11 }}>
                      Join Defender
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: role === 'attacker' ? 'var(--neon-red)' : 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>
              YOU ARE THE {role?.toUpperCase()}
            </div>
            <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 16 }}>
              Status: <strong>{currentRoom?.status.toUpperCase()}</strong>
            </div>

            {role === 'attacker' && (
              <div>
                <input 
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  placeholder="Enter attack payload..." 
                  className="cyber-input" 
                  style={{ width: '100%', marginBottom: 10 }}
                />
                <button onClick={sendPayload} className="btn-primary" style={{ background: 'var(--neon-red)', borderColor: 'var(--neon-red)', width: '100%' }}>Launch Live Exploit</button>
              </div>
            )}
            {role === 'defender' && (
              <div>
                <button onClick={() => {
                   if(currentRoom) socket.emit('defend-patch', { roomId: currentRoom.id, patchId: 'WAF_BLOCK' })
                }} className="btn-primary" style={{ width: '100%' }}>Deploy WAF Patch</button>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 10 }}>📜 LIVE ARENA LOGS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ fontSize: 11, padding: 8, background: 'var(--bg-secondary)', borderRadius: 6, borderLeft: `2px solid ${log.type === 'attack' ? 'var(--neon-red)' : 'var(--neon-green)'}` }}>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(log.time).toLocaleTimeString()}</span><br/>
                  <span style={{ color: log.type === 'attack' ? 'var(--neon-red)' : 'var(--neon-green)' }}>{log.type.toUpperCase()}:</span> {log.data}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
