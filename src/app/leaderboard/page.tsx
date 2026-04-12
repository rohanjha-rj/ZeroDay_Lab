'use client';
import { useState } from 'react';
import { Trophy, Zap, Shield, Target } from 'lucide-react';
import { RANKS } from '@/lib/labData';
import { useProgressStore } from '@/lib/progressStore';

const FAKE_PLAYERS = [
  { rank: 1, name: 'n0p_sl33p', xp: 18450, icon: '👑', rankName: 'Zero Day King', completedLabs: 8, country: '🇷🇺' },
  { rank: 2, name: 'h4ck3r_pr1m3', xp: 14200, icon: '💀', rankName: 'Elite Hacker', completedLabs: 8, country: '🇺🇸' },
  { rank: 3, name: 'xss_master69', xp: 11800, icon: '💀', rankName: 'Elite Hacker', completedLabs: 7, country: '🇩🇪' },
  { rank: 4, name: 'sqli_king', xp: 9600, icon: '🐛', rankName: 'Bug Hunter', completedLabs: 7, country: '🇨🇳' },
  { rank: 5, name: 'b4d_p0w3r', xp: 8100, icon: '🐛', rankName: 'Bug Hunter', completedLabs: 6, country: '🇧🇷' },
  { rank: 6, name: 'nullp0int3r', xp: 6900, icon: '🐛', rankName: 'Bug Hunter', completedLabs: 6, country: '🇮🇳' },
  { rank: 7, name: 'recon_l0rd', xp: 5200, icon: '⚔️', rankName: 'Red Teamer', completedLabs: 5, country: '🇬🇧' },
  { rank: 8, name: 'pent3st3r', xp: 4100, icon: '⚔️', rankName: 'Red Teamer', completedLabs: 5, country: '🇫🇷' },
  { rank: 9, name: 'ch4os_age_nt', xp: 2800, icon: '🔍', rankName: 'Pentest', completedLabs: 4, country: '🇯🇵' },
  { rank: 10, name: 'an0nym_0us', xp: 1400, icon: '🎯', rankName: 'Novice Hacker', completedLabs: 3, country: '🇰🇷' },
];

const CHALLENGES = [
  { title: 'SQLi Speed Run', desc: 'Dump the database in under 60 seconds', xp: 500, expires: '2h 14m', difficulty: 'Hard' },
  { title: 'XSS Maestro', desc: 'Execute 5 different XSS payloads', xp: 300, expires: '5h 32m', difficulty: 'Medium' },
  { title: 'No Hints Challenge', desc: 'Complete SSRF lab without hints', xp: 400, expires: '23h 10m', difficulty: 'Hard' },
];

export default function LeaderboardPage() {
  const { xp, getRank, completedLabs } = useProgressStore();
  const rank = getRank();

  const allPlayers = [...FAKE_PLAYERS, {
    rank: 0, name: 'YOU', xp, icon: rank.icon,
    rankName: rank.name, completedLabs: completedLabs.length, country: '⭐',
  }].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));

  const myRank = allPlayers.findIndex((p) => p.name === 'YOU') + 1;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
          🏆 Global Leaderboard
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All Time', 'This Week', 'Today'].map((t, i) => (
            <button key={t} className={`cyber-tab ${i === 0 ? 'active' : ''}`} style={{ fontSize: 12 }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Leaderboard table */}
        <div>
          {/* Top 3 podium */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[allPlayers[1], allPlayers[0], allPlayers[2]].map((p, i) => {
              const positions = [2, 1, 3];
              const pos = positions[i];
              const colors = ['#94a3b8', '#ffcc00', '#ff6600'];
              const sizes = [80, 96, 76];
              return (
                <div key={p.name} style={{ textAlign: 'center', position: 'relative' }}>
                  {pos === 1 && (
                    <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 24 }}>👑</div>
                  )}
                  <div style={{
                    width: sizes[i], height: sizes[i], borderRadius: '50%', margin: '16px auto 10px',
                    background: `radial-gradient(circle, ${colors[i]}33, ${colors[i]}11)`,
                    border: `2px solid ${colors[i]}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: i === 1 ? 40 : 32,
                  }}>
                    {p.icon}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', color: colors[i], fontWeight: 700, fontSize: i === 1 ? 15 : 13 }}>
                    #{pos} {p.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    {p.xp.toLocaleString()} XP
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,255,136,0.1)' }}>
                  {['Rank', 'Player', 'Rank Title', 'Labs', 'XP'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((player) => {
                  const isMe = player.name === 'YOU';
                  return (
                    <tr
                      key={player.name}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: isMe ? 'rgba(0,255,136,0.05)' : player.rank <= 3 ? 'rgba(255,204,0,0.03)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                        <span style={{ color: player.rank === 1 ? '#ffcc00' : player.rank === 2 ? '#94a3b8' : player.rank === 3 ? '#ff6600' : 'var(--text-muted)' }}>
                          {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{player.country}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: isMe ? 'var(--neon-green)' : 'var(--text-primary)', fontWeight: isMe ? 700 : 400 }}>
                            {player.name}
                            {isMe && <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 6px', borderRadius: 10, background: 'rgba(0,255,136,0.15)', color: 'var(--neon-green)' }}>YOU</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{player.icon} {player.rankName}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--neon-cyan)' }}>
                        {player.completedLabs}/8
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: isMe ? 'var(--neon-green)' : 'var(--text-primary)' }}>
                        {player.xp.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Challenges + Your stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
              🏅 Your Standing
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Global ranking</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>
              #{myRank}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: rank.color, fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              {rank.icon} {rank.name}
            </div>
            <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', marginTop: 8 }}>
              {xp.toLocaleString()} XP
            </div>
          </div>

          {/* Weekly Challenges */}
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 14 }}>
              ⚡ Weekly Challenges
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHALLENGES.map((ch) => (
                <div key={ch.title} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,204,0,0.1)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{ch.title}</div>
                    <span style={{ fontSize: 10, color: '#ffcc00', fontFamily: 'JetBrains Mono' }}>+{ch.xp} XP</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{ch.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>⏱ {ch.expires}</span>
                    <span className="badge badge-red" style={{ fontSize: 9 }}>{ch.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
