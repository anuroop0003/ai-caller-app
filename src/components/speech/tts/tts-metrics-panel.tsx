import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { TtsBenchmarkResult } from '@/types/ttsSettings';

export interface TtsMetricsPanelProps {
  isSynthesizing?: boolean;
  isPlaying?: boolean;
  benchmark: TtsBenchmarkResult | null;
}

export function TtsMetricsPanel({
  isSynthesizing = false,
  isPlaying = false,
  benchmark,
}: TtsMetricsPanelProps) {
  // 1. Loading / Synthesizing State (Matches STT & LLM tabs)
  if (isSynthesizing) {
    return (
      <View className="p-3.5 rounded-md bg-blue-500/10 border border-blue-500/30 flex-row items-center gap-2.5">
        <ActivityIndicator size="small" color="#2563eb" />
        <ThemedText type="small" className="text-blue-700 dark:text-blue-300 font-medium">
          Synthesizing speech with native engine...
        </ThemedText>
      </View>
    );
  }

  // 2. Active Playback State
  if (isPlaying) {
    return (
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-dashed border-emerald-500/40 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#10b981" style={{ transform: [{ scale: 0.8 }] }} />
          <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
            Vocalizing Speech...
          </ThemedText>
        </View>
        <Ionicons name="volume-high" size={18} color="#10b981" />
      </View>
    );
  }

  // 3. Completed Benchmark Result State (Emerald dashed border + metric badges)
  if (benchmark) {
    return (
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-dashed border-emerald-500/40 gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
              {benchmark.wasInterrupted ? 'Speech Interrupted' : 'Benchmark Completed'}
            </ThemedText>
          </View>
          <ThemedText type="code" className="text-xs text-muted-foreground">
            {benchmark.language}
          </ThemedText>
        </View>

        {/* Latency & Duration Metrics Badges */}
        <View className="flex-row flex-wrap gap-2 pt-0.5">
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Startup Latency:{' '}
              <ThemedText
                type="code"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold leading-none"
              >
                {benchmark.startupLatencyMs} ms
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Speech Duration:{' '}
              <ThemedText
                type="code"
                className="text-xs text-foreground font-semibold leading-none"
              >
                {(benchmark.totalDurationMs / 1000).toFixed(2)} s
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Status:{' '}
              <ThemedText
                type="code"
                className={`text-xs leading-none ${
                  benchmark.isCompleted ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {benchmark.isCompleted ? 'Finished' : 'Stopped early'}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // 4. Default / Empty State (Secondary dashed border matching LLM and STT tabs)
  return (
    <View className="p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
      <ThemedText type="smallBold" className="text-muted-foreground">
        Live Speech Output
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground italic text-xs">
        Enter custom text above and tap &ldquo;Play Test&rdquo; to measure startup latency and
        duration
      </ThemedText>
    </View>
  );
}
