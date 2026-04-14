/**
 * Application-wide constants
 */

export const APP_TITLE = 'Codexion Visual Replayer';
export const UPLOAD_PROMPT = 'Upload a log file to get started.';

export const WS_SIMULATION_PATH = '/api/ws/simulate';
export const SIMULATION_FORM_STORAGE_KEY = 'codexion.simulation-form';

export const SIMULATION_FORM_DEFAULTS = {
  number_of_coders: 5,
  time_to_burnout: 10000,
  time_to_compile: 2000,
  time_to_debug: 1500,
  time_to_refactor: 1000,
  number_of_compiles_required: 1,
  dongle_cooldown: 500,
  scheduler: 'fifo',
} as const;

export const ERROR_MESSAGES = {
  PARSING_FAILED: 'Failed to parse logs',
  MISSING_INITIALIZE: 'Missing INITIALIZE event in log file',
  FETCH_FAILED: 'Failed to connect to simulation server',
  WS_DISCONNECTED: 'WebSocket connection lost',
} as const;

export const SIMULATION_DEFAULTS = {
  MOCK_COOLDOWN_MS: 500,
} as const;
