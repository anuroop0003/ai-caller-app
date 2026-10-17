import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface RecorderPlaybackPreviewProps {
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  onPlay: () => void;
  onPause: () => void;
  onDiscard: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecorderPlaybackPreview({
  isPlaying,
  positionSec,
  durationSec,
  onPlay,
  onPause,
  onDiscard,
  className,
}: RecorderPlaybackPreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={cn(
        'p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-2.5',
        className
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300 text-xs">
            Recorded Clip Preview
          </ThemedText>
        </View>
        <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400 text-[11px]">
          {formatDuration(positionSec)} / {formatDuration(durationSec)}
        </ThemedText>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Play/Pause Button */}
        <Pressable
          onPress={isPlaying ? onPause : onPlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause audio preview' : 'Play audio preview'}
          className={cn(
            'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
            isPlaying
              ? 'bg-emerald-500/20 border-emerald-500/40 dark:bg-emerald-500/25 dark:border-emerald-500/50'
              : 'bg-card border-border'
          )}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={15}
            color={isPlaying ? (isDark ? '#34d399' : '#059669') : isDark ? '#e4e4e7' : '#18181b'}
            style={{ marginRight: 6 }}
          />
          <ThemedText
            type={isPlaying ? 'smallBold' : 'small'}
            className={cn(isPlaying ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground')}
          >
            {isPlaying ? 'Pause Preview' : 'Play Preview'}
          </ThemedText>
        </Pressable>

        {/* Discard Button */}
        <Pressable
          onPress={onDiscard}
          accessibilityRole="button"
          accessibilityLabel="Discard audio and record again"
          className="py-2 px-3 rounded-md bg-card border border-border items-center justify-center active:opacity-75"
        >
          <ThemedText type="small" className="text-muted-foreground text-xs">
            Discard
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
