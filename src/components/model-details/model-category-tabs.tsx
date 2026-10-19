import { type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelCategory } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export type { ModelCategory };

export interface ModelCategoryTabsProps {
  activeCategory: ModelCategory;
  onSelectCategory: (category: ModelCategory) => void;
}

interface CategoryTabConfig {
  readonly id: ModelCategory;
  readonly label: string;
  readonly icon: ComponentProps<typeof Ionicons>['name'];
  readonly accessibilityLabel: string;
  readonly activeColorDark: string;
  readonly activeColorLight: string;
}

const CATEGORY_TABS: readonly CategoryTabConfig[] = [
  {
    id: 'stt',
    label: 'STT',
    icon: 'mic',
    accessibilityLabel: 'Speech recognition STT model inspection',
    activeColorDark: '#60a5fa',
    activeColorLight: '#2563eb',
  },
  {
    id: 'tts',
    label: 'TTS',
    icon: 'volume-high',
    accessibilityLabel: 'Speech synthesis TTS model inspection',
    activeColorDark: '#60a5fa',
    activeColorLight: '#2563eb',
  },
  {
    id: 'llm',
    label: 'LLM',
    icon: 'hardware-chip',
    accessibilityLabel: 'Text generation LLM model inspection',
    activeColorDark: '#a78bfa',
    activeColorLight: '#7c3aed',
  },
];

export function ModelCategoryTabs({ activeCategory, onSelectCategory }: ModelCategoryTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1 rounded-md bg-secondary/70 border border-border">
      {CATEGORY_TABS.map((tab) => {
        const isSelected = activeCategory === tab.id;
        const iconColor = isSelected
          ? isDark
            ? tab.activeColorDark
            : tab.activeColorLight
          : isDark
            ? '#a1a1aa'
            : '#71717a';

        return (
          <Pressable
            key={`${tab.id}-category-tab`}
            onPress={() => onSelectCategory(tab.id)}
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
