import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogStore } from '../store/useLogStore';
import { SIMULATION_FORM_DEFAULTS } from '../constants';
import { SimulationConfigSchema } from '../utils/schemas';
import type { SimulationConfig } from '../utils/types';

type FormData = Omit<SimulationConfig, 'number_of_dongles'>;

export const SimulationForm: React.FC = () => {
    const { fetchLogs, isLoading, error } = useLogStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(SimulationConfigSchema.omit({ number_of_dongles: true })),
        defaultValues: SIMULATION_FORM_DEFAULTS,
    });

    const onSubmit = async (data: FormData) => {
        const fullConfig: SimulationConfig = {
            ...data,
            number_of_dongles: data.number_of_coders,
        };
        await fetchLogs(fullConfig);
    };

    return (
        <form className='simulation-form' onSubmit={handleSubmit(onSubmit)}>
            <div className='form-grid'>
                <div className='form-group'>
                    <label>Number of Coders</label>
                    <input
                        type='number'
                        {...register('number_of_coders', { valueAsNumber: true })}
                        className={errors.number_of_coders ? 'input-error' : ''}
                    />
                    {errors.number_of_coders && (
                        <span className='field-error'>{errors.number_of_coders.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Time to Burnout (ms)</label>
                    <input
                        type='number'
                        {...register('time_to_burnout', { valueAsNumber: true })}
                        className={errors.time_to_burnout ? 'input-error' : ''}
                    />
                    {errors.time_to_burnout && (
                        <span className='field-error'>{errors.time_to_burnout.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Time to Compile (ms)</label>
                    <input
                        type='number'
                        {...register('time_to_compile', { valueAsNumber: true })}
                        className={errors.time_to_compile ? 'input-error' : ''}
                    />
                    {errors.time_to_compile && (
                        <span className='field-error'>{errors.time_to_compile.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Time to Debug (ms)</label>
                    <input
                        type='number'
                        {...register('time_to_debug', { valueAsNumber: true })}
                        className={errors.time_to_debug ? 'input-error' : ''}
                    />
                    {errors.time_to_debug && (
                        <span className='field-error'>{errors.time_to_debug.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Time to Refactor (ms)</label>
                    <input
                        type='number'
                        {...register('time_to_refactor', { valueAsNumber: true })}
                        className={errors.time_to_refactor ? 'input-error' : ''}
                    />
                    {errors.time_to_refactor && (
                        <span className='field-error'>{errors.time_to_refactor.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Compiles Required</label>
                    <input
                        type='number'
                        {...register('number_of_compiles_required', { valueAsNumber: true })}
                        className={errors.number_of_compiles_required ? 'input-error' : ''}
                    />
                    {errors.number_of_compiles_required && (
                        <span className='field-error'>
                            {errors.number_of_compiles_required.message}
                        </span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Dongle Cooldown (ms)</label>
                    <input
                        type='number'
                        {...register('dongle_cooldown', { valueAsNumber: true })}
                        className={errors.dongle_cooldown ? 'input-error' : ''}
                    />
                    {errors.dongle_cooldown && (
                        <span className='field-error'>{errors.dongle_cooldown.message}</span>
                    )}
                </div>

                <div className='form-group'>
                    <label>Scheduler</label>
                    <select
                        {...register('scheduler')}
                        className={errors.scheduler ? 'input-error' : ''}
                    >
                        <option value='fifo'>FIFO (First-In-First-Out)</option>
                        <option value='edf'>EDF (Earliest Deadline First)</option>
                    </select>
                    {errors.scheduler && (
                        <span className='field-error'>{errors.scheduler.message}</span>
                    )}
                </div>
            </div>

            {error && <p className='error-message'>{error}</p>}

            <button type='submit' className='submit-btn' disabled={isLoading}>
                {isLoading ? 'Running Simulation...' : 'Start Simulation'}
            </button>
        </form>
    );
};
