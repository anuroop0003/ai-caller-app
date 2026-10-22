import { View } from 'react-native';

/**
 * Skeleton placeholder matching the exact content layout of the TTS Diagnostics tab.
 * Renders while native Android voice discovery and readiness are resolving.
 */
export function TtsTabSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Checking speech synthesis voices and readiness..."
      className="gap-3 opacity-90"
    >
      <View className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm">
        {/* 1. TTS Header: Speaker Icon + Language Name & Voice Meta */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-md bg-secondary animate-pulse" />
          <View className="flex-1 justify-center gap-1.5">
            <View className="h-4 w-48 rounded bg-secondary animate-pulse" />
            <View className="h-3 w-32 rounded bg-secondary animate-pulse" />
          </View>
        </View>

        {/* 2. Presets Selector Row */}
        <View className="gap-1.5">
          <View className="h-3 w-28 rounded bg-secondary animate-pulse" />
          <View className="flex-row gap-1.5">
            <View className="h-7 w-20 rounded-md bg-secondary animate-pulse" />
            <View className="h-7 w-24 rounded-md bg-secondary animate-pulse" />
            <View className="h-7 w-20 rounded-md bg-secondary animate-pulse" />
          </View>
        </View>

        {/* 3. Text Input Box Placeholder */}
        <View className="h-20 rounded-md bg-secondary/40 border border-border animate-pulse" />

        {/* 4. Action Buttons: Play Speech & Open Voice Settings */}
        <View className="flex-row items-center gap-2 pt-0.5">
          <View className="flex-1 h-9 rounded-md bg-secondary animate-pulse" />
          <View className="flex-1 h-9 rounded-md bg-secondary animate-pulse" />
        </View>
      </View>
    </View>
  );
}
