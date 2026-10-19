import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type ModelDownloadProgressState } from '@/services/models';
import { cn } from '@/utils/cn';

export interface ModelDownloadProgressProps {
  progressState: ModelDownloadProgressState;
  onCancel?: () => void;
}

export function ModelDownloadProgress({ progressState }: ModelDownloadProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isVerifying = progressState.status === 'verifying';
  const downloadedMb = (progressState.bytesDownloaded / (1024 * 1024)).toFixed(1);
  const totalMb = (progressState.totalBytes / (1024 * 1024)).toFixed(1);

  const speedStr = progressState.speedBytesPerSec
    ? `${(progressState.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
    : null;

  return (
    <View className="p-3.5 rounded-md bg-secondary/50 border border-border gap-2.5 my-1.5">
      {/* Header Row: Icon Tile + Title (left) | Progress Pill (right) */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View
            className={cn(
              'w-7 h-7 rounded-md items-center justify-center border',
              isVerifying
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            )}
          >
            {isVerifying ? (
              <ActivityIndicator
                size="small"
                color={isDark ? '#a78bfa' : '#7c3aed'}
                style={{ transform: [{ scale: 0.65 }] }}
              />
            ) : (
              <Ionicons
                name="cloud-download-outline"
                size={14}
                color={isDark ? '#60a5fa' : '#2563eb'}
              />
            )}
          </View>
          <ThemedText type="smallBold" themeColor="foreground">
            {isVerifying ? 'Verifying File Integrity' : 'Downloading Assets'}
          </ThemedText>
        </View>

        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border shrink-0">
          <ThemedText
            type="code"
            themeColor="foreground"
            className="text-xs font-semibold leading-none"
          >
            {progressState.progressPercent}%
          </ThemedText>
        </View>
      </View>

      {/* Current File / Description (Full width) */}
      <ThemedText
        type="muted"
        className="text-muted-foreground text-xs leading-4"
        numberOfLines={1}
      >
        {progressState.currentFilename
          ? `File (${progressState.currentFileIndex ?? 1}/${progressState.totalFiles ?? 1}): ${progressState.currentFilename}`
          : 'Connecting to Hugging Face model repository...'}
      </ThemedText>

      {/* Progress Track */}
      <View className="h-2 w-full rounded-md bg-secondary overflow-hidden">
        <View
          className="h-full bg-primary rounded-md"
          style={{ width: `${Math.min(100, Math.max(0, progressState.progressPercent))}%` }}
        />
      </View>

      {/* Stats Line */}
      <View className="flex-row items-center justify-between text-xs pt-0.5">
        {speedStr ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="speedometer-outline" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
            <ThemedText type="code" className="text-muted-foreground text-xs">
              {speedStr}
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="code" className="text-muted-foreground text-xs">
            Hugging Face CDN
          </ThemedText>
        )}

        <ThemedText type="code" themeColor="foreground" className="text-xs font-semibold">
          {downloadedMb} / {totalMb} MB
        </ThemedText>
      </View>
    </View>
  );
}
