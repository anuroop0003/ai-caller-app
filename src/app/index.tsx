import { AppHeader, ScreenContainer, ScreenHeader } from '@/components/layout';
import { StudioContent } from '@/components/studio';

export default function SpeechStudioScreen() {
  return (
    <ScreenContainer
      header={<AppHeader subtitle="Malayalam Speech Studio" icon="mic" />}
      contentContainerStyle={{ gap: 16 }}
    >
      <ScreenHeader
        title="Speech Studio"
        description="Record Malayalam voice audio and convert it to text in real time with on-device AI."
      />
      <StudioContent />
    </ScreenContainer>
  );
}
