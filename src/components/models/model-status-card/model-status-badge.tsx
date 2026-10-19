import { ActivityIndicator, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ModelReadinessStatus } from '@/constants/models';

export interface ModelStatusBadgeProps {
  status: ModelReadinessStatus;
  missingFilesCount?: number;
}

export function ModelStatusBadge({ status, missingFilesCount = 0 }: ModelStatusBadgeProps) {
  switch (status) {
    case 'ready':
      return (
        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          <ThemedText
            type="smallBold"
            className="text-emerald-700 dark:text-emerald-400 text-xs leading-none"
          >
            Ready
          </ThemedText>
        </View>
      );
    case 'downloading':
      return (
        <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-blue-500/10 border border-blue-500/30">
          <ActivityIndicator
            size="small"
            color="#2563eb"
            style={{ transform: [{ scale: 0.65 }] }}
          />
          <ThemedText
            type="smallBold"
            className="text-blue-700 dark:text-blue-400 text-xs leading-none"
          >
            Downloading
          </ThemedText>
        </View>
      );
    case 'verifying':
      return (
        <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-purple-500/10 border border-purple-500/30">
          <ActivityIndicator
            size="small"
            color="#9333ea"
            style={{ transform: [{ scale: 0.65 }] }}
          />
          <ThemedText
            type="smallBold"
            className="text-purple-700 dark:text-purple-400 text-xs leading-none"
          >
            Verifying
          </ThemedText>
        </View>
      );
    case 'incomplete':
      return (
        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-amber-500/10 border border-amber-500/30">
          <ThemedText
            type="smallBold"
            className="text-amber-800 dark:text-amber-400 text-xs leading-none"
          >
            Incomplete ({missingFilesCount})
          </ThemedText>
        </View>
      );
    case 'failed':
      return (
        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-destructive/10 border border-destructive/30">
          <ThemedText type="smallBold" className="text-destructive text-xs leading-none">
            Failed
          </ThemedText>
        </View>
      );
    case 'not_downloaded':
    default:
      return (
        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border">
          <ThemedText
            type="small"
            className="text-muted-foreground text-xs font-medium leading-none"
          >
            Not Downloaded
          </ThemedText>
        </View>
      );
  }
}
