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

export function ModelCategoryTabs({ activeCategory, onSelectCategory }: ModelCategoryTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1 rounded-xl bg-secondary/70 border border-border">
      {/* Speech-to-Text (STT) Tab */}
      <Pressable
        key="stt-category-tab"
        onPress={() => onSelectCategory('stt')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeCategory === 'stt' }}
        accessibilityLabel="Speech recognition STT model inspection"
        className={cn(
          'flex-1 py-2 px-2.5 rounded-lg flex-row items-center justify-center gap-1.5 active:opacity-80',
          activeCategory === 'stt'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="mic"
          size={15}
          color={
            activeCategory === 'stt'
              ? isDark
                ? '#60a5fa'
                : '#2563eb'
              : isDark
                ? '#a1a1aa'
                : '#71717a'
          }
        />
        <ThemedText
          type={activeCategory === 'stt' ? 'smallBold' : 'small'}
          className={cn(
            'text-xs',
            activeCategory === 'stt' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          STT
        </ThemedText>
      </Pressable>

      {/* Text-to-Speech (TTS) Tab */}
      <Pressable
        key="tts-category-tab"
        onPress={() => onSelectCategory('tts')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeCategory === 'tts' }}
        accessibilityLabel="Speech synthesis TTS model inspection"
        className={cn(
          'flex-1 py-2 px-2.5 rounded-lg flex-row items-center justify-center gap-1.5 active:opacity-80',
          activeCategory === 'tts'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="volume-high"
          size={15}
          color={
            activeCategory === 'tts'
              ? isDark
                ? '#60a5fa'
                : '#2563eb'
              : isDark
                ? '#a1a1aa'
                : '#71717a'
          }
        />
        <ThemedText
          type={activeCategory === 'tts' ? 'smallBold' : 'small'}
          className={cn(
            'text-xs',
            activeCategory === 'tts' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          TTS
        </ThemedText>
      </Pressable>

      {/* Language Model (LLM) Tab */}
      <Pressable
        key="llm-category-tab"
        onPress={() => onSelectCategory('llm')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeCategory === 'llm' }}
        accessibilityLabel="Text generation LLM model inspection"
        className={cn(
          'flex-1 py-2 px-2.5 rounded-lg flex-row items-center justify-center gap-1.5 active:opacity-80',
          activeCategory === 'llm'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="sparkles"
          size={15}
          color={
            activeCategory === 'llm'
              ? isDark
                ? '#60a5fa'
                : '#2563eb'
              : isDark
                ? '#a1a1aa'
                : '#71717a'
          }
        />
        <ThemedText
          type={activeCategory === 'llm' ? 'smallBold' : 'small'}
          className={cn(
            'text-xs',
            activeCategory === 'llm' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          LLM
        </ThemedText>
      </Pressable>
    </View>
  );
}
