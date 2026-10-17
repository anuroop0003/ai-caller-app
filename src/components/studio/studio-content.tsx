import { View } from 'react-native';

import { type UseAudioTranscriberResult, useAudioTranscriber } from '@/hooks/use-audio-transcriber';
import { cn } from '@/utils/cn';

import { AudioRecorderCard } from './audio-recorder-card';
import { TranscriptionResultCard } from './transcription-result-card';

interface StudioContentProps {
  transcriberHook?: UseAudioTranscriberResult;
  className?: string;
}

export function StudioContent({
  transcriberHook: externalHook,
  className,
}: StudioContentProps = {}) {
  const internalHook = useAudioTranscriber();
  const hook = externalHook ?? internalHook;

  const {
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
  } = hook;

  return (
    <View className={cn('gap-4', className)}>
      {/* Live Audio Recorder Component */}
      <AudioRecorderCard
        isRecording={isRecording}
        recordingDurationSec={recordingDurationSec}
        recordedUri={recordedUri}
        recordingError={recordingError}
        isPlayingPreview={isPlayingPreview}
        playbackPositionSec={playbackPositionSec}
        playbackDurationSec={playbackDurationSec}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onCancelRecording={cancelRecording}
        onPlayPreview={playPreview}
        onPausePreview={pausePreview}
      />

      {/* Real Speech-to-Text Transcription Converter Component */}
      <TranscriptionResultCard
        hasRecordedAudio={Boolean(recordedUri)}
        isTranscribing={isTranscribing}
        transcription={transcription}
        transcriptionLatencyMs={transcriptionLatencyMs}
        transcriptionError={transcriptionError}
        onTranscribe={transcribeAudio}
        onClear={clearTranscription}
      />
    </View>
  );
}
