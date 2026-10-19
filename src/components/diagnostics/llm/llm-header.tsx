import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ModelStatusBadge } from '@/components/models/model-status-card/model-status-badge';
import type { ModelReadinessStatus } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface LlmHeaderProps {
  title: string;
  subtitle: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  status?: ModelReadinessStatus | 'ready';
  missingFilesCount?: number;
}

export function LlmHeader({
  title,
  subtitle,
  icon = 'hardware-chip',
  status = 'ready',
  missingFilesCount = 0,
}: LlmHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center justify-between gap-2.5">
      <View className="flex-row items-center gap-2.5 flex-1">
        <View className="w-10 h-10 rounded-md items-center justify-center border bg-purple-500/10 border-purple-500/30 shrink-0">
          <Ionicons name={icon} size={20} color={isDark ? '#a78bfa' : '#7c3aed'} />
        </View>

        <View className="flex-1 justify-center">
          <ThemedText
            type="smallBold"
            themeColor="foreground"
            className="text-sm font-semibold"
            numberOfLines={1}
          >
            {title}
          </ThemedText>
          <ThemedText
            type="muted"
            className="text-muted-foreground text-xs mt-0.5"
            numberOfLines={1}
          >
            {subtitle}
          </ThemedText>
        </View>
      </View>

      <ModelStatusBadge status={status} missingFilesCount={missingFilesCount} />
    </View>
  );
}
