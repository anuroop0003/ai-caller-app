import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ModelStatusCard } from '@/components/models';
import type { ModelCategory } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ModelRegistry } from '@/services/models';
import { cn } from '@/utils/cn';

import { ModelCategoryTabs } from './model-category-tabs';

export interface ModelDetailsContentProps {
  initialCategory?: ModelCategory;
  className?: string;
}

export function ModelDetailsContent({
  initialCategory = 'stt',
  className,
}: ModelDetailsContentProps = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeCategory, setActiveCategory] = useState<ModelCategory>(initialCategory);

  const modelsForCategory = ModelRegistry.getModelsByCategory(activeCategory);

  const categoryMeta = {
    stt: {
      title: 'Speech Recognition (STT)',
      description: 'Offline Sherpa-ONNX Conformer models for real-time speech transcribing.',
      icon: 'mic' as const,
      iconColor: isDark ? '#60a5fa' : '#2563eb',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/30',
    },
    tts: {
      title: 'Speech Synthesis (TTS)',
      description: 'Offline Piper VITS neural voice models and phonemizer assets.',
      icon: 'volume-high' as const,
      iconColor: isDark ? '#60a5fa' : '#2563eb',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/30',
    },
    llm: {
      title: 'Language Model (LLM)',
      description: 'Quantized GGUF conversational weights for on-device phone dialogue.',
      icon: 'hardware-chip' as const,
      iconColor: isDark ? '#a78bfa' : '#7c3aed',
      iconBg: 'bg-purple-500/10',
      iconBorder: 'border-purple-500/30',
    },
  }[activeCategory];

  const handleTestCategory = (category: ModelCategory) => {
    switch (category) {
      case 'stt':
        router.navigate({ pathname: '/diagnostics', params: { tab: 'stt' } });
        break;
      case 'tts':
        router.navigate({ pathname: '/diagnostics', params: { tab: 'tts' } });
        break;
      case 'llm':
        router.navigate({ pathname: '/diagnostics', params: { tab: 'llm' } });
        break;
    }
  };

  return (
    <View className={cn('gap-3.5', className)}>
      {/* Category Tabs: STT, TTS, LLM */}
      <ModelCategoryTabs activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* Category Overview Banner */}
      <View className="p-3.5 rounded-md bg-secondary/50 border border-border gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <View
              className={cn(
                'w-7 h-7 rounded-md items-center justify-center border',
                categoryMeta.iconBg,
                categoryMeta.iconBorder
              )}
            >
              <Ionicons name={categoryMeta.icon} size={14} color={categoryMeta.iconColor} />
            </View>
            <ThemedText type="smallBold" className="text-foreground">
              {categoryMeta.title}
            </ThemedText>
          </View>
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-card border border-border shrink-0">
            <ThemedText type="code" className="text-xs text-foreground leading-none">
              {modelsForCategory.length} {modelsForCategory.length === 1 ? 'Model' : 'Models'}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="muted" className="text-muted-foreground text-xs leading-4">
          {categoryMeta.description}
        </ThemedText>
      </View>

      {/* Models List for Active Tab */}
      <View className="gap-3">
        {modelsForCategory.map((model) => (
          <ModelStatusCard
            key={model.id}
            model={model}
            onTestModel={() => handleTestCategory(activeCategory)}
          />
        ))}
      </View>
    </View>
  );
}
