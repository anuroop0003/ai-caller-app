import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface LlmActionButtonsProps {
  isBenchmarking: boolean;
  canBenchmark: boolean;
  isActiveCallEngine: boolean;
  isModelReady?: boolean;
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
  isModelReady = true,
  isDownloading = false,
  onApplyCallEngine,
  onRunBenchmark,
}: LlmActionButtonsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  const isActionDisabled = !canBenchmark || isBenchmarking || !isModelReady || isDownloading;

  return (
    <View className="flex-row items-center gap-2 pt-0.5">
      {/* Set / Apply as Call Screen Engine */}
      <Pressable
        key="llm-apply-engine-btn"
        disabled={isBenchmarking || isDownloading || !isModelReady}
        onPress={onApplyCallEngine}
        accessibilityRole="button"
        accessibilityLabel={
          !isModelReady
            ? 'Model missing on disk'
            : isActiveCallEngine
              ? 'Active conversational engine in live calls'
              : 'Set as active live call engine'
        }
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md border active:opacity-75',
          isActiveCallEngine
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-secondary text-secondary-foreground border border-border',
          (isBenchmarking || isDownloading || !isModelReady) && 'opacity-60'
        )}
      >
        <Ionicons
          name={isActiveCallEngine ? 'checkmark-circle' : 'call-outline'}
          size={16}
          color={isActiveCallEngine ? '#10b981' : isDark ? '#e4e4e7' : '#18181b'}
          style={{ marginRight: 4 }}
        />
        <ThemedText
          type={isActiveCallEngine ? 'smallBold' : 'small'}
          className={cn(
            isActiveCallEngine
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'text-secondary-foreground'
          )}
        >
          {isActiveCallEngine ? 'Active in Calls' : 'Set as Call Engine'}
        </ThemedText>
      </Pressable>

      {/* Primary Action: Run Benchmark Turn (Matches STT SampleCardActions) */}
      <Pressable
        key="llm-run-benchmark-btn"
        disabled={isActionDisabled}
        onPress={onRunBenchmark}
        accessibilityRole="button"
        accessibilityLabel={
          !isModelReady
            ? 'LLM model missing on disk'
            : isBenchmarking
              ? 'Generating prompt response'
              : 'Run LLM prompt benchmark'
        }
        className={cn(
          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-md bg-primary active:opacity-80',
          isActionDisabled && 'opacity-60'
        )}
      >
        {isBenchmarking || isDownloading ? (
          <ActivityIndicator
            size="small"
            color={primaryForeground}
            style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
          />
        ) : (
          <Ionicons
            name={!isModelReady ? 'warning-outline' : 'play'}
            size={!isModelReady ? 16 : 15}
            color={primaryForeground}
            style={{ marginRight: 4 }}
          />
        )}
        <ThemedText type="smallBold" className="text-primary-foreground font-semibold">
          {isDownloading
            ? 'Downloading...'
            : !isModelReady
              ? 'Model Missing'
              : isBenchmarking
                ? 'Generating...'
                : 'Run Test'}
        </ThemedText>
      </Pressable>
    </View>
  );
}
