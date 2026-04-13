import { motion } from 'framer-motion';
import { User, Settings, Bug, Wrench, AlertTriangle } from 'lucide-react';
import type { CoderState } from '../utils/types';
import { polarToCartesian, getCoderAngle } from '../utils/geometry';
import { CODER_RADIUS, NODE_SIZE, COLORS } from '../utils/constants';

interface CoderNodeProps {
    coder: CoderState;
    totalCoders: number;
    currentTime: number;
    timeToBurnout: number;
}

const getStatusColor = (status: CoderState['status']) => {
    switch (status) {
        case 'IDLE':
            return COLORS.IDLE;
        case 'WAITING':
            return COLORS.WAITING;
        case 'COMPILING':
            return COLORS.COMPILING;
        case 'DEBUGGING':
            return COLORS.DEBUGGING;
        case 'REFACTORING':
            return COLORS.REFACTORING;
        case 'BURNOUT':
            return COLORS.BURNOUT;
        default:
            return COLORS.IDLE;
    }
};

const StatusIcon = ({
    status,
    size,
}: {
    status: CoderState['status'];
    size: number;
}) => {
    switch (status) {
        case 'COMPILING':
            return <Settings size={size} />;
        case 'DEBUGGING':
            return <Bug size={size} />;
        case 'REFACTORING':
            return <Wrench size={size} />;
        case 'BURNOUT':
            return <AlertTriangle size={size} />;
        case 'WAITING':
            return <User size={size} opacity={0.5} />;
        default:
            return <User size={size} />;
    }
};

export const CoderNode: React.FC<CoderNodeProps> = ({
    coder,
    totalCoders,
    currentTime,
    timeToBurnout,
}) => {
    const angle = getCoderAngle(coder.id, totalCoders);
    const { x, y } = polarToCartesian(angle, CODER_RADIUS);

    const timeLeft = Math.max(
        0,
        timeToBurnout - (currentTime - coder.last_state_change_ts),
    );
    const progress = timeLeft / timeToBurnout;
    const strokeDasharray = 2 * Math.PI * (NODE_SIZE / 2 + 5);
    const strokeDashoffset = strokeDasharray * (1 - progress);
    const stateTransition = { duration: 0.25, ease: 'easeOut' as const };

    return (
        <motion.g
            initial={false}
            animate={{ x, y }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Burnout Radial Bar */}
            <motion.circle
                r={NODE_SIZE / 2 + 5}
                fill='none'
                stroke={COLORS.LINE}
                strokeWidth='4'
                transition={stateTransition}
            />
            <motion.circle
                r={NODE_SIZE / 2 + 5}
                fill='none'
                stroke={
                    coder.status === 'BURNOUT'
                        ? COLORS.BURNOUT
                        : COLORS.COMPILING
                }
                strokeWidth='4'
                strokeDasharray={strokeDasharray}
                animate={{ strokeDashoffset }}
                style={{ rotate: -90, transformOrigin: 'center' }}
                transition={stateTransition}
            />

            {/* Coder Background */}
            <motion.circle
                r={NODE_SIZE / 2}
                fill='#1e293b'
                stroke={getStatusColor(coder.status)}
                strokeWidth='3'
                animate={{ stroke: getStatusColor(coder.status) }}
                transition={stateTransition}
            />

            {/* Icon */}
            <foreignObject
                x={-NODE_SIZE / 2}
                y={-NODE_SIZE / 2}
                width={NODE_SIZE}
                height={NODE_SIZE}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: getStatusColor(coder.status),
                    }}
                >
                    <StatusIcon status={coder.status} size={32} />
                </div>
            </foreignObject>

            {/* Burnout Timer */}
            <motion.text
                y={-NODE_SIZE / 2 - 15}
                textAnchor='middle'
                fill={
                    coder.last_state_change_ts > 0
                        ? COLORS.BURNOUT
                        : COLORS.WAITING
                }
                fontSize='11'
                fontWeight='bold'
                animate={{
                    fill:
                        coder.last_state_change_ts > 0
                            ? COLORS.BURNOUT
                            : COLORS.WAITING,
                }}
                transition={stateTransition}
            >
                {Math.ceil(timeLeft / 1000)}s
            </motion.text>

            {/* ID Label */}
            <text
                y={NODE_SIZE / 2 + 35}
                textAnchor='middle'
                fill='white'
                fontSize='12'
                fontWeight='bold'
            >
                Coder {coder.id}
            </text>
        </motion.g>
    );
};
