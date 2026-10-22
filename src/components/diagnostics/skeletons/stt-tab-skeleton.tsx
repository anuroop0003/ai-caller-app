import { View } from 'react-native';

/**
 * Skeleton placeholder matching the exact content layout of the STT Diagnostics tab.
 * Renders during initial model readiness and audio asset evaluation to prevent layout shift.
 */
export function SttTabSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Checking speech recognition readiness..."
      className="gap-3 opacity-90"
    >
      {/* 1. Language Filter Tabs Skeleton */}
      <View className="flex-row items-center gap-2 py-0.5">
        <View className="h-8 w-20 rounded-md bg-secondary animate-pulse" />
        <View className="h-8 w-28 rounded-md bg-secondary animate-pulse" />
        <View className="h-8 w-24 rounded-md bg-secondary animate-pulse" />
        <View className="h-8 w-20 rounded-md bg-secondary animate-pulse" />
      </View>

      {/* 2. Sample Cards List Skeletons */}
      <View className="gap-3">
        {[1, 2].map((key) => (
          <View
            key={`stt-sample-skeleton-${key}`}
            className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm"
          >
            {/* Sample Header: Speaker Avatar + Title & Meta */}
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-md bg-secondary animate-pulse" />
              <View className="flex-1 justify-center gap-1.5">
                <View className="h-4 w-44 rounded bg-secondary animate-pulse" />
                <View className="h-3 w-28 rounded bg-secondary animate-pulse" />
              </View>
            </View>

            {/* Transcription & Audio Preview Box */}
            <View className="rounded-md p-3 bg-secondary/30 border border-border gap-2">
              <View className="h-3 w-3/4 rounded bg-secondary/80 animate-pulse" />
              <View className="h-3 w-1/2 rounded bg-secondary/80 animate-pulse" />
            </View>

            {/* Action Buttons: Play Audio & Transcribe Button */}
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
