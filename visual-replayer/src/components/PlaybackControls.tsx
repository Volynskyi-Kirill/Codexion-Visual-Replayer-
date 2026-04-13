import { Play, Pause, RotateCcw } from 'lucide-react';
import { useLogStore } from '../store/useLogStore';
import { usePlayback } from '../hooks/usePlayback';

export const PlaybackControls: React.FC = () => {
  const { 
    currentTime, 
    setCurrentTime, 
    maxTime, 
    isPlaying, 
    setIsPlaying, 
    speed, 
    setSpeed,
  } = useLogStore();

  usePlayback();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(3) + 's';
  };

  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="controls">
      <div className="slider-container">
        <input
          type="range"
          min={0}
          max={maxTime}
          step={1}
          value={currentTime}
          onChange={handleSliderChange}
          className="timeline-slider"
        />
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(maxTime)}</span>
        </div>
      </div>

      <div className="button-group">
        <button onClick={() => setCurrentTime(0)} title="Restart">
          <RotateCcw size={20} />
        </button>
        <button onClick={togglePlay} className="play-pause-btn" title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="speed-selector">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={speed === s ? 'active' : ''}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
