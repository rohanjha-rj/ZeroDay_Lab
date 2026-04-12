'use client';
import { useProgressStore } from '@/lib/progressStore';
import { LABS, BADGES, RANKS } from '@/lib/labData';
import { Zap, Shield, Target, Clock, Lightbulb, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { xp, completedLabs, earnedBadges, totalAttacks, hintsUsed, getRank, getProgressPercent, getXPToNextRank } = useProgressStore();
  const rank = getRank();
  const progress = getProgressPercent();
  const xpToNext = getXPToNextRank();
  const nextRank = RANKS.find((r) => xp < r.minXP);

  const skillData = [
    { label: 'XSS', score: completedLabs.some((l) => l.labId === 'lab-xss') ? 85 : 10, color: '#ffcc00' },
    { label: 'SQLi', score: completedLabs.some((l) => l.labId === 'lab-sqli') ? 90 : 15, color: '#ff3366' },
    { label: 'CSRF', score: completedLabs.some((l) => l.labId === 'lab-csrf') ? 75 : 8, color: '#00d4ff' },
    { label: 'Auth', score: completedLabs.some((l) => l.labId === 'lab-auth') ? 80 : 12, color: '#a855f7' },
    { label: 'Upload', score: completedLabs.some((l) => l.labId === 'lab-upload') ? 70 : 5, color: '#ff6600' },
    { label: 'SSRF', score: completedLabs.some((l) => l.labId === 'lab-ssrf') ? 65 : 5, color: '#00ff88' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 20 }}>
        👤 Hacker Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Rank Card */}
        <div>
          <div
            className="glass-card"
            style={{
              padding: 24,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${rank.color}0d, rgba(0,0,0,0))`,
              borderColor: `${rank.color}30`,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>{rank.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: rank.color, fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
              {rank.name}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', margin: '12px 0 6px' }}>
              {xp.toLocaleString()} XP
            </div>

            <div className="xp-bar" style={{ margin: '8px 0 4px' }}>
              <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            {nextRank && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                {xpToNext} XP → {nextRank.icon} {nextRank.name}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
              {[
                { label: 'Labs Done', value: completedLabs.length, icon: '🧪' },
                { label: 'Attacks', value: totalAttacks, icon: '⚔️' },
                { label: 'Badges', value: earnedBadges.length, icon: '🏆' },
                { label: 'Hints Used', value: hintsUsed, icon: '💡' },
              ].map((s) => (
                <div key={s.label} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rank progression */}
          <div className="glass-card" style={{ padding: 16, marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 12 }}>RANK PROGRESSION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RANKS.map((r) => {
                const isCurrentRank = xp >= r.minXP && (r.maxXP === Infinity || xp < r.maxXP);
                const isPast = xp >= r.minXP && !isCurrentRank;
                return (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isPast || isCurrentRank ? 1 : 0.4 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: isCurrentRank ? r.color : 'var(--text-secondary)', fontWeight: isCurrentRank ? 700 : 400 }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        {r.minXP.toLocaleString()} XP
                      </div>
                    </div>
                    {isCurrentRank && (
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${r.color}20`, color: r.color, fontFamily: 'JetBrains Mono' }}>
                        CURRENT
                      </span>
                    )}
                    {isPast && <span style={{ fontSize: 14 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Skills + Badges + Lab history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Skill bars */}
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 16 }}>
              📊 Skill Assessment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {skillData.map((skill) => (
                <div key={skill.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{skill.label}</span>
                    <span style={{ fontSize: 12, color: skill.color, fontFamily: 'JetBrains Mono' }}>{skill.score}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${skill.score}%`, height: '100%', background: `linear-gradient(90deg, ${skill.color}88, ${skill.color})`, borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 14 }}>
              🏆 Achievement Badges ({earnedBadges.length}/{BADGES.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {BADGES.map((badge) => {
                const earned = earnedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    style={{
                      textAlign: 'center',
                      padding: '12px 8px',
                      borderRadius: 10,
                      background: earned ? 'rgba(0,255,136,0.06)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${earned ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.04)'}`,
                      filter: earned ? 'none' : 'grayscale(1) opacity(0.3)',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{badge.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: earned ? 'var(--neon-green)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 2 }}>
                      {badge.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3 }}>{badge.description}</div>
                    {earned && (
                      <div style={{ fontSize: 9, color: 'var(--neon-yellow)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>+{badge.xp} XP</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Labs */}
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginBottom: 14 }}>
              🧪 Completed Labs
            </div>
            {completedLabs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
                No labs completed yet. Start hacking! 🔓
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completedLabs.map((cl) => {
                  const lab = LABS.find((l) => l.id === cl.labId);
                  if (!lab) return null;
                  return (
                    <div key={cl.labId} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{lab.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lab.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                          {new Date(cl.completedAt).toLocaleDateString()} · {cl.timeSeconds}s · {cl.hintsUsed} hints
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'JetBrains Mono' }}>+{cl.xpEarned} XP</div>
                        <div style={{ fontSize: 9, color: 'var(--neon-green)' }}>✓ Completed</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
