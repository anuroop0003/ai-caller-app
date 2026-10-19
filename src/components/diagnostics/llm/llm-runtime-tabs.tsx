import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export type SelectedEngineOption = 'deterministic' | 'qwen_0_5b' | 'qwen_1_5b';

export interface LlmRuntimeTabsProps {
  selectedEngine: SelectedEngineOption;
  onSelectEngine: (engine: SelectedEngineOption) => void;
  disabled?: boolean;
}

interface RuntimeTabConfig {
  readonly id: SelectedEngineOption;
  readonly label: string;
  readonly icon: 'flash' | 'hardware-chip' | 'sparkles';
  readonly accessibilityLabel: string;
}

const RUNTIME_TABS: readonly RuntimeTabConfig[] = [
  {
    id: 'deterministic',
    label: 'Deterministic',
    icon: 'flash',
    accessibilityLabel: 'Deterministic rule-based dialogue engine',
  },
  {
    id: 'qwen_0_5b',
    label: 'Qwen 0.5B',
    icon: 'hardware-chip',
    accessibilityLabel: 'Qwen 2.5 0.5B Instruct model',
  },
  {
    id: 'qwen_1_5b',
    label: 'Qwen 1.5B',
    icon: 'sparkles',
    accessibilityLabel: 'Qwen 2.5 1.5B Instruct model',
  },
];

export function LlmRuntimeTabs({
  selectedEngine,
  onSelectEngine,
  disabled = false,
}: LlmRuntimeTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1 rounded-md bg-secondary/70 border border-border">
      {RUNTIME_TABS.map((tab) => {
        const isSelected = selectedEngine === tab.id;
        const iconColor = isSelected
          ? isDark
            ? '#a78bfa'
            : '#7c3aed'
          : isDark
            ? '#a1a1aa'
            : '#71717a';

        return (
          <Pressable
            key={tab.id}
            onPress={() => !disabled && onSelectEngine(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tab.accessibilityLabel}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 px-1.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
              isSelected
                ? 'bg-card border border-border/80'
                : 'bg-transparent border border-transparent',
              disabled && 'opacity-60'
            )}
          >
            <Ionicons name={tab.icon} size={13} color={iconColor} />
            <ThemedText
              type={isSelected ? 'smallBold' : 'small'}
              className={cn(isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground')}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
