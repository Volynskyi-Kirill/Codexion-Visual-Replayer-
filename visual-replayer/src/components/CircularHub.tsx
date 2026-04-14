import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogStore } from '../store/useLogStore';
import { generateSnapshot } from '../utils/snapshot';
import { CoderNode } from './CoderNode';
import { DongleNode } from './DongleNode';
import {
    HUB_SIZE,
    CENTER,
    COLORS,
    CODER_RADIUS,
    DONGLE_RADIUS,
} from '../utils/constants';
import {
    polarToCartesian,
    getCoderAngle,
    getDongleAngle,
} from '../utils/geometry';
import { getCenterHubLabel, getCenterHubStrokeColor } from '../utils/snapshot';

export const CircularHub: React.FC = () => {
    const { metadata, events, currentTime, currentEventIndex } = useLogStore();

    const snapshot = useMemo(() => {
        if (!metadata) return null;
        return generateSnapshot(
            metadata,
            events,
            currentEventIndex,
            currentTime,
        );
    }, [metadata, events, currentEventIndex, currentTime]);

    if (!metadata || !snapshot) {
        return null;
    }

    const codersArray = Array.from(snapshot.coders.values());
    const donglesArray = Array.from(snapshot.dongles.values());
    const lineTransition = { duration: 0.3, ease: 'easeOut' as const };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                overflow: 'visible',
            }}
        >
            <svg
                width={HUB_SIZE}
                height={HUB_SIZE}
                viewBox={`0 0 ${HUB_SIZE} ${HUB_SIZE}`}
                style={{ overflow: 'visible' }}
            >
                {/* Background Gradients/Effects could go here */}

                {/* Center: Quantum Compiler Visual */}
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={50}
                    fill='url(#centerGradient)'
                    stroke={getCenterHubStrokeColor(snapshot)}
                    strokeWidth='4'
                />
                <defs>
                    <radialGradient id='centerGradient'>
                        <stop offset='0%' stopColor='#1e293b' />
                        <stop offset='100%' stopColor='#0f172a' />
                    </radialGradient>
                </defs>
                <text
                    x={CENTER}
                    y={CENTER + 5}
                    textAnchor='middle'
                    fill='white'
                    fontSize='10'
                    fontWeight='bold'
                >
                    {getCenterHubLabel(snapshot)}
                </text>

                {/* Ownership Lines */}
                <AnimatePresence>
                    {codersArray.map((coder) => {
                        const coderAngle = getCoderAngle(
                            coder.id,
                            metadata.num_coders,
                        );

                        const coderPos = polarToCartesian(
                            coderAngle,
                            CODER_RADIUS,
                        );
                        return coder.current_dongle_ids.map((dongleId) => {
                            const dongleAngle = getDongleAngle(
                                dongleId,
                                metadata.num_dongles,
                            );
                            const donglePos = polarToCartesian(
                                dongleAngle,
                                DONGLE_RADIUS,
                            );

                            return (
                                <motion.line
                                    key={`line-${coder.id}-${dongleId}`}
                                    x1={coderPos.x}
                                    y1={coderPos.y}
                                    x2={donglePos.x}
                                    y2={donglePos.y}
                                    stroke={COLORS.LINE_ACTIVE}
                                    strokeWidth='2'
                                    strokeDasharray='5,5'
                                    initial={{
                                        opacity: 0,
                                        strokeDashoffset: -100,
                                    }}
                                    animate={{
                                        opacity: 0.6,
                                        strokeDashoffset: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        strokeDashoffset: -100,
                                    }}
                                    transition={lineTransition}
                                />
                            );
                        });
                    })}
                </AnimatePresence>

                {/* Waiting Lines */}
                <AnimatePresence>
                    {donglesArray.map((dongle) => {
                        if (dongle.queue.length === 0) return null;

                        const dongleAngle = getDongleAngle(
                            dongle.id,
                            metadata.num_dongles,
                        );
                        const donglePos = polarToCartesian(
                            dongleAngle,
                            DONGLE_RADIUS,
                        );

                        return dongle.queue.map((coderId) => {
                            if (dongle.current_owner_id === coderId) {
                                return null;
                            }

                            const coderAngle = getCoderAngle(
                                coderId,
                                metadata.num_coders,
                            );
                            const coderPos = polarToCartesian(
                                coderAngle,
                                CODER_RADIUS,
                            );

                            return (
                                <motion.line
                                    key={`waiting-line-${coderId}-${dongle.id}`}
                                    x1={coderPos.x}
                                    y1={coderPos.y}
                                    x2={donglePos.x}
                                    y2={donglePos.y}
                                    stroke={COLORS.LINE_WAITING}
                                    strokeWidth='2'
                                    strokeDasharray='3,6'
                                    initial={{
                                        opacity: 0,
                                        strokeDashoffset: -100,
                                    }}
                                    animate={{
                                        opacity: 0.55,
                                        strokeDashoffset: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        strokeDashoffset: -100,
                                    }}
                                    transition={lineTransition}
                                />
                            );
                        });
                    })}
                </AnimatePresence>

                {/* Dongles */}
                {donglesArray.map((dongle) => (
                    <DongleNode
                        key={`dongle-${dongle.id}`}
                        dongle={dongle}
                        totalDongles={metadata.num_dongles}
                    />
                ))}

                {/* Coders */}
                {codersArray.map((coder) => (
                    <CoderNode
                        key={`coder-${coder.id}`}
                        coder={coder}
                        totalCoders={metadata.num_coders}
                        currentTime={currentTime}
                        timeToBurnout={metadata.time_to_burnout}
                    />
                ))}
            </svg>
        </div>
    );
};
