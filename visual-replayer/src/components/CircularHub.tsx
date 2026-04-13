import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogStore } from '../store/useLogStore';
import { generateSnapshot } from '../utils/snapshot';
import { CoderNode } from './CoderNode';
import { DongleNode } from './DongleNode';
import { HUB_SIZE, CENTER, COLORS, CODER_RADIUS, DONGLE_RADIUS } from '../utils/constants';
import { polarToCartesian, getCoderAngle, getDongleAngle } from '../utils/geometry';

export const CircularHub: React.FC = () => {
  const { metadata, events, currentTime, currentEventIndex } = useLogStore();

  const snapshot = useMemo(() => {
    if (!metadata) return null;
    return generateSnapshot(metadata, events, currentEventIndex, currentTime);
  }, [metadata, events, currentEventIndex, currentTime]);

  if (!metadata || !snapshot) {
    return null;
  }

  const codersArray = Array.from(snapshot.coders.values());
  const donglesArray = Array.from(snapshot.dongles.values());

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'visible' }}>
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
          fill="url(#centerGradient)"
          stroke={snapshot.isBurnedOut ? COLORS.BURNOUT : COLORS.DEBUGGING}
          strokeWidth="4"
        />
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <text
          x={CENTER}
          y={CENTER + 5}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {snapshot.isBurnedOut ? 'BURNED OUT' : 'COMPILER'}
        </text>

        {/* Ownership Lines */}
        <AnimatePresence>
          {codersArray.map((coder) => {
            if (coder.current_dongle_id === null) return null;
            
            const coderAngle = getCoderAngle(coder.id, metadata.num_coders);
            const dongleAngle = getDongleAngle(coder.current_dongle_id, metadata.num_dongles);
            
            const coderPos = polarToCartesian(coderAngle, CODER_RADIUS);
            const donglePos = polarToCartesian(dongleAngle, DONGLE_RADIUS);

            return (
              <motion.line
                key={`line-${coder.id}-${coder.current_dongle_id}`}
                x1={coderPos.x}
                y1={coderPos.y}
                x2={donglePos.x}
                y2={donglePos.y}
                stroke={COLORS.LINE_ACTIVE}
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
              />
            );
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
