import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { AudioTestSample } from '@/constants/audioTestSamples';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface SampleCardActionsProps {
  sample: AudioTestSample;
  isPlaying: boolean;
  isTranscribing: boolean;
  isAnyTranscribing?: boolean;
  isPlaybackSupported?: boolean;
  onTogglePlay: (sample: AudioTestSample) => void;
  onRunTest: (sample: AudioTestSample) => void;
}

export function SampleCardActions({
  sample,
  isPlaying,
  isTranscribing,
  isAnyTranscribing = false,
  isPlaybackSupported = true,
  onTogglePlay,
  onRunTest,
}: SampleCardActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {/* Audio Playback Button */}
      <Pressable
        onPress={() => onTogglePlay(sample)}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
          isPlaying
            ? 'bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50'
            : 'bg-secondary border-border'
        )}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={16}
          color={isPlaying ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#e4e4e7' : '#18181b'}
          style={{ marginRight: 4 }}
        />
        <ThemedText
          type={isPlaying ? 'smallBold' : 'small'}
          className={cn(isPlaying ? 'text-blue-600 dark:text-blue-400' : 'text-foreground')}
        >
          {isPlaying ? 'Pause Audio' : isPlaybackSupported ? 'Play Audio' : 'Audio (Rebuild)'}
        </ThemedText>
      </Pressable>

      {/* Live Benchmark Transcribe Button */}
      <Pressable
        disabled={isTranscribing || isAnyTranscribing}
        onPress={() => onRunTest(sample)}
        accessibilityRole="button"
        accessibilityLabel={
          isTranscribing ? 'Transcribing live audio' : 'Run live transcription benchmark'
        }
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md bg-primary active:opacity-80',
          (isTranscribing || isAnyTranscribing) && 'opacity-60'
        )}
      >
        {isTranscribing ? (
          <ActivityIndicator
            size="small"
            color={primaryForeground}
            style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
          />
        ) : (
          <Ionicons name="flash" size={16} color={primaryForeground} style={{ marginRight: 4 }} />
        )}
        <ThemedText type="smallBold" className="text-primary-foreground">
          {isTranscribing ? 'Transcribing...' : 'Transcribe Live'}
        </ThemedText>
      </Pressable>
    </View>
  );
}
