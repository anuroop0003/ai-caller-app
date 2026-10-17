import { View } from 'react-native';

import { cn } from '@/utils/cn';

import { RecorderErrorBanner } from './recorder-error-banner';
import { RecorderHeaderSection } from './recorder-header-section';
import { RecorderPlaybackPreview } from './recorder-playback-preview';
import { RecorderStage } from './recorder-stage';

export interface AudioRecorderCardProps {
  isRecording: boolean;
  recordingDurationSec: number;
  recordedUri: string | null;
  recordingError: string | null;
  isPlayingPreview: boolean;
  playbackPositionSec: number;
  playbackDurationSec: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onPlayPreview: () => void;
  onPausePreview: () => void;
  className?: string;
}

export function AudioRecorderCard({
  isRecording,
  recordingDurationSec,
  recordedUri,
  recordingError,
  isPlayingPreview,
  playbackPositionSec,
  playbackDurationSec,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onPlayPreview,
  onPausePreview,
  className,
}: AudioRecorderCardProps) {
  return (
    <View className={cn('rounded-md p-4 border border-border bg-card gap-3 shadow-sm', className)}>
      {/* Header Row & Live Status Badge */}
      <RecorderHeaderSection isRecording={isRecording} recordedUri={recordedUri} />

      {/* Recording Error Alert Banner */}
      <RecorderErrorBanner error={recordingError} />

      {/* Recording Stage with Timer & Action Button */}
      <RecorderStage
        isRecording={isRecording}
        recordingDurationSec={recordingDurationSec}
        playbackDurationSec={playbackDurationSec}
        hasRecordedAudio={Boolean(recordedUri)}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
      />

      {/* Audio Playback Preview & Discard Controls */}
      {recordedUri && !isRecording ? (
        <RecorderPlaybackPreview
          isPlaying={isPlayingPreview}
          positionSec={playbackPositionSec}
          durationSec={playbackDurationSec || recordingDurationSec}
          onPlay={onPlayPreview}
          onPause={onPausePreview}
          onDiscard={onCancelRecording}
        />
      ) : null}
    </View>
  );
}
