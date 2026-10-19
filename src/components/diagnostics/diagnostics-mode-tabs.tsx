import { type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export type DiagnosticsMode = 'stt' | 'tts' | 'llm';

export interface DiagnosticsModeTabsProps {
  activeMode: DiagnosticsMode;
  onSelectMode: (mode: DiagnosticsMode) => void;
}

interface DiagnosticsTabConfig {
  readonly id: DiagnosticsMode;
  readonly label: string;
  readonly icon: ComponentProps<typeof Ionicons>['name'];
  readonly accessibilityLabel: string;
  readonly activeColorDark: string;
  readonly activeColorLight: string;
}

const DIAGNOSTICS_TABS: readonly DiagnosticsTabConfig[] = [
  {
    id: 'stt',
    label: 'STT',
    icon: 'mic',
    accessibilityLabel: 'Speech recognition STT diagnostics',
    activeColorDark: '#60a5fa',
    activeColorLight: '#2563eb',
  },
  {
    id: 'tts',
    label: 'TTS',
    icon: 'volume-high',
    accessibilityLabel: 'Speech synthesis TTS diagnostics',
    activeColorDark: '#60a5fa',
    activeColorLight: '#2563eb',
  },
  {
    id: 'llm',
    label: 'LLM',
    icon: 'hardware-chip',
    accessibilityLabel: 'Local LLM benchmarks and dialogue generation',
    activeColorDark: '#a78bfa',
    activeColorLight: '#7c3aed',
  },
];

export function DiagnosticsModeTabs({ activeMode, onSelectMode }: DiagnosticsModeTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1 rounded-md bg-secondary/70 border border-border">
      {DIAGNOSTICS_TABS.map((tab) => {
        const isSelected = activeMode === tab.id;
        const iconColor = isSelected
          ? isDark
            ? tab.activeColorDark
            : tab.activeColorLight
          : isDark
            ? '#a1a1aa'
            : '#71717a';

        return (
          <Pressable
            key={`${tab.id}-mode-tab`}
            onPress={() => onSelectMode(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tab.accessibilityLabel}
            className={cn(
              'flex-1 py-2 px-1.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
              isSelected
                ? 'bg-card border border-border/80'
                : 'bg-transparent border border-transparent'
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
