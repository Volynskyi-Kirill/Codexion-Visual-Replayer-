import { create } from 'zustand';
import type { TimedEvent, InitializeEvent } from '../utils/types';
import { parseLogs } from '../utils/parser';
import { ERROR_MESSAGES } from '../constants';

interface LogStore {
  metadata: InitializeEvent | null;
  events: TimedEvent[];
  currentTime: number;
  maxTime: number;
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  speed: number;

  setLogs: (content: string) => void;
  setCurrentTime: (ts: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  metadata: null,
  events: [],
  currentTime: 0,
  maxTime: 0,
  isLoading: false,
  error: null,
  isPlaying: false,
  speed: 1,

  setLogs: (content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { metadata, events, maxTime } = parseLogs(content);
      set({ metadata, events, maxTime, currentTime: 0, isLoading: false, isPlaying: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ERROR_MESSAGES.PARSING_FAILED;
      set({ error: message, isLoading: false });
    }
  },

  setCurrentTime: (ts: number) => {
    set((state) => ({
      currentTime: Math.max(0, Math.min(ts, state.maxTime)),
      isPlaying: ts >= state.maxTime ? false : state.isPlaying,
    }));
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setSpeed: (speed: number) => set({ speed }),

  reset: () => {
    set({
      metadata: null,
      events: [],
      currentTime: 0,
      maxTime: 0,
      isLoading: false,
      error: null,
      isPlaying: false,
      speed: 1,
    });
  },
}));
