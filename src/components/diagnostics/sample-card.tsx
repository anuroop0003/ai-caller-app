import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { AudioTestSample } from '@/constants/audioTestSamples';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

interface SampleCardProps {
  sample: AudioTestSample;
  isPlaying: boolean;
  isTranscribing: boolean;
  isPlaybackSupported?: boolean;
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
  isPlaybackSupported = true,
  liveTranscript,
  liveLatencyMs,
  liveTokensCount,
  onTogglePlay,
  onRunTest,
}: SampleCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  const getLanguageColor = (code: string) => {
    switch (code) {
      case 'ml':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          iconColor: '#10b981',
        };
      case 'hi':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-700 dark:text-orange-300',
          iconColor: '#f97316',
        };
      case 'ta':
        return {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          text: 'text-indigo-700 dark:text-indigo-300',
          iconColor: '#6366f1',
        };
      case 'manglish':
      default:
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-700 dark:text-purple-300',
          iconColor: '#a855f7',
        };
    }
  };

  const langStyle = getLanguageColor(sample.languageCode);
  const hasLiveResult = liveTranscript !== undefined && liveTranscript !== null;

  return (
    <View className="rounded-md p-4 border border-border bg-card gap-3">
      {/* Header row: Title & Badges */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          <View
            className={cn(
              'w-10 h-10 rounded-md items-center justify-center border',
              langStyle.bg,
              langStyle.border
            )}>
            <Ionicons
              name={sample.speakerGender === 'female' ? 'woman' : 'man'}
              size={20}
              color={langStyle.iconColor}
            />
          </View>
          <View className="flex-1">
            <ThemedText type="smallBold" className="text-foreground" numberOfLines={1}>
              {sample.title} ({sample.language})
            </ThemedText>
            <ThemedText type="muted" className="text-muted-foreground">
              {sample.speakerLabel} • {sample.durationLabel}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Live Transcription Box */}
      {isTranscribing ? (
        <View className="p-3.5 rounded-md bg-primary/10 border border-primary/30 flex-row items-center gap-2.5">
          <ActivityIndicator size="small" color="#2563eb" />
          <ThemedText type="small" className="text-primary">
            Transcribing live with on-device model...
          </ThemedText>
        </View>
      ) : hasLiveResult ? (
        <View className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
                Live Transcription
              </ThemedText>
            </View>
            {liveLatencyMs != null ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="flash" size={11} color="#10b981" />
                <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
                  {liveLatencyMs} ms
                </ThemedText>
              </View>
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
      ) : (
        <View className="p-3.5 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
          <ThemedText type="smallBold" className="text-muted-foreground">
            Live Model Output
          </ThemedText>
          <ThemedText type="muted" className="text-muted-foreground italic">
            Tap &ldquo;Transcribe Live&rdquo; below to run on-device recognition
          </ThemedText>
        </View>
      )}

      {/* Action Row */}
      <View className="flex-row items-center gap-2 pt-0.5">
        <Pressable
          onPress={() => onTogglePlay(sample)}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
          className={cn(
            'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
            isPlaying
              ? 'bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50'
              : 'bg-secondary border-border'
          )}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color={isPlaying ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#e4e4e7' : '#18181b')}
            style={{ marginRight: 4 }}
          />
          <ThemedText
            type={isPlaying ? 'smallBold' : 'small'}
            className={cn(
              isPlaying ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
            )}>
            {isPlaying ? 'Pause Audio' : isPlaybackSupported ? 'Play Audio' : 'Audio (Rebuild)'}
          </ThemedText>
        </Pressable>

        <Pressable
          disabled={isTranscribing}
          onPress={() => onRunTest(sample)}
          accessibilityRole="button"
          accessibilityLabel="Run live transcription benchmark"
          className={cn(
            'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md active:opacity-80',
            isTranscribing ? 'bg-primary/70' : 'bg-primary'
          )}>
          {isTranscribing ? (
            <ActivityIndicator
              size="small"
              color={primaryForeground}
              style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
            />
          ) : (
            <Ionicons
              name="flash"
              size={16}
              color={primaryForeground}
              style={{ marginRight: 4 }}
            />
          )}
          <ThemedText type="smallBold" className="text-primary-foreground">
            {isTranscribing ? 'Transcribing...' : 'Transcribe Live'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
