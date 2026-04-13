import { motion } from 'framer-motion';
import { Usb } from 'lucide-react';
import type { DongleState } from '../utils/types';
import { polarToCartesian, getDongleAngle } from '../utils/geometry';
import { DONGLE_RADIUS, DONGLE_SIZE, COLORS } from '../utils/constants';

interface DongleNodeProps {
    dongle: DongleState;
    totalDongles: number;
}

export const DongleNode: React.FC<DongleNodeProps> = ({
    dongle,
    totalDongles,
}) => {
    const angle = getDongleAngle(dongle.id, totalDongles);
    const { x, y } = polarToCartesian(angle, DONGLE_RADIUS);
    const isActive = dongle.current_owner_id !== null;
    const stateTransition = { duration: 0.25, ease: 'easeOut' as const };

    return (
        <motion.g
            initial={false}
            animate={{ x, y }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Background circle */}
            <motion.circle
                r={DONGLE_SIZE / 2}
                fill='#1e293b'
                stroke={isActive ? COLORS.DONGLE_ACTIVE : COLORS.DONGLE_IDLE}
                strokeWidth='2'
                animate={{
                    stroke: isActive
                        ? COLORS.DONGLE_ACTIVE
                        : COLORS.DONGLE_IDLE,
                }}
                transition={stateTransition}
            />

            {/* USB Icon */}
            <foreignObject
                x={-DONGLE_SIZE / 2}
                y={-DONGLE_SIZE / 2}
                width={DONGLE_SIZE}
                height={DONGLE_SIZE}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: isActive
                            ? COLORS.DONGLE_ACTIVE
                            : COLORS.DONGLE_IDLE,
                    }}
                >
                    <Usb size={24} />
                </div>
            </foreignObject>

            {/* Queue size indicator */}
            {dongle.queue.length > 0 && (
                <motion.g
                    transform={`translate(${DONGLE_SIZE / 2}, -${DONGLE_SIZE / 2})`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={stateTransition}
                >
                    <circle r='10' fill={COLORS.WAITING} />
                    <text
                        y='4'
                        textAnchor='middle'
                        fill='#1e293b'
                        fontSize='10'
                        fontWeight='bold'
                    >
                        {dongle.queue.length}
                    </text>
                </motion.g>
            )}

            {/* ID Label */}
            <text
                y={DONGLE_SIZE / 2 + 15}
                textAnchor='middle'
                fill='white'
                fontSize='10'
                opacity='0.6'
            >
                D{dongle.id}
            </text>
        </motion.g>
    );
};
