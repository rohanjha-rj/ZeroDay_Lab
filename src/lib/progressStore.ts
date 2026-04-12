import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RANKS, BADGES } from './labData';

export interface AttackStep {
  timestamp: number;
  action: string;
  payload: string;
  result: 'success' | 'failure' | 'info';
  detail: string;
}

export interface CompletedLab {
  labId: string;
  completedAt: number;
  xpEarned: number;
  hintsUsed: number;
  timeSeconds: number;
  steps: AttackStep[];
}

export interface ProgressState {
  xp: number;
  completedLabs: CompletedLab[];
  earnedBadges: string[];
  currentStreak: number;
  totalAttacks: number;
  hintsUsed: number;

  // Actions
  addXP: (amount: number) => void;
  completelab: (lab: CompletedLab) => void;
  earnBadge: (badgeId: string) => void;
  incrementAttacks: () => void;
  incrementHints: () => void;
  getRank: () => typeof RANKS[0];
  getXPToNextRank: () => number;
  getProgressPercent: () => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      completedLabs: [],
      earnedBadges: [],
      currentStreak: 0,
      totalAttacks: 0,
      hintsUsed: 0,

      addXP: (amount) =>
        set((state) => ({ xp: state.xp + amount })),

      completelab: (lab) =>
        set((state) => {
          const already = state.completedLabs.find((l) => l.labId === lab.labId);
          if (already) return state;
          const newBadges = [...state.earnedBadges];
          if (state.completedLabs.length === 0 && !newBadges.includes('first-blood')) {
            newBadges.push('first-blood');
          }
          const xssDone = ['lab-xss'].every((id) =>
            [...state.completedLabs.map((l) => l.labId), lab.labId].includes(id)
          );
          if (xssDone && !newBadges.includes('xss-lord')) newBadges.push('xss-lord');
          if (!lab.steps.some((s) => s.action === 'hint') && !newBadges.includes('no-hints')) {
            newBadges.push('no-hints');
          }
          if (lab.timeSeconds < 120 && !newBadges.includes('speed-runner')) {
            newBadges.push('speed-runner');
          }
          const allLabs = [...state.completedLabs.map((l) => l.labId), lab.labId];
          if (allLabs.length >= 5 && !newBadges.includes('web-ninja')) {
            newBadges.push('web-ninja');
          }
          return {
            completedLabs: [...state.completedLabs, lab],
            xp: state.xp + lab.xpEarned,
            earnedBadges: newBadges,
            totalAttacks: state.totalAttacks + lab.steps.filter((s) => s.result === 'success').length,
          };
        }),

      earnBadge: (badgeId) =>
        set((state) => ({
          earnedBadges: state.earnedBadges.includes(badgeId)
            ? state.earnedBadges
            : [...state.earnedBadges, badgeId],
        })),

      incrementAttacks: () =>
        set((state) => ({ totalAttacks: state.totalAttacks + 1 })),

      incrementHints: () =>
        set((state) => ({ hintsUsed: state.hintsUsed + 1 })),

      getRank: () => {
        const { xp } = get();
        return RANKS.findLast((r) => xp >= r.minXP) ?? RANKS[0];
      },

      getXPToNextRank: () => {
        const { xp } = get();
        const next = RANKS.find((r) => xp < r.minXP);
        return next ? next.minXP - xp : 0;
      },

      getProgressPercent: () => {
        const { xp } = get();
        const currentRank = RANKS.findLast((r) => xp >= r.minXP) ?? RANKS[0];
        const nextRank = RANKS.find((r) => xp < r.minXP);
        if (!nextRank) return 100;
        const range = nextRank.minXP - currentRank.minXP;
        const progress = xp - currentRank.minXP;
        return Math.min(100, Math.round((progress / range) * 100));
      },
    }),
    {
      name: 'cybersec-progress',
    }
  )
);
