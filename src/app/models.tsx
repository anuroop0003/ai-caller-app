import { useLocalSearchParams } from 'expo-router';

import { AppHeader, ScreenContainer, ScreenHeader } from '@/components/layout';
import { ModelDetailsContent } from '@/components/model-details';
import type { ModelCategory } from '@/constants/models';

export default function ModelsScreen() {
  const params = useLocalSearchParams<{ category?: ModelCategory }>();
  const initialCategory: ModelCategory =
    params.category === 'stt' || params.category === 'tts' || params.category === 'llm'
      ? params.category
      : 'stt';

  return (
    <ScreenContainer
      header={<AppHeader subtitle="Models & Asset Manager" icon="cube" />}
      contentContainerStyle={{ gap: 16 }}
    >
      <ScreenHeader
        title="Model Management"
        description="Single place to manage, download from Hugging Face, and verify readiness for offline STT, TTS, and LLM assets."
      />
      <ModelDetailsContent key={initialCategory} initialCategory={initialCategory} />
    </ScreenContainer>
  );
}
