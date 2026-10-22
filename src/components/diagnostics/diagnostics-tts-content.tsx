import { View } from 'react-native';

import { useTtsBenchmark, type UseTtsBenchmarkResult } from '@/hooks/use-tts-benchmark';
import { TtsTabSkeleton } from './skeletons';
import { TtsBenchmarkCard } from './tts-benchmark-card';

export interface DiagnosticsTtsContentProps {
  benchmarkHook?: UseTtsBenchmarkResult;
}

export function DiagnosticsTtsContent({
  benchmarkHook: externalHook,
}: DiagnosticsTtsContentProps = {}) {
  const internalHook = useTtsBenchmark();
  const hook = externalHook ?? internalHook;

  if (hook.isLoadingVoices) {
    return <TtsTabSkeleton />;
  }

  return (
    <View className="gap-3">
      <TtsBenchmarkCard benchmarkHook={hook} />
    </View>
  );
}
