import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

interface StudioHeroCardProps {
  className?: string;
}

export function StudioHeroCard({ className }: StudioHeroCardProps) {
  return (
    <View className={cn('gap-1', className)}>
      <ThemedText
        type="smallBold"
        className="text-xs text-muted-foreground uppercase tracking-wider">
        ON-DEVICE INTELLIGENCE
      </ThemedText>
      <ThemedText type="h2" className="text-foreground">
        Malayalam Speech Studio
      </ThemedText>
      <ThemedText type="muted" className="text-muted-foreground text-sm leading-5">
        Privacy-first on-device speech recognition powered by Sherpa-ONNX IndicConformer.
      </ThemedText>
    </View>
  );
}
