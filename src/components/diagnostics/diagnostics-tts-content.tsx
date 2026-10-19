import { View } from 'react-native';

import { MissingModelFilesCard } from '@/components/models';
import { useModelReadiness } from '@/hooks/use-model-readiness';
import { TtsBenchmarkCard } from './tts-benchmark-card';

export function DiagnosticsTtsContent() {
  const { isReady, missingFiles, readiness } = useModelReadiness('tts');

  return (
    <View className="gap-3">
      {!isReady && missingFiles.length > 0 && (
        <MissingModelFilesCard
          category="tts"
          modelName={readiness?.modelId ?? 'Piper Meera (Malayalam)'}
          missingFiles={missingFiles}
        />
      )}
      <TtsBenchmarkCard isReady={isReady} />
    </View>
  );
}
