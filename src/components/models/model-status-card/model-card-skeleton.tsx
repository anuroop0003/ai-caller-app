import { View } from 'react-native';

/**
 * Skeleton placeholder matching the exact layout and dimensions of ModelStatusCard.
 * Renders during the initial filesystem/readiness evaluation to prevent layout shift
 * and flickering between "not_downloaded" and "ready" states.
 */
export function ModelCardSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Checking model readiness..."
      className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm opacity-90"
    >
      {/* Header Row: Icon (Left) + Title/Subtitle (Right) */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-md bg-secondary animate-pulse" />
        <View className="flex-1 justify-center gap-1.5">
          <View className="h-4 w-44 rounded bg-secondary animate-pulse" />
          <View className="h-3 w-28 rounded bg-secondary animate-pulse" />
        </View>
      </View>

      {/* Description lines */}
      <View className="gap-1.5 py-0.5">
        <View className="h-3.5 w-full rounded bg-secondary/80 animate-pulse" />
        <View className="h-3.5 w-3/4 rounded bg-secondary/80 animate-pulse" />
      </View>

      {/* Metadata Badges row */}
      <View className="flex-row items-center gap-2">
        <View className="h-6 w-20 rounded-md bg-secondary animate-pulse" />
        <View className="h-6 w-16 rounded-md bg-secondary animate-pulse" />
        <View className="h-6 w-28 rounded-md bg-secondary animate-pulse" />
      </View>

      {/* Manifest files box placeholder */}
      <View className="rounded-md p-3 bg-secondary/30 border border-border gap-2">
        <View className="flex-row items-center justify-between pb-0.5">
          <View className="h-3 w-32 rounded bg-secondary animate-pulse" />
          <View className="h-3 w-16 rounded bg-secondary animate-pulse" />
        </View>
        <View className="h-3 w-48 rounded bg-secondary/80 animate-pulse my-0.5" />
        <View className="h-3 w-40 rounded bg-secondary/80 animate-pulse" />
      </View>

      {/* Bottom CTA Action Button */}
      <View className="h-9 w-full rounded-md bg-secondary animate-pulse mt-0.5" />
    </View>
  );
}
