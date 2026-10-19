import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ModelStatusCard } from '@/components/models';
import type { ModelCategory } from '@/constants/models';
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
  const [activeCategory, setActiveCategory] = useState<ModelCategory>(initialCategory);

  const modelsForCategory = ModelRegistry.getModelsByCategory(activeCategory);

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
    <View className={cn('gap-4', className)}>
      {/* Category Tabs: STT, TTS, LLM */}
      <ModelCategoryTabs activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* Explanatory Banner */}
      <View className="px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/60">
        <ThemedText type="small" className="text-muted-foreground text-xs leading-4">
          {activeCategory === 'stt' &&
            'Manage offline Malayalam Conformer speech recognition models downloaded from Hugging Face.'}
          {activeCategory === 'tts' &&
            'Manage offline Piper VITS neural speech synthesis and eSpeak-ng phonemizer assets.'}
          {activeCategory === 'llm' &&
            'Select and download quantized GGUF conversational models for on-device phone dialogue inference.'}
        </ThemedText>
      </View>

      {/* Models List for Active Tab */}
      <View className="gap-4">
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
