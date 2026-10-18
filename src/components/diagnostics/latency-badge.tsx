import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

import { getLatencyBadge } from './benchmark-latency';

export interface LatencyBadgeProps {
  latencyMs: number;
  showCategory?: boolean;
  variant?: 'pill' | 'compact';
}

export function LatencyBadge({
  latencyMs,
  showCategory = true,
  variant = 'pill',
}: LatencyBadgeProps) {
  const config = getLatencyBadge(latencyMs, { showCategory });

  if (variant === 'compact') {
    return (
      <View className="flex-row items-center gap-1">
        <Ionicons name="flash" size={11} color={config.iconColor} />
        <ThemedText type="code" className={config.color}>
          {config.label}
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      className={cn(
        'px-2.5 py-1 rounded-md border flex-row items-center gap-1',
        config.bg,
        config.border
      )}
    >
      <Ionicons name="flash" size={12} color={config.iconColor} />
      <ThemedText type="code" className={config.color}>
        {config.label}
      </ThemedText>
    </View>
  );
}
