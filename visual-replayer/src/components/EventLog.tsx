import { useMemo } from 'react';
import { useLogStore } from '../store/useLogStore';
import { COLORS } from '../utils/constants';

export const EventLog: React.FC = () => {
  const { events, currentTime } = useLogStore();

  const filteredEvents = useMemo(() => {
    // Show last 50 events up to currentTime
    return events
      .filter(e => e.ts <= currentTime)
      .slice(-50)
      .reverse();
  }, [events, currentTime]);

  return (
    <div className="side-panel-section log-section">
      <h3>Simulation Events</h3>
      <div className="event-list">
        {filteredEvents.map((event, idx) => (
          <div key={`${event.ts}-${idx}`} className="event-item">
            <span className="event-ts">[{event.ts}ms]</span>
            <span className="event-status" style={{ color: getStatusColor(event.status) }}>
              {event.status}
            </span>
            <span className="event-details">
              {'coder_id' in event && ` C${event.coder_id}`}
              {'dongle_id' in event && ` D${event.dongle_id}`}
            </span>
          </div>
        ))}
        {filteredEvents.length === 0 && <div className="empty-log">Waiting for events...</div>}
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  if (status.startsWith('START_')) return COLORS.COMPILING;
  if (status === 'RELEASE_DONGLE') return COLORS.IDLE;
  if (status === 'TAKE_DONGLE') return COLORS.DONGLE_ACTIVE;
  if (status === 'REQUEST_DONGLE') return COLORS.WAITING;
  if (status === 'BURNOUT') return COLORS.BURNOUT;
  if (status === 'SUCCESS') return COLORS.COMPILING;
  return '#94a3b8';
};
