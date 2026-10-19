import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCallTimerResult {
  elapsedSec: number;
  formattedDuration: string;
  resetTimer: () => void;
}

export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Dedicated drift-free timer for active AI calls.
 * Starts when call is connected, freezes elapsed duration when call ends, and resets on demand.
 */
export function useCallTimer(isCallConnected: boolean): UseCallTimerResult {
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = null;
    setElapsedSec(0);
  }, [clearTimer]);

  useEffect(() => {
    if (isCallConnected) {
      clearTimer();
      const now = Date.now();
      startTimeRef.current = now;
      setElapsedSec(0);

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSec(elapsed);
        }
      }, 1000);
    } else {
      // Freeze elapsed duration when disconnected so summary can inspect final duration
      clearTimer();
      startTimeRef.current = null;
    }

    return () => {
      clearTimer();
    };
  }, [clearTimer, isCallConnected]);

  return {
    elapsedSec,
    formattedDuration: formatCallDuration(elapsedSec),
    resetTimer,
  };
}
