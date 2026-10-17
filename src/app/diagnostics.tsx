import { DiagnosticsContent } from '@/components/diagnostics';
import { AppHeader, ScreenContainer, ScreenHeader } from '@/components/layout';

export default function DiagnosticsScreen() {
  return (
    <ScreenContainer
      header={<AppHeader subtitle="Audio Diagnostics" icon="pulse" />}
      contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader
        title="Audio Diagnostics"
        description="Benchmark on-device transcription accuracy and latency across multi-lingual test samples."
      />
      <DiagnosticsContent />
    </ScreenContainer>
  );
}
