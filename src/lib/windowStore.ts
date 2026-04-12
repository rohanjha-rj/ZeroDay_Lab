import { create } from 'zustand';

export type WindowId = 'terminal' | 'visualizer' | 'mentor' | 'attack' | 'osint' | 'interceptor' | 'code' | 'report' | 'leaderboard';

interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
}

interface WindowStore {
  windows: Record<WindowId, WindowState>;
  activeWindow: WindowId | null;
  maxZ: number;
  
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  updatePosition: (id: WindowId, x: number, y: number) => void;
  updateSize: (id: WindowId, width: number | string, height: number | string) => void;
}

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  attack: { id: 'attack', title: 'Attack Console', isOpen: true, isMinimized: false, zIndex: 10, x: 20, y: 20, width: 400, height: 600 },
  visualizer: { id: 'visualizer', title: 'Attack Flow Visualizer', isOpen: true, isMinimized: false, zIndex: 5, x: 440, y: 20, width: 680, height: 380 },
  terminal: { id: 'terminal', title: 'Terminal Shell', isOpen: false, isMinimized: false, zIndex: 1, x: 440, y: 420, width: 680, height: 320 },
  mentor: { id: 'mentor', title: 'AI Mentor', isOpen: false, isMinimized: false, zIndex: 1, x: 1140, y: 20, width: 340, height: 720 },
  osint: { id: 'osint', title: 'Dark Web Browser', isOpen: false, isMinimized: false, zIndex: 1, x: 100, y: 100, width: 800, height: 500 },
  interceptor: { id: 'interceptor', title: 'Request Interceptor', isOpen: false, isMinimized: false, zIndex: 100, x: 300, y: 150, width: 500, height: 400 },
  code: { id: 'code', title: 'Security Audit / IDE', isOpen: false, isMinimized: false, zIndex: 1, x: 50, y: 50, width: 900, height: 650 },
  report: { id: 'report', title: 'Pentest Report', isOpen: false, isMinimized: false, zIndex: 1, x: 200, y: 50, width: 600, height: 700 },
  leaderboard: { id: 'leaderboard', title: 'Blitz Rankings', isOpen: false, isMinimized: false, zIndex: 1, x: 300, y: 100, width: 400, height: 500 },
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: INITIAL_WINDOWS,
  activeWindow: 'attack',
  maxZ: 10,

  openWindow: (id) => set((state) => {
    const newMaxZ = state.maxZ + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: newMaxZ }
      },
      activeWindow: id,
      maxZ: newMaxZ
    };
  }),

  closeWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false }
    },
    activeWindow: state.activeWindow === id ? null : state.activeWindow
  })),

  minimizeWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isMinimized: true }
    },
    activeWindow: state.activeWindow === id ? null : state.activeWindow
  })),

  focusWindow: (id) => set((state) => {
    if (state.windows[id].zIndex === state.maxZ) return state;
    const newMaxZ = state.maxZ + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], zIndex: newMaxZ, isMinimized: false }
      },
      activeWindow: id,
      maxZ: newMaxZ
    };
  }),

  updatePosition: (id, x, y) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], x, y }
    }
  })),

  updateSize: (id, width, height) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], width, height }
    }
  })),
}));
