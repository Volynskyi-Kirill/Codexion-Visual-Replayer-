import { useEffect, useRef } from 'react';
import { useLogStore } from '../store/useLogStore';

export function usePlayback() {
  const { isPlaying, speed, currentTime, setCurrentTime, maxTime, isStreaming, streamingStartTime } = useLogStore();
  const requestRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== undefined && isPlaying) {
        const deltaTime = time - lastTimeRef.current;
        const nextTime = currentTime + deltaTime * speed;
        
        let dynamicMax = maxTime;
        if (isStreaming && streamingStartTime) {
          const liveElapsed = Date.now() - streamingStartTime;
          dynamicMax = Math.max(maxTime, liveElapsed);
        }

        if (nextTime >= dynamicMax) {
          setCurrentTime(dynamicMax, dynamicMax);
        } else {
          setCurrentTime(nextTime, dynamicMax);
        }
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
      lastTimeRef.current = undefined;
    }

    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed, currentTime, maxTime, setCurrentTime]);
}
