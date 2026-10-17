import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface ModelHeaderSectionProps {
  name?: string;
  language?: string;
  architecture?: string;
  isInstalled: boolean;
  statusLabel: string;
  className?: string;
}

export function ModelHeaderSection({
  name = 'IndicConformer Malayalam',
  language = 'Malayalam',
  architecture = 'NeMo CTC',
  isInstalled,
  statusLabel,
  className,
}: ModelHeaderSectionProps) {
  return (
    <View className={cn('flex-row justify-between items-start gap-3', className)}>
      <View className="flex-1 gap-0.5">
        <ThemedText type="small" className="text-muted-foreground">
          Dedicated Speech Model
        </ThemedText>
        <ThemedText type="large" className="text-card-foreground">
          {name}
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground">
          {language} • {architecture}
        </ThemedText>
      </View>

      <View
        className={cn(
          'px-2 py-0.5 rounded-md border',
          isInstalled
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        )}>
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
  );
}
