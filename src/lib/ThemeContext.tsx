'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'stealth' | 'matrix' | 'neon' | 'blood';

interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    bg: string;
    card: string;
    primary: string;
    secondary: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
  };
}

const THEMES: Record<ThemeId, Theme> = {
  stealth: {
    id: 'stealth',
    name: 'Stealth Ops',
    colors: {
      bg: '#050a10',
      card: 'rgba(15, 23, 42, 0.4)',
      primary: '#3b82f6',
      secondary: '#64748b',
      border: 'rgba(255, 255, 255, 0.08)',
      text: '#f8fafc',
      muted: '#94a3b8',
      accent: '#00d4ff',
    }
  },
  matrix: {
    id: 'matrix',
    name: 'Digital Rain',
    colors: {
      bg: '#0a0d0a',
      card: 'rgba(0, 20, 0, 0.4)',
      primary: '#00ff41',
      secondary: '#003b00',
      border: 'rgba(0, 255, 65, 0.15)',
      text: '#00ff41',
      muted: '#008f11',
      accent: '#00ff41',
    }
  },
  neon: {
    id: 'neon',
    name: 'Cyberpunk Neon',
    colors: {
      bg: '#0d0d1a',
      card: 'rgba(26, 26, 46, 0.4)',
      primary: '#ff00ff',
      secondary: '#7000ff',
      border: 'rgba(0, 255, 255, 0.15)',
      text: '#ffffff',
      muted: '#9ca3af',
      accent: '#00ffff',
    }
  },
  blood: {
    id: 'blood',
    name: 'Red Team',
    colors: {
      bg: '#1a0505',
      card: 'rgba(45, 10, 10, 0.4)',
      primary: '#ef4444',
      secondary: '#7f1d1d',
      border: 'rgba(239, 68, 68, 0.15)',
      text: '#fee2e2',
      muted: '#991b1b',
      accent: '#ff3366',
    }
  }
};

interface ThemeContextType {
  activeTheme: Theme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('stealth');

  useEffect(() => {
    const saved = localStorage.getItem('zeroday-theme') as ThemeId;
    if (saved && THEMES[saved]) setThemeId(saved);
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem('zeroday-theme', id);
  };

  const activeTheme = THEMES[themeId];

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = activeTheme;
    
    root.style.setProperty('--bg-primary', colors.bg);
    root.style.setProperty('--bg-card', colors.card);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--text-muted', colors.muted);
    root.style.setProperty('--border-primary', colors.border);
    root.style.setProperty('--neon-cyan', colors.accent);
    root.style.setProperty('--accent-glow', colors.primary);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
