import { DiagnosticsContent } from '@/components/diagnostics';
import { AppHeader, ScreenContainer, ScreenHeader } from '@/components/layout';

export default function DiagnosticsScreen() {
  return (
    <ScreenContainer
      header={<AppHeader subtitle="Audio Diagnostics" icon="pulse" />}
      contentContainerStyle={{ gap: 16 }}
    >
      <ScreenHeader
        title="Voice Diagnostics"
        description="Benchmark on-device Malayalam speech recognition (STT) and speech synthesis (TTS)."
      />
      <DiagnosticsContent />
    </ScreenContainer>
  );
}
