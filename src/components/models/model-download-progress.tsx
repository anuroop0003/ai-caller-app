import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type ModelDownloadProgressState } from '@/services/models';

export interface ModelDownloadProgressProps {
  progressState: ModelDownloadProgressState;
  onCancel: () => void;
}

export function ModelDownloadProgress({ progressState, onCancel }: ModelDownloadProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isVerifying = progressState.status === 'verifying';
  const downloadedMb = (progressState.bytesDownloaded / (1024 * 1024)).toFixed(1);
  const totalMb = (progressState.totalBytes / (1024 * 1024)).toFixed(1);

  const speedStr = progressState.speedBytesPerSec
    ? `${(progressState.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
    : null;

  return (
    <View className="p-3.5 rounded-xl bg-card border border-border gap-2.5 my-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          {isVerifying ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Ionicons name="cloud-download-outline" size={18} color="#2563eb" />
          )}
          <ThemedText type="smallBold" className="text-foreground">
            {isVerifying ? 'Verifying File Integrity...' : 'Downloading Assets from Hugging Face'}
          </ThemedText>
        </View>

        {!isVerifying && (
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel model download"
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-md bg-secondary border border-border active:opacity-70"
          >
            <Ionicons name="close" size={14} color={isDark ? '#e4e4e7' : '#3f3f46'} />
            <ThemedText type="small" className="text-muted-foreground text-xs">
              Cancel
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Progress Track */}
      <View className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <View
          className="h-full bg-blue-600 rounded-full transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, progressState.progressPercent))}%` }}
        />
      </View>

      {/* Stats line */}
      <View className="flex-row items-center justify-between text-xs">
        <ThemedText type="small" className="text-muted-foreground text-xs">
          {progressState.currentFilename
            ? `File: ${progressState.currentFilename} (${progressState.currentFileIndex ?? 1}/${progressState.totalFiles ?? 1})`
            : `${progressState.progressPercent}% complete`}
        </ThemedText>

        <View className="flex-row items-center gap-2">
          {speedStr && (
            <ThemedText type="small" className="text-muted-foreground text-xs">
              {speedStr}
            </ThemedText>
          )}
          <ThemedText type="smallBold" className="text-foreground text-xs">
            {downloadedMb} / {totalMb} MB
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
