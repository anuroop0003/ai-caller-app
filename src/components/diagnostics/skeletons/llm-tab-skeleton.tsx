import { View } from 'react-native';

/**
 * Skeleton placeholder matching the exact content layout of the LLM Diagnostics tab.
 * Renders two card skeletons while local LLM model metadata, storage, and readiness are being verified.
 */
export function LlmTabSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Checking local language model readiness..."
      className="gap-3 opacity-90"
    >
      <View className="gap-3">
        {[1, 2].map((key) => (
          <View
            key={`llm-card-skeleton-${key}`}
            className="rounded-md p-4 border border-border bg-card gap-3.5 shadow-sm"
          >
            {/* Model Specs Header */}
            <View className="flex-row items-center justify-between gap-2.5">
              <View className="flex-row items-center gap-2.5 flex-1">
                <View className="w-10 h-10 rounded-md bg-secondary animate-pulse" />
                <View className="flex-1 justify-center gap-1.5">
                  <View className="h-4 w-44 rounded bg-secondary animate-pulse" />
                  <View className="h-3 w-32 rounded bg-secondary animate-pulse" />
                </View>
              </View>
            </View>

            {/* Prompt Presets & Input Box */}
            <View className="gap-2.5">
              <View className="gap-1.5">
                <View className="h-3 w-24 rounded bg-secondary animate-pulse" />
                <View className="flex-row flex-wrap gap-1.5">
                  <View className="h-6 w-24 rounded-md bg-secondary animate-pulse" />
                  <View className="h-6 w-28 rounded-md bg-secondary animate-pulse" />
                  <View className="h-6 w-24 rounded-md bg-secondary animate-pulse" />
                </View>
              </View>
              <View className="h-16 rounded-md bg-secondary/40 border border-border animate-pulse" />
            </View>

            {/* Action Buttons: Set as Call Engine & Run Benchmark */}
            <View className="flex-row items-center gap-2 pt-0.5">
              <View className="flex-1 h-9 rounded-md bg-secondary animate-pulse" />
              <View className="flex-1 h-9 rounded-md bg-secondary animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
