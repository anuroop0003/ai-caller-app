import { AppHeader, ScreenContainer } from '@/components/layout';
import { StudioContent } from '@/components/studio';

export default function SpeechStudioScreen() {
  return (
    <ScreenContainer
      header={<AppHeader subtitle="Malayalam Speech Studio" icon="mic" />}
      contentContainerStyle={{ gap: 16 }}>
      <StudioContent />
    </ScreenContainer>
  );
}
