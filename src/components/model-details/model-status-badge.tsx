import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getStatusBadgeConfig } from '@/constants/modelStatus';
import type { ModelInstallationStatus } from '@/types/speech';

interface ModelStatusBadgeProps {
  status: ModelInstallationStatus;
  size?: 'sm' | 'md';
}

export function ModelStatusBadge({
  status,
  size = 'md',
}: ModelStatusBadgeProps) {
  const config = getStatusBadgeConfig(status);
  const isSmall = size === 'sm';

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full border ${config.containerClass} ${isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1'
        }`}>
      <View className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <ThemedText
        type={isSmall ? 'code' : 'smallBold'}
        className={config.textClass}>
        {config.label}
      </ThemedText>
    </View>
  );
}
