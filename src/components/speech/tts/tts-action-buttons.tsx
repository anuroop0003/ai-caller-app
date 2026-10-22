import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface TtsActionButtonsProps {
  isSynthesizing: boolean;
  isPlaying: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
}

export function TtsActionButtons({
  isSynthesizing,
  isPlaying,
  canPlay,
  onPlay,
  onStop,
  onOpenSettings,
}: TtsActionButtonsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {/* Settings Shortcut Button */}
      <Pressable
        onPress={onOpenSettings}
        accessibilityRole="button"
        accessibilityLabel="Open Android TTS Settings"
        className="h-9 px-3 rounded-md border border-border bg-secondary flex-row items-center justify-center gap-1.5 active:opacity-75"
      >
        <Ionicons name="settings-outline" size={14} color={isDark ? '#e4e4e7' : '#18181b'} />
        <ThemedText type="smallBold" className="text-foreground text-xs">
          TTS Settings
        </ThemedText>
      </Pressable>

      {/* Main Play / Stop Button */}
      <Pressable
        disabled={isSynthesizing || (!isPlaying && !canPlay)}
        onPress={isPlaying ? onStop : onPlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Stop speech synthesis test' : 'Play speech synthesis test'}
        className={cn(
          'flex-1 h-9 px-3.5 min-w-[100px] rounded-md border flex-row items-center justify-center gap-1.5 active:opacity-75',
          isPlaying
            ? 'bg-rose-500 border-rose-600'
            : 'bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50',
          !isPlaying && !canPlay && 'opacity-50'
        )}
      >
        {isSynthesizing ? (
          <ActivityIndicator
            size="small"
            color={isPlaying ? '#ffffff' : isDark ? '#60a5fa' : '#2563eb'}
            style={{ transform: [{ scale: 0.75 }] }}
          />
        ) : (
          <Ionicons
            name={isPlaying ? 'stop' : 'play'}
            size={14}
            color={isPlaying ? '#ffffff' : isDark ? '#60a5fa' : '#2563eb'}
          />
        )}
        <ThemedText
          type="smallBold"
          className={cn(
            'text-xs font-semibold',
            isPlaying ? 'text-white' : 'text-blue-600 dark:text-blue-400'
          )}
        >
          {isPlaying ? 'Stop' : isSynthesizing ? 'Starting...' : 'Play Test'}
        </ThemedText>
      </Pressable>
    </View>
  );
}
