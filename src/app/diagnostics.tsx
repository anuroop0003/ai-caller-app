import { DiagnosticsContent } from '@/components/diagnostics';
import { ScreenContainer, ScreenHeader } from '@/components/layout';

export default function DiagnosticsScreen() {
  return (
    <ScreenContainer contentContainerStyle={{ paddingTop: 16, paddingBottom: 16, gap: 16 }}>
      <ScreenHeader
        title="Audio Diagnostics"
        description="Benchmark on-device transcription accuracy and latency across multi-lingual test samples."
      />
      <DiagnosticsContent />
    </ScreenContainer>
  );
}
