import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface RecorderStageProps {
  isRecording: boolean;
  recordingDurationSec: number;
  playbackDurationSec: number;
  hasRecordedAudio: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecorderStage({
  isRecording,
  recordingDurationSec,
  playbackDurationSec,
  hasRecordedAudio,
  onStartRecording,
  onStopRecording,
  className,
}: RecorderStageProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View
      className={cn(
        'p-4 rounded-md border border-border bg-secondary/40 items-center justify-center gap-3',
        className
      )}
    >
      {/* Large Timer Display */}
      <ThemedText
        type="h2"
        className={cn(
          'text-3xl font-mono tracking-wider',
          isRecording ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        )}
      >
        {isRecording
          ? formatDuration(recordingDurationSec)
          : hasRecordedAudio
            ? formatDuration(playbackDurationSec || recordingDurationSec)
            : '00:00'}
      </ThemedText>

      {/* Audio Waveform Indicators */}
      {isRecording ? (
        <View className="flex-row items-center gap-1 h-5">
          <View className="w-1 h-2 bg-red-500 rounded-full" />
          <View className="w-1 h-4 bg-red-500 rounded-full" />
          <View className="w-1 h-5 bg-red-500 rounded-full" />
          <View className="w-1 h-3 bg-red-500 rounded-full" />
          <View className="w-1 h-5 bg-red-500 rounded-full" />
          <View className="w-1 h-2 bg-red-500 rounded-full" />
        </View>
      ) : (
        <ThemedText type="muted" className="text-muted-foreground text-xs">
          {hasRecordedAudio
            ? 'Audio recorded and ready for transcription'
            : 'Tap the microphone to record speech'}
        </ThemedText>
      )}

      {/* Main Record / Stop Action Button */}
      <View className="flex-row items-center gap-4 mt-1">
        {isRecording ? (
          <Pressable
            onPress={onStopRecording}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            className="w-14 h-14 rounded-md bg-red-600 items-center justify-center shadow-sm active:opacity-85"
          >
            <Ionicons name="stop" size={24} color="#ffffff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={onStartRecording}
            accessibilityRole="button"
            accessibilityLabel="Start recording"
            className="w-14 h-14 rounded-md bg-primary items-center justify-center shadow-sm active:opacity-85"
          >
            <Ionicons name="mic" size={26} color={themeColors.primaryForeground} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
