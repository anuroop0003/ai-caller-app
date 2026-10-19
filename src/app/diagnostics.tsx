import { useLocalSearchParams } from 'expo-router';

import { DiagnosticsContent } from '@/components/diagnostics';
import type { DiagnosticsMode } from '@/components/diagnostics/diagnostics-mode-tabs';
import { AppHeader, ScreenContainer, ScreenHeader } from '@/components/layout';

export default function DiagnosticsScreen() {
  const params = useLocalSearchParams<{ tab?: DiagnosticsMode }>();
  const initialMode: DiagnosticsMode =
    params.tab === 'stt' || params.tab === 'tts' || params.tab === 'llm' ? params.tab : 'stt';

  return (
    <ScreenContainer
      header={<AppHeader subtitle="Audio Diagnostics" icon="pulse" />}
      contentContainerStyle={{ gap: 16 }}
    >
      <ScreenHeader
        title="Voice Diagnostics"
        description="Benchmark on-device Malayalam speech recognition (STT), speech synthesis (TTS), and local LLM."
      />
      <DiagnosticsContent key={initialMode} initialMode={initialMode} />
    </ScreenContainer>
  );
}
