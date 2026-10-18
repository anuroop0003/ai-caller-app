import { ActivityIndicator, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import { LatencyBadge } from './latency-badge';

export interface SampleTranscriptionPanelProps {
  isTranscribing: boolean;
  liveTranscript?: string | null;
  liveLatencyMs?: number | null;
  liveTokensCount?: number | null;
}

export function SampleTranscriptionPanel({
  isTranscribing,
  liveTranscript,
  liveLatencyMs,
  liveTokensCount,
}: SampleTranscriptionPanelProps) {
  const hasLiveResult = liveTranscript !== undefined && liveTranscript !== null;

  if (isTranscribing) {
    return (
      <View className="p-3.5 rounded-md bg-blue-500/10 border border-blue-500/30 flex-row items-center gap-2.5">
        <ActivityIndicator size="small" color="#2563eb" />
        <ThemedText type="small" className="text-blue-700 dark:text-blue-300 font-medium">
          Transcribing live with on-device model...
        </ThemedText>
      </View>
    );
  }

  if (hasLiveResult) {
    return (
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-1.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
              Live Transcription
            </ThemedText>
          </View>
          {liveLatencyMs != null ? (
            <LatencyBadge latencyMs={liveLatencyMs} showCategory={false} variant="compact" />
          ) : null}
        </View>

        <ThemedText type="p" className="text-foreground leading-6">
          &ldquo;{liveTranscript || '(silence / no speech detected)'}&rdquo;
        </ThemedText>

        {liveTokensCount != null ? (
          <ThemedText type="code" className="text-muted-foreground pt-0.5">
            Tokens: {liveTokensCount}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  return (
    <View className="p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
      <ThemedText type="smallBold" className="text-muted-foreground">
        Live Model Output
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground italic">
        Tap &ldquo;Transcribe Live&rdquo; below to run on-device recognition
      </ThemedText>
    </View>
  );
}
