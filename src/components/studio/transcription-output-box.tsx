import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { SttTranscriptionResult } from '@/types/speech';
import { cn } from '@/utils/cn';

export interface TranscriptionOutputBoxProps {
  isTranscribing: boolean;
  transcription: SttTranscriptionResult | null;
  transcriptionLatencyMs: number | null;
  onRetranscribe: () => void;
  onClear: () => void;
  className?: string;
}

export function TranscriptionOutputBox({
  isTranscribing,
  transcription,
  transcriptionLatencyMs,
  onRetranscribe,
  onClear,
  className,
}: TranscriptionOutputBoxProps) {
  // 1. Loading / In-Progress State
  if (isTranscribing) {
    return (
      <View
        className={cn(
          'p-3.5 rounded-md bg-primary/10 border border-primary/30 flex-row items-center gap-2.5',
          className
        )}
      >
        <ActivityIndicator size="small" color="#2563eb" />
        <ThemedText type="small" className="text-primary">
          Transcribing live with on-device model...
        </ThemedText>
      </View>
    );
  }

  // 2. Transcription Result Available State
  if (transcription) {
    return (
      <View
        className={cn(
          'p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-2',
          className
        )}
      >
        {/* Header: Status Dot & Latency */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
              Live Transcription
            </ThemedText>
          </View>
          {transcriptionLatencyMs != null ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={11} color="#10b981" />
              <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
                {transcriptionLatencyMs} ms
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Selectable Transcribed Malayalam Text */}
        <ThemedText selectable type="p" className="text-foreground leading-6 font-medium">
          &ldquo;{transcription.text || '(silence / no speech detected)'}&rdquo;
        </ThemedText>

        {/* Metadata Badges */}
        <View className="flex-row flex-wrap gap-2 pt-1">
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Tokens:{' '}
              <ThemedText type="small" className="text-foreground">
                {transcription.tokens.length}
              </ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Timestamps:{' '}
              <ThemedText type="small" className="text-foreground">
                {transcription.timestamps.length}
              </ThemedText>
            </ThemedText>
          </View>
          {transcription.lang ? (
            <View className="px-2.5 py-1 rounded-md bg-card border border-border">
              <ThemedText type="muted" className="text-muted-foreground">
                Language:{' '}
                <ThemedText type="small" className="text-foreground">
                  {transcription.lang}
                </ThemedText>
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Action Controls */}
        <View className="flex-row items-center gap-2 pt-1">
          <Pressable
            onPress={onRetranscribe}
            accessibilityRole="button"
            accessibilityLabel="Re-transcribe audio"
            className="flex-1 py-2 px-3 rounded-md bg-card border border-border items-center justify-center active:opacity-75"
          >
            <ThemedText type="smallBold" className="text-foreground text-xs font-semibold">
              Re-transcribe
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear transcript"
            className="py-2 px-4 rounded-md bg-card border border-border items-center justify-center active:opacity-75"
          >
            <ThemedText type="small" className="text-muted-foreground text-xs">
              Clear
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  // 3. Waiting / Empty State
  return (
    <View
      className={cn(
        'p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1',
        className
      )}
    >
      <ThemedText type="smallBold" className="text-muted-foreground">
        Live Model Output
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground italic">
        Record a voice sample above and tap &ldquo;Convert Audio to Transcript&rdquo;
      </ThemedText>
    </View>
  );
}
