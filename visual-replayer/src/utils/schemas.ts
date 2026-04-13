import { z } from 'zod';
import { SimulationStatus } from './types';

const BaseEventSchema = z.object({
    ts: z.number(),
    status: z.nativeEnum(SimulationStatus),
});

const InitializeEventSchema = z.object({
    status: z.literal(SimulationStatus.INITIALIZE),
    num_coders: z.number(),
    num_dongles: z.number(),
    time_to_burnout: z.number(),
    time_to_compile: z.number().optional(),
    time_to_debug: z.number().optional(),
    time_to_refactor: z.number().optional(),
    num_compiles_required: z.number().optional(),
    dongle_cooldown: z.number().optional(),
    scheduler: z.string().optional(),
});

const RequestDongleEventSchema = BaseEventSchema.extend({
    status: z.literal(SimulationStatus.REQUEST_DONGLE),
    coder_id: z.number(),
    dongle_id: z.number(),
    queue: z.array(z.number()),
    priorities: z.array(z.number()),
});

const TakeDongleEventSchema = BaseEventSchema.extend({
    status: z.literal(SimulationStatus.TAKE_DONGLE),
    coder_id: z.number(),
    dongle_id: z.number(),
    queue: z.array(z.number()),
    priorities: z.array(z.number()),
});

const StateTransitionEventSchema = BaseEventSchema.extend({
    status: z.union([
        z.literal(SimulationStatus.START_COMPILE),
        z.literal(SimulationStatus.START_DEBUG),
        z.literal(SimulationStatus.START_REFACTOR),
    ]),
    coder_id: z.number(),
    details: z.object({
        compiles_done: z.number(),
        deadline: z.number(),
    }),
});

const ReleaseDongleEventSchema = BaseEventSchema.extend({
    status: z.literal(SimulationStatus.RELEASE_DONGLE),
    coder_id: z.number(),
    dongle_id: z.number(),
});

const BurnoutEventSchema = BaseEventSchema.extend({
    status: z.literal(SimulationStatus.BURNOUT),
    coder_id: z.number(),
});

const SuccessEventSchema = BaseEventSchema.extend({
    status: z.literal(SimulationStatus.SUCCESS),
});

export const LogEventSchema = z.union([
    InitializeEventSchema,
    RequestDongleEventSchema,
    TakeDongleEventSchema,
    StateTransitionEventSchema,
    ReleaseDongleEventSchema,
    BurnoutEventSchema,
    SuccessEventSchema,
]);

export type ParsedLogEvent = z.infer<typeof LogEventSchema>;

export const SimulationConfigSchema = z.object({
    number_of_coders: z.number().min(1).max(20),
    number_of_dongles: z.number().min(1).max(10),
    time_to_burnout: z.number().min(100),
    time_to_compile: z.number().min(100),
    time_to_debug: z.number().min(100),
    time_to_refactor: z.number().min(100),
    number_of_compiles_required: z.number().min(1),
    dongle_cooldown: z.number().min(0),
    scheduler: z.enum(['fifo', 'edf']),
});
