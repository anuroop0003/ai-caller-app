import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { BenchmarkRunResult } from '@/services/speech/audioBenchmarkService';
import { cn } from '@/utils/cn';

interface BenchmarkResultCardProps {
  result: BenchmarkRunResult | null;
  error: string | null;
  onClear: () => void;
}

export function BenchmarkResultCard({ result, error, onClear }: BenchmarkResultCardProps) {
  if (!result && !error) return null;

  if (error) {
    return (
      <View className="rounded-md p-4 bg-destructive/10 border border-destructive/30 gap-2">
        <View className="flex-row items-center justify-between">
          <ThemedText type="smallBold" className="text-destructive">
            Recognition Failed
          </ThemedText>
          <Pressable onPress={onClear} className="p-1 active:opacity-70" accessibilityLabel="Dismiss error">
            <Ionicons name="close" size={16} color="#ef4444" />
          </Pressable>
        </View>
        <ThemedText type="small" className="text-foreground">{error}</ThemedText>
      </View>
    );
  }

  if (!result) return null;

  const { sample, transcription, latencyMs } = result;

  const getLatencyBadge = (ms: number) => {
    if (ms < 500) {
      return {
        label: `${ms} ms • Ultra Fast`,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
      };
    }
    if (ms < 1500) {
      return {
        label: `${ms} ms • Real-Time`,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
      };
    }
    return {
      label: `${ms} ms`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    };
  };

  const latencyStyle = getLatencyBadge(latencyMs);

  return (
    <View className="rounded-md p-4 bg-card border border-border shadow-sm gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <ThemedText type="h4" className="text-foreground">
            Live Recognition Output
          </ThemedText>
        </View>

        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Dismiss recognition output"
          className="px-2.5 py-1 rounded-md bg-secondary border border-border active:opacity-75">
          <ThemedText type="small" className="text-muted-foreground">Dismiss</ThemedText>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View className="flex-row flex-wrap gap-2">
        <View className={cn('px-2.5 py-1 rounded-md border flex-row items-center gap-1', latencyStyle.bg, latencyStyle.border)}>
          <Ionicons name="flash" size={12} color="#10b981" />
          <ThemedText type="code" className={latencyStyle.color}>
            {latencyStyle.label}
          </ThemedText>
        </View>

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

      {/* Primary Live Model Output Box */}
      <View className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-2">
        <View className="flex-row items-center justify-between">
          <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
            Live Transcribed Speech
          </ThemedText>
          <ThemedText type="code" className="text-emerald-700 dark:text-emerald-300">
            On-Device INT8
          </ThemedText>
        </View>
        <ThemedText type="lead" className="text-foreground leading-7">
          &ldquo;{transcription.text || '(empty / silence detected)'}&rdquo;
        </ThemedText>
      </View>
    </View>
  );
}
