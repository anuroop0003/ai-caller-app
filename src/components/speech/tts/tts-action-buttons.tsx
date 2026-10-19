import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface TtsActionButtonsProps {
  isSynthesizing: boolean;
  isPlaying: boolean;
  hasResult: boolean;
  canSynthesize: boolean;
  isReady?: boolean;
  onSynthesize: () => void;
  onPlay: () => void;
}

export function TtsActionButtons({
  isSynthesizing,
  isPlaying,
  hasResult,
  canSynthesize,
  isReady = true,
  onSynthesize,
  onPlay,
}: TtsActionButtonsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {/* Play / Repeat Audio Button */}
      <Pressable
        key="tts-play-btn"
        disabled={!hasResult || isSynthesizing}
        onPress={onPlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause audio' : 'Play synthesized speech'}
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
          !hasResult && 'opacity-50',
          isPlaying
            ? 'bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50'
            : 'bg-secondary border-border'
        )}
      >
        <Ionicons
          name={isPlaying ? 'volume-high' : 'play'}
          size={16}
          color={isPlaying ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#e4e4e7' : '#18181b'}
          style={{ marginRight: 4 }}
        />
        <ThemedText
          type={isPlaying ? 'smallBold' : 'small'}
          className={cn(isPlaying ? 'text-blue-600 dark:text-blue-400' : 'text-foreground')}
        >
          {isPlaying ? 'Playing...' : hasResult ? 'Play Audio' : 'Play (No Audio)'}
        </ThemedText>
      </Pressable>

      {/* Synthesize Button */}
      <Pressable
        key="tts-synthesize-btn"
        disabled={isSynthesizing || !canSynthesize || !isReady}
        onPress={onSynthesize}
        accessibilityRole="button"
        accessibilityLabel={!isReady ? 'TTS model missing on disk' : 'Synthesize speech offline'}
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md bg-primary active:opacity-80',
          (isSynthesizing || !canSynthesize || !isReady) && 'opacity-60'
        )}
      >
        {isSynthesizing ? (
          <ActivityIndicator
            size="small"
            color={primaryForeground}
            style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
          />
        ) : (
          <Ionicons
            name={!isReady ? 'warning-outline' : 'sparkles'}
            size={16}
            color={primaryForeground}
            style={{ marginRight: 4 }}
          />
        )}
        <ThemedText type="smallBold" className="text-primary-foreground">
          {!isReady ? 'Model Missing' : isSynthesizing ? 'Generating...' : 'Synthesize Speech'}
        </ThemedText>
      </Pressable>
    </View>
  );
}
