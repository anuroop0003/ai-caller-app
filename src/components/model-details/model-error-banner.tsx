import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface ModelErrorBannerProps {
  error?: string | null;
  className?: string;
}

export function ModelErrorBanner({ error, className }: ModelErrorBannerProps) {
  if (!error) return null;

  return (
    <View className={cn('p-3 rounded-md border border-amber-500/30 bg-amber-500/10', className)}>
      <ThemedText type="small" className="text-amber-600 dark:text-amber-400">
        {error}
      </ThemedText>
    </View>
  );
}
