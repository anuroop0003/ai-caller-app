import { useCallback, useEffect, useRef, useState } from 'react';

import type { AudioPlayer } from 'expo-audio';
import { requireOptionalNativeModule } from 'expo-modules-core';

import type { AudioTestSample } from '@/constants/audioTestSamples';

export interface UseSampleAudioPlayerResult {
  currentSample: AudioTestSample | null;
  selectSample: (sample: AudioTestSample) => void;
  isPlaying: boolean;
  isPlaybackSupported: boolean;
  currentTimeSec: number;
  durationSec: number;
  play: (targetSample?: AudioTestSample) => Promise<void>;
  pause: () => void;
  stop: () => void;
  error: string | null;
}

export function useSampleAudioPlayer(
  initialSample: AudioTestSample | null = null
): UseSampleAudioPlayerResult {
  const [currentSample, setCurrentSample] = useState<AudioTestSample | null>(initialSample);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Synchronous refs to prevent stale state issues in fast async toggles
  const currentSampleRef = useRef<AudioTestSample | null>(initialSample);
  const activeSampleIdRef = useRef<string | null>(null);

  // Check if native ExpoAudio module is linked in the compiled APK
  const isPlaybackSupported = Boolean(requireOptionalNativeModule('ExpoAudio'));

  const playerRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup active player
  const disposePlayer = useCallback(() => {
    clearTimer();
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.pause === 'function') {
          playerRef.current.pause();
        }
        if (typeof playerRef.current.remove === 'function') {
          playerRef.current.remove();
        } else if (typeof playerRef.current.release === 'function') {
          playerRef.current.release();
        }
      } catch {
        // Ignore native release errors
      }
      playerRef.current = null;
    }
    activeSampleIdRef.current = null;
    setIsPlaying(false);
    setCurrentTimeSec(0);
    setDurationSec(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      disposePlayer();
    };
  }, [disposePlayer]);

  const selectSample = useCallback(
    (sample: AudioTestSample) => {
      disposePlayer();
      currentSampleRef.current = sample;
      setCurrentSample(sample);
      setError(null);
    },
    [disposePlayer]
  );

  const play = useCallback(
    async (targetSample?: AudioTestSample) => {
      const sample = targetSample ?? currentSampleRef.current ?? currentSample;
      if (!sample) return;

      currentSampleRef.current = sample;
      setCurrentSample(sample);
      setError(null);

      // Guard: Check optional native module first before requiring expo-audio to prevent fatal Hermes RedBox
      const hasNativeAudio = Boolean(requireOptionalNativeModule('ExpoAudio'));
      if (!hasNativeAudio) {
        setError(
          'Audio speaker playback requires rebuilding the native APK (`npx expo run:android`) to link the newly installed audio module. On-device transcription benchmarking is ready and works right away!'
        );
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ExpoAudio = require('expo-audio');

        if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') {
          setError('Audio playback module unavailable in current runtime.');
          return;
        }

        // If sample changed or player doesn't exist, dispose old player and create new one
        if (!playerRef.current || activeSampleIdRef.current !== sample.id) {
          disposePlayer();
          playerRef.current = ExpoAudio.createAudioPlayer(sample.asset);
          activeSampleIdRef.current = sample.id;
        }

        const player = playerRef.current;
        if (!player) return;

        // If playback previously reached the end, reset to beginning
        if (typeof player.seekTo === 'function') {
          const currentTime = player.currentTime || 0;
          const duration = player.duration || 0;
          if (duration > 0 && currentTime >= duration - 0.1) {
            try {
              await player.seekTo(0);
            } catch {
              // Ignore seek error
            }
          }
        }

        player.play();
        setIsPlaying(true);

        clearTimer();
        timerRef.current = setInterval(() => {
          try {
            if (player) {
              const time = player.currentTime || 0;
              const dur = player.duration || 0;
              setCurrentTimeSec(time);
              setDurationSec(dur);

              if (player.playing === false && time > 0 && time >= dur - 0.1) {
                setIsPlaying(false);
                clearTimer();
              }
            }
          } catch {
            // Timer polling error
          }
        }, 150);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(
          msg.includes('ExpoAudio')
            ? 'Playback module not yet linked in APK. Run `npx expo run:android` to listen to audio.'
            : msg
        );
      }
    },
    [clearTimer, currentSample, disposePlayer]
  );

  const pause = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch {
        // Ignore
      }
    }
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const stop = useCallback(() => {
    disposePlayer();
  }, [disposePlayer]);

  return {
    currentSample,
    selectSample,
    isPlaying,
    isPlaybackSupported,
    currentTimeSec,
    durationSec,
    play,
    pause,
    stop,
    error,
  };
}
