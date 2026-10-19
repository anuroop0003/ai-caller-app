import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelReadinessStatus } from '@/constants/models';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ModelCardActionsProps {
  modelName: string;
  formattedTotalSize: string;
  isReady: boolean;
  isDownloading: boolean;
  isDeleting: boolean;
  activeStatus: ModelReadinessStatus;
  storageLocation: 'app_storage' | 'bundled_asset' | 'none';
  hasLocalFiles: boolean;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onTest?: () => void;
}

export function ModelCardActions({
  modelName,
  formattedTotalSize,
  isReady,
  isDownloading,
  isDeleting,
  activeStatus,
  storageLocation,
  hasLocalFiles,
  onDownload,
  onCancel,
  onDelete,
  onTest,
}: ModelCardActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryForeground = isDark ? '#18181b' : '#fafafa';
  const destructiveColor = Colors[colorScheme ?? 'light'].destructive;

  const renderDeleteButton = () => (
    <Pressable
      onPress={onDelete}
      disabled={isDeleting}
      accessibilityRole="button"
      accessibilityLabel="Delete model files"
      className="h-9 flex-row items-center justify-center gap-1.5 px-3 rounded-md bg-secondary border border-border active:opacity-75"
    >
      {isDeleting ? (
        <ActivityIndicator
          size="small"
          color={destructiveColor}
          style={{ transform: [{ scale: 0.8 }] }}
        />
      ) : (
        <Ionicons name="trash-outline" size={14} color={destructiveColor} />
      )}
      <ThemedText type="smallBold" className="text-destructive text-xs">
        {isDeleting ? 'Removing...' : 'Remove'}
      </ThemedText>
    </Pressable>
  );

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {isReady ? (
        <>
          {onTest && (
            <Pressable
              onPress={onTest}
              accessibilityRole="button"
              accessibilityLabel="Run Diagnostics Test"
              className="flex-1 h-9 flex-row items-center justify-center gap-1.5 px-3 rounded-md border active:opacity-75 bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50"
            >
              <Ionicons name="play" size={14} color={isDark ? '#60a5fa' : '#2563eb'} />
              <ThemedText type="smallBold" className="text-blue-600 dark:text-blue-400 text-xs">
                Run Diagnostics Test
              </ThemedText>
            </Pressable>
          )}

          {storageLocation === 'app_storage' && renderDeleteButton()}
        </>
      ) : isDownloading ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel model download"
          className="flex-1 h-9 px-3 rounded-md bg-secondary border border-border flex-row items-center justify-center gap-1.5 active:opacity-80"
        >
          <Ionicons name="close" size={14} color={isDark ? '#e4e4e7' : '#18181b'} />
          <ThemedText type="smallBold" className="text-foreground text-xs">
            Cancel Download
          </ThemedText>
        </Pressable>
      ) : (
        <>
          <Pressable
            onPress={onDownload}
            accessibilityRole="button"
            accessibilityLabel={`Download ${modelName}`}
            className="flex-1 h-9 px-3 rounded-md bg-primary flex-row items-center justify-center gap-1.5 active:opacity-80"
          >
            <Ionicons name="download-outline" size={16} color={primaryForeground} />
            <ThemedText type="smallBold" className="text-primary-foreground text-xs">
              {activeStatus === 'incomplete'
                ? 'Repair & Redownload'
                : `Download (${formattedTotalSize})`}
            </ThemedText>
          </Pressable>

          {hasLocalFiles && storageLocation === 'app_storage' && renderDeleteButton()}
        </>
      )}
    </View>
  );
}
