import { SimulationStatus, CoderStatus } from './types';
import type {
    TimedEvent,
    InitializeEvent,
    SimulationSnapshot,
    CoderState,
    DongleState,
} from './types';
import { SIMULATION_DEFAULTS } from '../constants';
import { COLORS } from './constants';

export const getCenterHubStrokeColor = (snapshot: SimulationSnapshot) => {
    if (snapshot.isBurnedOut) return COLORS.BURNOUT;
    if (snapshot.isSuccess) return COLORS.SUCCESS;
    return COLORS.DEBUGGING;
};

export const getCenterHubLabel = (snapshot: SimulationSnapshot) => {
    if (snapshot.isBurnedOut) return 'BURNED OUT';
    if (snapshot.isSuccess) return 'SUCCESS';
    return 'COMPILER';
};

export function generateSnapshot(
    metadata: InitializeEvent,
    events: TimedEvent[],
    eventIndex: number,
    currentTime: number,
): SimulationSnapshot {
    const coders = new Map<number, CoderState>();
    const dongles = new Map<number, DongleState>();
    let isBurnedOut = false;
    let isSuccess = false;

    // Initialize coders
    for (let i = 1; i <= metadata.num_coders; i++) {
        coders.set(i, {
            id: i,
            status: CoderStatus.IDLE,
            deadline: metadata.time_to_burnout,
            current_dongle_id: null,
            current_dongle_ids: [],
            compiles_done: 0,
            last_state_change_ts: 0,
            last_compile_ts: 0,
        });
    }

    // Initialize dongles
    for (let i = 1; i <= metadata.num_dongles; i++) {
        dongles.set(i, {
            id: i,
            current_owner_id: null,
            queue: [],
            priorities: [],
            cooldown_until: 0,
            last_release_ts: -1,
        });
    }

    // Process events up to eventIndex (inclusive)
    for (let i = 0; i <= eventIndex && i < events.length; i++) {
        const event = events[i];

        switch (event.status) {
            case SimulationStatus.REQUEST_DONGLE: {
                const coder = coders.get(event.coder_id);
                const dongle = dongles.get(event.dongle_id);
                if (coder) {
                    coder.status = CoderStatus.WAITING;
                    coder.last_state_change_ts = event.ts;
                }
                if (dongle) {
                    dongle.queue = event.queue;
                    dongle.priorities = event.priorities;
                }
                break;
            }
            case SimulationStatus.TAKE_DONGLE: {
                const coder = coders.get(event.coder_id);
                const dongle = dongles.get(event.dongle_id);
                if (coder) {
                    coder.current_dongle_id = event.dongle_id;
                    coder.last_state_change_ts = event.ts;
                    if (!coder.current_dongle_ids.includes(event.dongle_id)) {
                        coder.current_dongle_ids.push(event.dongle_id);
                    }
                }
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
                    coder.status =
                        event.status === SimulationStatus.START_COMPILE
                            ? CoderStatus.COMPILING
                            : event.status === SimulationStatus.START_DEBUG
                              ? CoderStatus.DEBUGGING
                              : CoderStatus.REFACTORING;
                    coder.deadline = event.details.deadline;
                    coder.compiles_done = event.details.compiles_done;
                    coder.last_state_change_ts = event.ts;
                    if (event.status === SimulationStatus.START_COMPILE) {
                        coder.last_compile_ts = event.ts;
                    }
                }
                break;
            }
            case SimulationStatus.RELEASE_DONGLE: {
                const coder = coders.get(event.coder_id);
                const dongle = dongles.get(event.dongle_id);
                if (coder) {
                    coder.status = CoderStatus.IDLE;
                    coder.last_state_change_ts = event.ts;
                    coder.current_dongle_ids = coder.current_dongle_ids.filter(
                        (dongleId) => dongleId !== event.dongle_id,
                    );
                    coder.current_dongle_id =
                        coder.current_dongle_ids[
                            coder.current_dongle_ids.length - 1
                        ] ?? null;
                }
                if (dongle) {
                    dongle.current_owner_id = null;
                    dongle.last_release_ts = event.ts;
                    dongle.cooldown_until =
                        event.ts +
                        (metadata.dongle_cooldown ??
                            SIMULATION_DEFAULTS.MOCK_COOLDOWN_MS);
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
