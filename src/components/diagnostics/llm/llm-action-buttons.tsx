import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface LlmActionButtonsProps {
  isBenchmarking: boolean;
  canBenchmark: boolean;
  isActiveCallEngine: boolean;
  isDownloading?: boolean;
  needsDownload?: boolean;
  downloadLabel?: string;
  onApplyCallEngine: () => void;
  onRunBenchmark: () => void;
  onDownloadModel?: () => void;
}

export function LlmActionButtons({
  isBenchmarking,
  canBenchmark,
  isActiveCallEngine,
  isDownloading = false,
  needsDownload = false,
  downloadLabel = 'Download Model',
  onApplyCallEngine,
  onRunBenchmark,
  onDownloadModel,
}: LlmActionButtonsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {/* Set / Apply as Call Screen Engine */}
      <Pressable
        key="llm-apply-engine-btn"
        disabled={isBenchmarking || isDownloading}
        onPress={onApplyCallEngine}
        accessibilityRole="button"
        accessibilityLabel={
          isActiveCallEngine
            ? 'Active conversational engine in live calls'
            : 'Set as active live call engine'
        }
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
          isActiveCallEngine
            ? 'bg-purple-500/15 border-purple-500/30'
            : 'bg-secondary text-secondary-foreground border border-border',
          (isBenchmarking || isDownloading) && 'opacity-60'
        )}
      >
        <Ionicons
          name={isActiveCallEngine ? 'checkmark-circle' : 'call-outline'}
          size={16}
          color={
            isActiveCallEngine ? (isDark ? '#a78bfa' : '#7c3aed') : isDark ? '#e4e4e7' : '#18181b'
          }
          style={{ marginRight: 4 }}
        />
        <ThemedText
          type={isActiveCallEngine ? 'smallBold' : 'small'}
          className={cn(
            isActiveCallEngine
              ? 'text-purple-700 dark:text-purple-300 font-semibold'
              : 'text-secondary-foreground'
          )}
        >
          {isActiveCallEngine ? 'Active in Calls' : 'Set as Call Engine'}
        </ThemedText>
      </Pressable>

      {/* Primary Action: Download Model OR Run Benchmark Turn */}
      {needsDownload ? (
        <Pressable
          key="llm-download-btn"
          disabled={isDownloading}
          onPress={onDownloadModel}
          accessibilityRole="button"
          accessibilityLabel={downloadLabel}
          className={cn(
            'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md bg-primary active:opacity-80',
            isDownloading && 'opacity-60'
          )}
        >
          {isDownloading ? (
            <ActivityIndicator
              size="small"
              color={primaryForeground}
              style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
            />
          ) : (
            <Ionicons
              name="download-outline"
              size={16}
              color={primaryForeground}
              style={{ marginRight: 4 }}
            />
          )}
          <ThemedText type="smallBold" className="text-primary-foreground">
            {isDownloading ? 'Downloading...' : downloadLabel}
          </ThemedText>
        </Pressable>
      ) : (
        <Pressable
          key="llm-run-benchmark-btn"
          disabled={isBenchmarking || !canBenchmark}
          onPress={onRunBenchmark}
          accessibilityRole="button"
          accessibilityLabel="Run Sequential Benchmark"
          className={cn(
            'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md bg-primary active:opacity-80',
            (isBenchmarking || !canBenchmark) && 'opacity-60'
          )}
        >
          {isBenchmarking ? (
            <ActivityIndicator
              size="small"
              color={primaryForeground}
              style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
            />
          ) : (
            <Ionicons
              name="sparkles"
              size={16}
              color={primaryForeground}
              style={{ marginRight: 4 }}
            />
          )}
          <ThemedText type="smallBold" className="text-primary-foreground">
            {isBenchmarking ? 'Benchmarking...' : 'Run Benchmark Turn'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}
