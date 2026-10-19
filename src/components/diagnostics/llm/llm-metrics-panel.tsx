import { ActivityIndicator, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { LlmBenchmarkResult } from '@/types/llm';

export interface LlmMetricsPanelProps {
  isBenchmarking?: boolean;
  result: LlmBenchmarkResult | null;
}

export function LlmMetricsPanel({ isBenchmarking = false, result }: LlmMetricsPanelProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 1. Loading / In-Progress State
  if (isBenchmarking) {
    return (
      <View className="p-3.5 rounded-md bg-purple-500/10 border border-purple-500/30 flex-row items-center gap-2.5">
        <ActivityIndicator size="small" color={isDark ? '#a78bfa' : '#7c3aed'} />
        <ThemedText type="small" className="text-purple-700 dark:text-purple-300 font-medium">
          Generating Malayalam response with local LLM...
        </ThemedText>
      </View>
    );
  }

  // 2. Generation Result State (Emerald dashed border + metrics)
  if (result) {
    return (
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-dashed border-emerald-500/40 gap-2">
        {/* Header: Status Dot & Latency */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
              Live Malayalam Output
            </ThemedText>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="flash" size={11} color="#10b981" />
            <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
              {result.totalTurnaroundMs} ms
            </ThemedText>
          </View>
        </View>

        {/* Synthesized Response Text */}
        <ThemedText selectable type="p" className="text-foreground leading-6 font-medium">
          &ldquo;{result.response}&rdquo;
        </ThemedText>

        {/* Metrics Badges */}
        <View className="flex-row flex-wrap gap-2 pt-1">
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              TTFT:{' '}
              <ThemedText type="code" className="text-xs text-foreground leading-none">
                {result.timeToFirstTokenMs} ms
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Speed:{' '}
              <ThemedText type="code" className="text-xs text-foreground leading-none">
                {result.tokensPerSecond} tok/s
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Tokens:{' '}
              <ThemedText type="code" className="text-xs text-foreground leading-none">
                {result.completionTokens}
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Load:{' '}
              <ThemedText type="code" className="text-xs text-foreground leading-none">
                {result.loadTimeMs} ms
              </ThemedText>
            </ThemedText>
          </View>

          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground text-xs leading-none">
              Runtime:{' '}
              <ThemedText type="code" className="text-xs text-foreground leading-none">
                {result.runtimeType === 'native_llama_rn' ? 'Native C++' : 'Mock'}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // 3. Waiting / Empty State (Dashed border)
  return (
    <View className="p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
      <ThemedText type="smallBold" className="text-muted-foreground">
        Live Malayalam Output
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground italic text-xs">
        Select a prompt preset or enter Malayalam text above and tap &ldquo;Run Benchmark
        Turn&rdquo;
      </ThemedText>
    </View>
  );
}
