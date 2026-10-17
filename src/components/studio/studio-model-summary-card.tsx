import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useModelInspection } from '@/hooks/use-model-inspection';
import { cn } from '@/utils/cn';

interface StudioModelSummaryCardProps {
  inspectionHook?: ReturnType<typeof useModelInspection>;
  className?: string;
}

export function StudioModelSummaryCard({
  inspectionHook: externalHook,
  className,
}: StudioModelSummaryCardProps) {
  const router = useRouter();
  const internalHook = useModelInspection();
  const modelInspection = externalHook ?? internalHook;

  const isInstalled =
    modelInspection.currentStatus === 'installed' ||
    modelInspection.currentStatus === 'validated';
  const statusLabel =
    modelInspection.loading && !modelInspection.inspection
      ? 'Checking...'
      : isInstalled
        ? 'Installed'
        : modelInspection.currentStatus === 'loading'
          ? 'Checking...'
          : 'Not installed';

  return (
    <View
      className={cn(
        'p-4 rounded-md border border-border bg-secondary/40 gap-3',
        className
      )}>
      {/* Model Name, Architecture & Status Badge */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <ThemedText type="smallBold" className="text-foreground font-semibold">
            {modelInspection.model.name}
          </ThemedText>
          <ThemedText type="muted" className="text-muted-foreground text-xs">
            {modelInspection.model.language} • {modelInspection.model.architecture}
          </ThemedText>
        </View>

        <View
          className={`px-2 py-0.5 rounded-md border ${isInstalled
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-red-500/10 border-red-500/20'
            }`}>
          <ThemedText
            type="code"
            className={
              isInstalled
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }>
            {statusLabel}
          </ThemedText>
        </View>
      </View>

      {/* Model Technical Tags */}
      <View className="flex-row flex-wrap gap-2">
        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground text-xs">
            16 kHz Mono
          </ThemedText>
        </View>
        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground text-xs">
            ARM INT8 Quantized
          </ThemedText>
        </View>
        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground text-xs">
            {modelInspection.storageSourceLabel}
          </ThemedText>
        </View>
      </View>

      {/* Navigation action to Models tab */}
      <Pressable
        onPress={() => router.navigate('/models')}
        accessibilityRole="button"
        accessibilityLabel="Inspect model assets in Models tab"
        className="mt-1 flex-row items-center justify-between px-3.5 py-2.5 rounded-md bg-card border border-border active:opacity-75">
        <ThemedText type="small" className="text-foreground font-medium">
          Inspect Model Assets & Files in Models Tab
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground text-xs font-medium">
          Go to Models →
        </ThemedText>
      </Pressable>
    </View>
  );
}
