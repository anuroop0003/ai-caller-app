import { ActivityIndicator, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { TtsSynthesisResult } from '@/types/tts';
import { cn } from '@/utils/cn';

export interface TtsMetricsPanelProps {
  isSynthesizing?: boolean;
  spokenText?: string;
  result: TtsSynthesisResult | null;
}

export function TtsMetricsPanel({
  isSynthesizing = false,
  spokenText,
  result,
}: TtsMetricsPanelProps) {
  // 1. Loading / In-Progress State
  if (isSynthesizing) {
    return (
      <View className="p-3.5 rounded-md bg-blue-500/10 border border-blue-500/30 flex-row items-center gap-2.5">
        <ActivityIndicator size="small" color="#2563eb" />
        <ThemedText type="small" className="text-blue-700 dark:text-blue-300 font-medium">
          Synthesizing speech live with on-device model...
        </ThemedText>
      </View>
    );
  }

  // 2. Synthesis Result State (Green Dotted/Dashed Border & Emerald Background)
  if (result) {
    return (
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-dashed border-emerald-500/40 gap-2">
        {/* Header: Status Dot & Latency */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
              Live Speech Output
            </ThemedText>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="flash" size={11} color="#10b981" />
            <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
              {result.synthesisTimeMs} ms
            </ThemedText>
          </View>
        </View>

        {/* Synthesized Utterance Text */}
        {spokenText ? (
          <ThemedText selectable type="p" className="text-foreground leading-6 font-medium">
            &ldquo;{spokenText}&rdquo;
          </ThemedText>
        ) : null}

        {/* Synthesis Metrics Badges */}
        <View className="flex-row flex-wrap gap-2 pt-1">
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Duration:{' '}
              <ThemedText type="small" className="text-foreground">
                {result.durationSec.toFixed(2)}s
              </ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              RTF:{' '}
              <ThemedText
                type="small"
                className={cn(
                  result.rtf < 0.2
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-foreground'
                )}
              >
                {result.rtf.toFixed(3)}x
              </ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Sample Rate:{' '}
              <ThemedText type="small" className="text-foreground">
                {result.sampleRate} Hz
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // 3. Waiting / Empty State (Dashed Border)
  return (
    <View className="p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
      <ThemedText type="smallBold" className="text-muted-foreground">
        Live Speech Output
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground italic">
        Select a preset or enter Malayalam text above and tap &ldquo;Synthesize Speech&rdquo;
      </ThemedText>
    </View>
  );
}
