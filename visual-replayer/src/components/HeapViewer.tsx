import { useMemo } from 'react';
import { useLogStore } from '../store/useLogStore';
import { generateSnapshot } from '../utils/snapshot';

export const HeapViewer: React.FC = () => {
  const { metadata, events, currentTime } = useLogStore();

  const snapshot = useMemo(() => {
    if (!metadata) return null;
    return generateSnapshot(metadata, events, currentTime);
  }, [metadata, events, currentTime]);

  if (!snapshot) return null;

  const dongles = Array.from(snapshot.dongles.values());

  return (
    <div className="side-panel-section">
      <h3>Dongle Queues (Min-Heap)</h3>
      <div className="heap-list">
        {dongles.map((dongle) => (
          <div key={dongle.id} className="heap-item">
            <div className="heap-item-header">
              <span className="dongle-id">Dongle {dongle.id}</span>
              <span className={`dongle-status ${dongle.current_owner_id !== null ? 'active' : ''}`}>
                {dongle.current_owner_id !== null ? `Owned by C${dongle.current_owner_id}` : 'Idle'}
              </span>
            </div>
            {dongle.queue.length > 0 ? (
              <div className="queue-viz">
                {dongle.queue.map((coderId, idx) => (
                  <div key={`${dongle.id}-${coderId}-${idx}`} className="queue-node">
                    <span className="coder-badge">C{coderId}</span>
                    <span className="priority-tag">P:{dongle.priorities[idx]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-queue">Queue Empty</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
