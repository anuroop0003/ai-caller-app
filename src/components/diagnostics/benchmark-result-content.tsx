import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { BenchmarkRunResult } from '@/services/speech/audioBenchmarkService';

import { LatencyBadge } from './latency-badge';
import { TranscriptionBox } from './transcription-box';

export interface BenchmarkResultContentProps {
  result: BenchmarkRunResult;
  onClear: () => void;
}

export function BenchmarkResultContent({ result, onClear }: BenchmarkResultContentProps) {
  const { sample, transcription, latencyMs } = result;

  return (
    <View className="rounded-md p-4 bg-card border border-border shadow-sm gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <ThemedText type="h4" className="text-foreground">
            Recognition Result
          </ThemedText>
        </View>

        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Dismiss recognition output"
          className="px-2.5 py-1 rounded-md bg-secondary border border-border active:opacity-75"
        >
          <ThemedText type="small" className="text-muted-foreground">
            Dismiss
          </ThemedText>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View className="flex-row flex-wrap gap-2">
        <LatencyBadge latencyMs={latencyMs} />

        <View className="px-2.5 py-1 rounded-md bg-secondary border border-border">
          <ThemedText type="muted" className="text-muted-foreground">
            {sample.title} ({sample.speakerGender})
          </ThemedText>
        </View>

        <View className="px-2.5 py-1 rounded-md bg-secondary border border-border">
          <ThemedText type="code" className="text-muted-foreground">
            Tokens: {transcription.tokens.length}
          </ThemedText>
        </View>
      </View>

      {/* Model Output Box */}
      <TranscriptionBox
        text={transcription.text}
        title="Transcription"
        tag="On-Device INT8"
      />
    </View>
  );
}
