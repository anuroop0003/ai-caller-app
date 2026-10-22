import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TtsHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TtsHeader({
  title = 'Android System Text-to-Speech',
  subtitle = 'On-Device Speech Synthesis • Hardware Accelerated',
}: TtsHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center gap-2.5">
      <View className="w-10 h-10 rounded-md items-center justify-center border bg-blue-500/10 border-blue-500/30 shrink-0">
        <Ionicons name="volume-high" size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
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
        <ThemedText type="muted" className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
          {subtitle}
        </ThemedText>
      </View>
    </View>
  );
}
