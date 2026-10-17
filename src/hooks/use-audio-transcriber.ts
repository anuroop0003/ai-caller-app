import { useCallback } from 'react';

import { requireOptionalNativeModule } from 'expo-modules-core';

import { SpeechRecognitionService } from '@/services/speech';
import type { SttTranscriptionResult } from '@/types/speech';

import { useAudioPreviewPlayer } from './use-audio-preview-player';
import { useAudioRecorderController } from './use-audio-recorder-controller';
import { useSpeechTranscriber } from './use-speech-transcriber';

export interface UseAudioTranscriberResult {
  // Permission & Engine availability
  isEngineSupported: boolean;
  hasPermission: boolean | null;

  // Recording state
  isRecording: boolean;
  recordingDurationSec: number;
  recordedUri: string | null;
  recordingError: string | null;

  // Playback preview state
  isPlayingPreview: boolean;
  playbackPositionSec: number;
  playbackDurationSec: number;

  // Transcription state
  isTranscribing: boolean;
  transcription: SttTranscriptionResult | null;
  transcriptionLatencyMs: number | null;
  transcriptionError: string | null;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  transcribeAudio: () => Promise<void>;
  playPreview: () => Promise<void>;
  pausePreview: () => void;
  clearTranscription: () => void;
  resetAll: () => Promise<void>;
}

export function useAudioTranscriber(): UseAudioTranscriberResult {
  const isEngineSupported =
    Boolean(requireOptionalNativeModule('ExpoAudio')) &&
    SpeechRecognitionService.checkNativeSupport();

  // 1. Dedicated audio recording controller sub-hook
  const {
    hasPermission,
    isRecording,
    recordingDurationSec,
    recordedUri,
    recordingError,
    startRecording: startRecordingCore,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorderController();

  // 2. Dedicated audio playback preview sub-hook
  const {
    isPlaying: isPlayingPreview,
    positionSec: playbackPositionSec,
    durationSec: playbackDurationSec,
    play: playPreview,
    pause: pausePreview,
    stop: stopPreview,
  } = useAudioPreviewPlayer(recordedUri);

  // 3. Dedicated speech transcriber sub-hook
  const {
    isTranscribing,
    transcription,
    transcriptionLatencyMs,
    transcriptionError,
    transcribeAudio: transcribeAudioCore,
    clearTranscription,
  } = useSpeechTranscriber(recordedUri);

  // When starting recording, stop any active preview playback
  const startRecording = useCallback(async () => {
    stopPreview();
    await startRecordingCore();
  }, [startRecordingCore, stopPreview]);

  // Transcribe the current recorded audio
  const transcribeAudio = useCallback(async () => {
    await transcribeAudioCore();
  }, [transcribeAudioCore]);

  // Reset all states
  const resetAll = useCallback(async () => {
    stopPreview();
    resetRecording();
    clearTranscription();
  }, [clearTranscription, resetRecording, stopPreview]);

  return {
    isEngineSupported,
    hasPermission,
    isRecording,
    recordingDurationSec,
    recordedUri,
    recordingError,
    isPlayingPreview,
    playbackPositionSec,
    playbackDurationSec,
    isTranscribing,
    transcription,
    transcriptionLatencyMs,
    transcriptionError,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio,
    playPreview,
    pausePreview,
    clearTranscription,
    resetAll,
  };
}
