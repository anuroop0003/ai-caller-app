import { View } from 'react-native';

import { MissingModelFilesCard } from '@/components/models';
import { useLlmDiagnostics, type UseLlmDiagnosticsResult } from '@/hooks/use-llm-diagnostics';

import { LlmBenchmarkCard } from './llm';
import { LlmTabSkeleton } from './skeletons';

export interface DiagnosticsLlmContentProps {
  diagnosticsHook?: UseLlmDiagnosticsResult;
}

export function DiagnosticsLlmContent({
  diagnosticsHook: externalHook,
}: DiagnosticsLlmContentProps = {}) {
  const internalHook = useLlmDiagnostics();
  const hook = externalHook ?? internalHook;

  const { allMissingFiles, isCheckingInitialReadiness, modelCards } = hook;

  if (isCheckingInitialReadiness) {
    return <LlmTabSkeleton />;
  }

  return (
    <View className="gap-3">
      {/* 1. Missing Model Files Guard (Single card lists all missing files across LLM models) */}
      {allMissingFiles.length > 0 && (
        <MissingModelFilesCard
          category="llm"
          modelName="Qwen 2.5 (0.5B / 1.5B)"
          missingFiles={allMissingFiles}
        />
      )}

      {/* 2. Directly listed model benchmark cards */}
      <View className="gap-3">
        {modelCards.map((cardState) => (
          <LlmBenchmarkCard key={cardState.model.id} cardState={cardState} />
        ))}
      </View>
    </View>
  );
}
