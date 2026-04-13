import { create } from 'zustand';
import type { TimedEvent, InitializeEvent, SimulationConfig } from '../utils/types';
import { parseLogs } from '../utils/parser';
import { ERROR_MESSAGES, API_SIMULATION_PATH } from '../constants';

interface LogStore {
  metadata: InitializeEvent | null;
  events: TimedEvent[];
  currentTime: number;
  currentEventIndex: number;
  maxTime: number;
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  speed: number;

  setLogs: (content: string) => void;
  fetchLogs: (config: SimulationConfig) => Promise<void>;
  setCurrentTime: (ts: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  goToNextEvent: () => void;
  goToPrevEvent: () => void;
  reset: () => void;
}

export const useLogStore = create<LogStore>((set, get) => ({
  metadata: null,
  events: [],
  currentTime: 0,
  currentEventIndex: -1,
  maxTime: 0,
  isLoading: false,
  error: null,
  isPlaying: false,
  speed: 1,

  setLogs: (content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { metadata, events, maxTime } = parseLogs(content);
      set({ 
        metadata, 
        events, 
        maxTime, 
        currentTime: 0, 
        currentEventIndex: -1,
        isLoading: false, 
        isPlaying: false 
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ERROR_MESSAGES.PARSING_FAILED;
      set({ error: message, isLoading: false });
    }
  },

  fetchLogs: async (config: SimulationConfig) => {
    set({ isLoading: true, error: null });
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}${API_SIMULATION_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.FETCH_FAILED);
      }

      const content = await response.text();
      get().setLogs(content);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ERROR_MESSAGES.FETCH_FAILED;
      set({ error: message, isLoading: false });
    }
  },

  setCurrentTime: (ts: number) => {
    set((state) => {
      const clampedTs = Math.max(0, Math.min(ts, state.maxTime));
      let newIndex = -1;
      for (let i = 0; i < state.events.length; i++) {
        if (state.events[i].ts <= clampedTs) {
          newIndex = i;
        } else {
          break;
        }
      }
      return {
        currentTime: clampedTs,
        currentEventIndex: newIndex,
        isPlaying: clampedTs >= state.maxTime ? false : state.isPlaying,
      };
    });
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setSpeed: (speed: number) => set({ speed }),

  goToNextEvent: () => {
    set((state) => {
      const nextIndex = state.currentEventIndex + 1;
      if (nextIndex < state.events.length) {
        return { 
          currentEventIndex: nextIndex,
          currentTime: state.events[nextIndex].ts
        };
      }
      return { 
        currentTime: state.maxTime,
        currentEventIndex: state.events.length - 1
      };
    });
  },

  goToPrevEvent: () => {
    set((state) => {
      const prevIndex = state.currentEventIndex - 1;
      if (prevIndex >= -1) {
        const prevTs = prevIndex >= 0 ? state.events[prevIndex].ts : 0;
        return { 
          currentEventIndex: prevIndex,
          currentTime: prevTs
        };
      }
      return { currentTime: 0, currentEventIndex: -1 };
    });
  },

  reset: () => {
    set({
      metadata: null,
      events: [],
      currentTime: 0,
      currentEventIndex: -1,
      maxTime: 0,
      isLoading: false,
      error: null,
      isPlaying: false,
      speed: 1,
    });
  },
}));
