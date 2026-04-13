import { SimulationStatus, CoderStatus } from './types';
import type { 
  TimedEvent, 
  InitializeEvent, 
  SimulationSnapshot, 
  CoderState, 
  DongleState 
} from './types';
import { SIMULATION_DEFAULTS } from '../constants';

export function generateSnapshot(
  metadata: InitializeEvent,
  events: TimedEvent[],
  eventIndex: number,
  currentTime: number
): SimulationSnapshot {
  const coders = new Map<number, CoderState>();
  const dongles = new Map<number, DongleState>();
  let isBurnedOut = false;
  let isSuccess = false;

  // Initialize coders
  for (let i = 0; i < metadata.num_coders; i++) {
    coders.set(i, {
      id: i,
      status: CoderStatus.IDLE,
      deadline: 0,
      current_dongle_id: null,
      compiles_done: 0,
    });
  }

  // Initialize dongles
  for (let i = 0; i < metadata.num_dongles; i++) {
    dongles.set(i, {
      id: i,
      current_owner_id: null,
      queue: [],
      priorities: [],
      cooldown_until: 0,
    });
  }

  // Process events up to eventIndex (inclusive)
  for (let i = 0; i <= eventIndex && i < events.length; i++) {
    const event = events[i];

    switch (event.status) {
      case SimulationStatus.REQUEST_DONGLE: {
        const coder = coders.get(event.coder_id);
        const dongle = dongles.get(event.dongle_id);
        if (coder) coder.status = CoderStatus.WAITING;
        if (dongle) {
          dongle.queue = event.queue;
          dongle.priorities = event.priorities;
        }
        break;
      }
      case SimulationStatus.TAKE_DONGLE: {
        const coder = coders.get(event.coder_id);
        const dongle = dongles.get(event.dongle_id);
        if (coder) coder.current_dongle_id = event.dongle_id;
        if (dongle) {
          dongle.current_owner_id = event.coder_id;
          dongle.queue = event.queue;
          dongle.priorities = event.priorities;
        }
        break;
      }
      case SimulationStatus.START_COMPILE:
      case SimulationStatus.START_DEBUG:
      case SimulationStatus.START_REFACTOR: {
        const coder = coders.get(event.coder_id);
        if (coder) {
          coder.status = event.status === SimulationStatus.START_COMPILE ? CoderStatus.COMPILING :
                        event.status === SimulationStatus.START_DEBUG ? CoderStatus.DEBUGGING : CoderStatus.REFACTORING;
          coder.deadline = event.details.deadline;
          coder.compiles_done = event.details.compiles_done;
        }
        break;
      }
      case SimulationStatus.RELEASE_DONGLE: {
        const coder = coders.get(event.coder_id);
        const dongle = dongles.get(event.dongle_id);
        if (coder) {
          coder.status = CoderStatus.IDLE;
          coder.current_dongle_id = null;
        }
        if (dongle) {
          dongle.current_owner_id = null;
          dongle.cooldown_until = event.ts + SIMULATION_DEFAULTS.MOCK_COOLDOWN_MS;
        }
        break;
      }
      case SimulationStatus.BURNOUT: {
        const coder = coders.get(event.coder_id);
        if (coder) coder.status = CoderStatus.BURNOUT;
        isBurnedOut = true;
        break;
      }
      case SimulationStatus.SUCCESS: {
        isSuccess = true;
        break;
      }
    }
  }

  return {
    ts: currentTime,
    coders,
    dongles,
    isBurnedOut,
    isSuccess,
  };
}
