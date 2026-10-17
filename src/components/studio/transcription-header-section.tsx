import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface TranscriptionHeaderSectionProps {
  modelName?: string;
  className?: string;
}

export function TranscriptionHeaderSection({
  modelName = 'IndicConformer',
  className,
}: TranscriptionHeaderSectionProps) {
  return (
    <View className={cn('flex-row justify-between items-start gap-3', className)}>
      <View className="flex-1 gap-1">
        <ThemedText type="small" className="text-muted-foreground">
          On-Device STT
        </ThemedText>
        <ThemedText type="large" className="text-card-foreground">
          Transcript Converter
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground">
          IndicConformer Multilingual • 16 kHz
        </ThemedText>
      </View>

      {/* Model Badge */}
      <View className="px-2 py-0.5 rounded-md border bg-emerald-500/10 border-emerald-500/20">
        <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
          {modelName}
        </ThemedText>
      </View>
    </View>
  );
}
