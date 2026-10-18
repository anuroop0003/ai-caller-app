import { View } from 'react-native';

import type { SttTranscriptionResult } from '@/types/speech';
import { cn } from '@/utils/cn';

import { TranscriptionCtaButton } from './transcription-cta-button';
import { TranscriptionErrorBanner } from './transcription-error-banner';
import { TranscriptionHeaderSection } from './transcription-header-section';
import { TranscriptionOutputBox } from './transcription-output-box';

export interface TranscriptionResultCardProps {
  hasRecordedAudio: boolean;
  isTranscribing: boolean;
  transcription: SttTranscriptionResult | null;
  transcriptionLatencyMs: number | null;
  transcriptionError: string | null;
  onTranscribe: () => void;
  onClear: () => void;
  className?: string;
}

export function TranscriptionResultCard({
  hasRecordedAudio,
  isTranscribing,
  transcription,
  transcriptionLatencyMs,
  transcriptionError,
  onTranscribe,
  onClear,
  className,
}: TranscriptionResultCardProps) {
  return (
    <View className={cn('rounded-md p-4 border border-border bg-card gap-3 shadow-sm', className)}>
      {/* Top Header Row matching ModelHeaderSection */}
      <TranscriptionHeaderSection />

      {/* Error Alert Banner */}
      <TranscriptionErrorBanner error={transcriptionError} />

      {/* Action CTA: Transcribe Button (visible when recorded audio is ready) */}
      {hasRecordedAudio && !transcription ? (
        <TranscriptionCtaButton
          onPress={onTranscribe}
          isLoading={isTranscribing}
          disabled={isTranscribing}
          loadingText="Transcribing..."
        />
      ) : null}

      {/* Output Stage (Loading, Result, or Waiting State) */}
      <TranscriptionOutputBox
        isTranscribing={isTranscribing}
        transcription={transcription}
        transcriptionLatencyMs={transcriptionLatencyMs}
        onRetranscribe={onTranscribe}
        onClear={onClear}
      />
    </View>
  );
}
