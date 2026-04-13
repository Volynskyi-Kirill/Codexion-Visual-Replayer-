import { create } from 'zustand';
import type {
    TimedEvent,
    InitializeEvent,
    SimulationConfig,
} from '../utils/types';
import { parseLogs, parseLogLine } from '../utils/parser';
import { ERROR_MESSAGES, WS_SIMULATION_PATH } from '../constants';
import { SimulationStatus } from '../utils/types';

interface LogStore {
    metadata: InitializeEvent | null;
    events: TimedEvent[];
    currentTime: number;
    currentEventIndex: number;
    maxTime: number;
    isLoading: boolean;
    isStreaming: boolean;
    streamingStartTime: number | null;
    error: string | null;
    isPlaying: boolean;
    speed: number;

    setLogs: (content: string) => void;
    startSimulation: (config: SimulationConfig) => Promise<void>;
    setCurrentTime: (ts: number, dynamicMaxTime?: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setSpeed: (speed: number) => void;
    goToNextEvent: () => void;
    goToPrevEvent: () => void;
    reset: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
    metadata: null,
    events: [],
    currentTime: 0,
    currentEventIndex: -1,
    maxTime: 0,
    isLoading: false,
    isStreaming: false,
    streamingStartTime: null,
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
                isPlaying: false,
            });
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : ERROR_MESSAGES.PARSING_FAILED;
            set({ error: message, isLoading: false });
        }
    },

    startSimulation: async (config: SimulationConfig) => {
        set({
            isLoading: true,
            isStreaming: true,
            streamingStartTime: null,
            error: null,
            events: [],
            metadata: null,
            currentTime: 0,
            maxTime: 0,
            currentEventIndex: -1,
        });

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
        const host = configuredBaseUrl
            ? configuredBaseUrl.replace(/^(wss?:|https?:)?\/\//, '')
            : window.location.host;
        const wsUrl = `${protocol}//${host}${WS_SIMULATION_PATH}`;

        try {
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                socket.send(JSON.stringify(config));
            };

            socket.onmessage = (msg) => {
                const parsed = parseLogLine(msg.data);
                if (!parsed) return;

                if (parsed.status === SimulationStatus.INITIALIZE) {
                    set({
                        metadata: parsed,
                        isLoading: false,
                        isPlaying: true,
                        streamingStartTime: Date.now(),
                    });
                } else {
                    set((state) => {
                        const newEvents = [
                            ...state.events,
                            parsed as TimedEvent,
                        ];
                        const newMaxTime = Math.max(state.maxTime, parsed.ts);

                        const shouldFollow =
                            state.currentTime === state.maxTime;

                        return {
                            events: newEvents,
                            maxTime: newMaxTime,
                            currentTime: shouldFollow
                                ? newMaxTime
                                : state.currentTime,
                            currentEventIndex: shouldFollow
                                ? newEvents.length - 1
                                : state.currentEventIndex,
                        };
                    });
                }
            };

            socket.onerror = () => {
                set({
                    error: ERROR_MESSAGES.FETCH_FAILED,
                    isLoading: false,
                    isStreaming: false,
                    streamingStartTime: null,
                });
            };

            socket.onclose = () => {
                set({
                    isStreaming: false,
                    isPlaying: false,
                    streamingStartTime: null,
                });
            };
        } catch (e) {
            set({
                error: ERROR_MESSAGES.FETCH_FAILED,
                isLoading: false,
                isStreaming: false,
                streamingStartTime: null,
            });
        }
    },

    setCurrentTime: (ts: number, dynamicMaxTime?: number) => {
        set((state) => {
            const currentMax =
                dynamicMaxTime !== undefined
                    ? Math.max(state.maxTime, dynamicMaxTime)
                    : state.maxTime;
            const clampedTs = Math.max(0, Math.min(ts, currentMax));
            let newIndex = -1;

            if (clampedTs > 0) {
                for (let i = 0; i < state.events.length; i++) {
                    if (state.events[i].ts <= clampedTs) {
                        newIndex = i;
                    } else {
                        break;
                    }
                }
            }

            const shouldStop = !state.isStreaming && clampedTs >= currentMax;

            return {
                maxTime: currentMax,
                currentTime: clampedTs,
                currentEventIndex: newIndex,
                isPlaying: shouldStop ? false : state.isPlaying,
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
                    currentTime: state.events[nextIndex].ts,
                };
            }
            return {
                currentTime: state.maxTime,
                currentEventIndex: state.events.length - 1,
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
                    currentTime: prevTs,
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
            streamingStartTime: null,
        });
    },
}));
