import { ScreenContainer } from '@/components/layout';
import { StudioContent, StudioTopBar } from '@/components/studio';

export default function SpeechStudioScreen() {
  return (
    <ScreenContainer
      header={<StudioTopBar />}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 48, gap: 16 }}>
      <StudioContent />
    </ScreenContainer>
  );
}
