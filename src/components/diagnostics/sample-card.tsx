import { View } from 'react-native';

import type { AudioTestSample } from '@/constants/audioTestSamples';

import { SampleCardActions } from './sample-card-actions';
import { SampleCardHeader } from './sample-card-header';
import { SampleTranscriptionPanel } from './sample-transcription-panel';

export interface SampleCardProps {
  sample: AudioTestSample;
  isPlaying: boolean;
  isTranscribing: boolean;
  isAnyTranscribing?: boolean;
  isPlaybackSupported?: boolean;
  isReady?: boolean;
  liveTranscript?: string | null;
  liveLatencyMs?: number | null;
  liveTokensCount?: number | null;
  onTogglePlay: (sample: AudioTestSample) => void;
  onRunTest: (sample: AudioTestSample) => void;
}

export function SampleCard({
  sample,
  isPlaying,
  isTranscribing,
  isAnyTranscribing = false,
  isPlaybackSupported = true,
  isReady = true,
  liveTranscript,
  liveLatencyMs,
  liveTokensCount,
  onTogglePlay,
  onRunTest,
}: SampleCardProps) {
  return (
    <View className="rounded-md p-4 border border-border bg-card gap-3">
      <SampleCardHeader sample={sample} />

      <SampleTranscriptionPanel
        isTranscribing={isTranscribing}
        liveTranscript={liveTranscript}
        liveLatencyMs={liveLatencyMs}
        liveTokensCount={liveTokensCount}
      />

      <SampleCardActions
        sample={sample}
        isPlaying={isPlaying}
        isTranscribing={isTranscribing}
        isAnyTranscribing={isAnyTranscribing}
        isPlaybackSupported={isPlaybackSupported}
        isReady={isReady}
        onTogglePlay={onTogglePlay}
        onRunTest={onRunTest}
      />
    </View>
  );
}
