import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface LlmCallEngineBannerProps {
  engineName: string;
  engineType: string;
}

export function LlmCallEngineBanner({ engineName, engineType }: LlmCallEngineBannerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="p-3 rounded-md bg-secondary/50 border border-border flex-row items-center justify-between">
      <View className="flex-row items-center gap-2 flex-1 mr-2">
        <Ionicons name="call" size={14} color={isDark ? '#a78bfa' : '#7c3aed'} />
        <ThemedText type="small" className="text-muted-foreground" numberOfLines={1}>
          Live Call Engine:{' '}
          <ThemedText type="smallBold" className="text-foreground">
            {engineName}
          </ThemedText>
        </ThemedText>
      </View>

      <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border shrink-0">
        <ThemedText type="code" className="text-xs text-foreground leading-none">
          {engineType}
        </ThemedText>
      </View>
    </View>
  );
}
