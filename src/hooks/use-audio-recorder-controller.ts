import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

export interface UseAudioRecorderControllerResult {
  hasPermission: boolean | null;
  isRecording: boolean;
  recordingDurationSec: number;
  recordedUri: string | null;
  recordingError: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  resetRecording: () => void;
}

export function useAudioRecorderController(): UseAudioRecorderControllerResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationSec, setRecordingDurationSec] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Synchronous ref to prevent stale closure race conditions
  const isRecordingRef = useRef(false);
  const recordingStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Expo-audio recorder initialized with high quality preset
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Check initial permissions on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const status = await getRecordingPermissionsAsync();
        if (isMounted) {
          setHasPermission(status.granted);
        }
      } catch {
        if (isMounted) {
          setHasPermission(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recordingStartTimeRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;
    setRecordingError(null);

    try {
      // 1. Ensure permission is granted
      const perm = await getRecordingPermissionsAsync();
      let granted = perm.granted;
      if (!granted) {
        const req = await requestRecordingPermissionsAsync();
        granted = req.granted;
      }

      setHasPermission(granted);

      if (!granted) {
        setRecordingError('Microphone permission is required to record audio.');
        return;
      }

      // 2. Set audio session for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // 3. Prepare & start recording
      await recorder.prepareToRecordAsync();
      recorder.record();

      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingDurationSec(0);
      setRecordedUri(null);

      // 4. Drift-free timer using Date.now()
      clearTimer();
      const startTime = Date.now();
      recordingStartTimeRef.current = startTime;
      timerRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          setRecordingDurationSec(elapsed);
        }
      }, 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRecordingError(`Could not start recording: ${msg}`);
      isRecordingRef.current = false;
      setIsRecording(false);
      clearTimer();
    }
  }, [clearTimer, recorder]);

  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return;
    clearTimer();
    isRecordingRef.current = false;

    try {
      await recorder.stop();

      // Reset audio session mode for speaker playback
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      setIsRecording(false);

      const uri = recorder.uri;
      if (uri) {
        setRecordedUri(uri);
      } else {
        setRecordingError('Recording completed but no audio file was generated.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRecordingError(`Failed to stop recording: ${msg}`);
      setIsRecording(false);
    }
  }, [clearTimer, recorder]);

  const cancelRecording = useCallback(async () => {
    clearTimer();
    const wasRecording = isRecordingRef.current;
    isRecordingRef.current = false;
    setIsRecording(false);

    try {
      if (wasRecording) {
        await recorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      }
    } catch {
      // Ignore cancellation error
    } finally {
      setRecordingDurationSec(0);
      setRecordedUri(null);
      setRecordingError(null);
    }
  }, [clearTimer, recorder]);

  const resetRecording = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  return {
    hasPermission,
    isRecording,
    recordingDurationSec,
    recordedUri,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  };
}
