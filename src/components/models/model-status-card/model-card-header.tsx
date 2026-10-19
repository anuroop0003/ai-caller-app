import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelCategory } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface ModelCardHeaderProps {
  category: ModelCategory;
  name: string;
  formattedTotalSize: string;
  filesCount: number;
}

export function ModelCardHeader({
  category,
  name,
  formattedTotalSize,
  filesCount,
}: ModelCardHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categoryIconMeta = {
    stt: {
      icon: 'mic' as const,
      color: isDark ? '#60a5fa' : '#2563eb',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Speech Recognition',
    },
    tts: {
      icon: 'volume-high' as const,
      color: isDark ? '#60a5fa' : '#2563eb',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Speech Synthesis',
    },
    llm: {
      icon: 'hardware-chip' as const,
      color: isDark ? '#a78bfa' : '#7c3aed',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      label: 'Dialogue LLM',
    },
  }[category];

  return (
    <View className="flex-row items-center gap-3">
      <View
        className={cn(
          'w-10 h-10 rounded-md items-center justify-center border',
          categoryIconMeta.bg,
          categoryIconMeta.border
        )}
      >
        <Ionicons name={categoryIconMeta.icon} size={20} color={categoryIconMeta.color} />
      </View>
      <View className="flex-1 justify-center">
        <ThemedText
          type="smallBold"
          themeColor="foreground"
          className="text-sm font-semibold"
          numberOfLines={1}
        >
          {name}
        </ThemedText>
        <ThemedText type="muted" className="text-xs mt-0.5">
          {formattedTotalSize} • {filesCount} {filesCount === 1 ? 'file' : 'files'}
        </ThemedText>
      </View>
    </View>
  );
}
