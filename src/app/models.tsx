import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { ModelDetailsContent } from '@/components/model-details';

export default function ModelsScreen() {
  return (
    <ScreenContainer contentContainerStyle={{ paddingTop: 16, paddingBottom: 16, gap: 16 }}>
      <ScreenHeader
        title="Speech Models"
        description="On-device acoustic models and vocabulary files bundled with the application."
      />
      <ModelDetailsContent />
    </ScreenContainer>
  );
}
