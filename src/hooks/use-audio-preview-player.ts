import { useCallback, useEffect, useRef, useState } from 'react';

import { type AudioPlayer, type AudioStatus, createAudioPlayer } from 'expo-audio';

export interface UseAudioPreviewPlayerResult {
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
}

export function useAudioPreviewPlayer(audioUri: string | null): UseAudioPreviewPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);

  const clearSubscription = useCallback(() => {
    if (statusSubscriptionRef.current) {
      statusSubscriptionRef.current.remove();
      statusSubscriptionRef.current = null;
    }
  }, []);

  const disposePlayer = useCallback(() => {
    clearSubscription();
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.pause === 'function') {
          playerRef.current.pause();
        }
        if (typeof playerRef.current.remove === 'function') {
          playerRef.current.remove();
        }
      } catch {
        // Ignore disposal error
      }
      playerRef.current = null;
    }
    setIsPlaying(false);
    setPositionSec(0);
  }, [clearSubscription]);

  // Reset player whenever audioUri changes
  useEffect(() => {
    disposePlayer();
    setDurationSec(0);
    setError(null);
  }, [audioUri, disposePlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposePlayer();
    };
  }, [disposePlayer]);

  const play = useCallback(async () => {
    if (!audioUri) return;
    setError(null);

    try {
      if (!playerRef.current) {
        const player = createAudioPlayer(audioUri);
        playerRef.current = player;

        // Subscribe to native playbackStatusUpdate event instead of polling
        clearSubscription();
        statusSubscriptionRef.current = player.addListener(
          'playbackStatusUpdate',
          (status: AudioStatus) => {
            setPositionSec(status.currentTime || 0);
            if (status.duration) {
              setDurationSec(status.duration);
            }
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPositionSec(0);
            }
          }
        );
      }

      const player = playerRef.current;
      if (player) {
        // Rewind if playback previously finished
        if (typeof player.seekTo === 'function') {
          const current = player.currentTime || 0;
          const dur = player.duration || 0;
          if (dur > 0 && current >= dur - 0.1) {
            try {
              await player.seekTo(0);
            } catch {
              // Ignore seek error
            }
          }
        }

        player.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Audio preview error: ${msg}`);
      setIsPlaying(false);
    }
  }, [audioUri, clearSubscription]);

  const pause = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch {
        // Ignore pause error
      }
    }
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    disposePlayer();
  }, [disposePlayer]);

  return {
    isPlaying,
    positionSec,
    durationSec,
    error,
    play,
    pause,
    stop,
  };
}
