export const SimulationStatus = {
    INITIALIZE: 'INITIALIZE',
    REQUEST_DONGLE: 'REQUEST_DONGLE',
    TAKE_DONGLE: 'TAKE_DONGLE',
    START_COMPILE: 'START_COMPILE',
    START_DEBUG: 'START_DEBUG',
    START_REFACTOR: 'START_REFACTOR',
    RELEASE_DONGLE: 'RELEASE_DONGLE',
    BURNOUT: 'BURNOUT',
    SUCCESS: 'SUCCESS',
} as const;

export type SimulationStatus =
    (typeof SimulationStatus)[keyof typeof SimulationStatus];

export const CoderStatus = {
    IDLE: 'IDLE',
    WAITING: 'WAITING',
    COMPILING: 'COMPILING',
    DEBUGGING: 'DEBUGGING',
    REFACTORING: 'REFACTORING',
    BURNOUT: 'BURNOUT',
} as const;

export type CoderStatus = (typeof CoderStatus)[keyof typeof CoderStatus];

export interface BaseEvent {
    ts: number;
    status: SimulationStatus;
}

export interface InitializeEvent {
    ts?: number;
    status: typeof SimulationStatus.INITIALIZE;
    num_coders: number;
    num_dongles: number;
    time_to_burnout: number;
}

export interface RequestDongleEvent extends BaseEvent {
    status: typeof SimulationStatus.REQUEST_DONGLE;
    coder_id: number;
    dongle_id: number;
    queue: number[];
    priorities: number[];
}

export interface TakeDongleEvent extends BaseEvent {
    status: typeof SimulationStatus.TAKE_DONGLE;
    coder_id: number;
    dongle_id: number;
    queue: number[];
    priorities: number[];
}

export interface StateTransitionEvent extends BaseEvent {
    status:
        | typeof SimulationStatus.START_COMPILE
        | typeof SimulationStatus.START_DEBUG
        | typeof SimulationStatus.START_REFACTOR;
    coder_id: number;
    details: {
        compiles_done: number;
        deadline: number;
    };
}

export interface ReleaseDongleEvent extends BaseEvent {
    status: typeof SimulationStatus.RELEASE_DONGLE;
    coder_id: number;
    dongle_id: number;
}

export interface BurnoutEvent extends BaseEvent {
    status: typeof SimulationStatus.BURNOUT;
    coder_id: number;
}

export interface SuccessEvent extends BaseEvent {
    status: typeof SimulationStatus.SUCCESS;
}

export type TimedEvent =
    | RequestDongleEvent
    | TakeDongleEvent
    | StateTransitionEvent
    | ReleaseDongleEvent
    | BurnoutEvent
    | SuccessEvent;

export type LogEvent = InitializeEvent | TimedEvent;

export interface CoderState {
    id: number;
    status: CoderStatus;
    deadline: number;
    current_dongle_id: number | null;
    current_dongle_ids: number[];
    compiles_done: number;
    last_state_change_ts: number;
}

export interface DongleState {
    id: number;
    current_owner_id: number | null;
    queue: number[];
    priorities: number[];
    cooldown_until: number;
}

export interface SimulationSnapshot {
    ts: number;
    coders: Map<number, CoderState>;
    dongles: Map<number, DongleState>;
    isBurnedOut: boolean;
    isSuccess: boolean;
}
