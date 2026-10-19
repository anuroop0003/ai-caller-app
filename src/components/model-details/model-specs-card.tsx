import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface ModelSpecsCardProps {
  modelType?: string;
  sampleRate?: number;
  storageSourceLabel: string;
  persona?: string;
  className?: string;
}

export function ModelSpecsCard({
  modelType = 'nemo_ctc',
  sampleRate = 16000,
  storageSourceLabel,
  persona,
  className,
}: ModelSpecsCardProps) {
  const samplingRateKhz = (sampleRate / 1000).toString();

  return (
    <View className={cn('p-3.5 rounded-md border border-border bg-secondary/60 gap-2', className)}>
      <View className="flex-row flex-wrap gap-2">
        {persona ? (
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Persona:{' '}
              <ThemedText type="small" className="text-foreground">
                {persona}
              </ThemedText>
            </ThemedText>
          </View>
        ) : null}

        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground">
            Layout:{' '}
            <ThemedText type="small" className="text-foreground">
              {modelType}
            </ThemedText>
          </ThemedText>
        </View>

        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground">
            Sampling:{' '}
            <ThemedText type="small" className="text-foreground">
              {samplingRateKhz} kHz Mono
            </ThemedText>
          </ThemedText>
        </View>

        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground">
            Format:{' '}
            <ThemedText type="small" className="text-foreground">
              ONNX Runtime
            </ThemedText>
          </ThemedText>
        </View>

        <View className="px-2.5 py-1 rounded-md bg-card border border-border">
          <ThemedText type="muted" className="text-muted-foreground">
            Storage:{' '}
            <ThemedText type="small" className="text-foreground">
              {storageSourceLabel}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
