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
  // 1. Loading / In-Progress State (only if no transcription is displayed yet)
  if (isTranscribing && !transcription) {
    return (
      <View
        className={cn(
          'p-3.5 rounded-md bg-blue-500/10 border border-blue-500/30 flex-row items-center gap-2.5',
          className
        )}
      >
        <ActivityIndicator size="small" color="#2563eb" />
        <ThemedText type="small" className="text-blue-700 dark:text-blue-300 font-medium">
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
          'p-3.5 rounded-md border gap-2',
          isTranscribing
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30',
          className
        )}
      >
        {/* Header: Status Dot & Latency */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View
              className={cn(
                'w-2 h-2 rounded-full',
                isTranscribing ? 'bg-blue-500' : 'bg-emerald-500'
              )}
            />
            <ThemedText
              type="smallBold"
              className={
                isTranscribing
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }
            >
              {isTranscribing ? 'Generating Transcription...' : 'Live Transcription'}
            </ThemedText>
          </View>
          {transcriptionLatencyMs != null && !isTranscribing ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={11} color="#10b981" />
              <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
                {transcriptionLatencyMs} ms
              </ThemedText>
            </View>
          ) : isTranscribing ? (
            <ActivityIndicator
              size="small"
              color="#2563eb"
              style={{ transform: [{ scale: 0.7 }] }}
            />
          ) : null}
        </View>

        {/* Selectable Transcribed Malayalam Text */}
        <ThemedText
          selectable
          type="p"
          className={cn('text-foreground leading-6 font-medium', isTranscribing && 'opacity-60')}
        >
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
            disabled={isTranscribing}
            onPress={onRetranscribe}
            accessibilityRole="button"
            accessibilityLabel={isTranscribing ? 'Generating transcript...' : 'Re-transcribe audio'}
            className={cn(
              'flex-1 py-2 px-3 rounded-md bg-card border border-border flex-row items-center justify-center gap-2 active:opacity-75',
              isTranscribing && 'opacity-75'
            )}
          >
            {isTranscribing ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{ transform: [{ scale: 0.8 }] }}
              />
            ) : null}
            <ThemedText type="smallBold" className="text-foreground text-xs font-semibold">
              {isTranscribing ? 'Transcribing...' : 'Re-transcribe'}
            </ThemedText>
          </Pressable>

          <Pressable
            disabled={isTranscribing}
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear transcript"
            className={cn(
              'py-2 px-4 rounded-md bg-card border border-border items-center justify-center active:opacity-75',
              isTranscribing && 'opacity-50'
            )}
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
