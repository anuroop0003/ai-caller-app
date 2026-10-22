import { View } from 'react-native';

import { ModelDownloadProgress } from '@/components/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { LlmModelCardState } from '@/hooks/use-llm-diagnostics';
import { formatFileSize } from '@/utils/format';

import { DiagnosticsAlertBanner } from '../diagnostics-alert-banner';
import { LlmActionButtons } from './llm-action-buttons';
import { LlmHeader } from './llm-header';
import { LlmMetricsPanel } from './llm-metrics-panel';
import { LlmPromptSection } from './llm-prompt-section';

export interface LlmBenchmarkCardProps {
  cardState: LlmModelCardState;
}

export function LlmBenchmarkCard({ cardState }: LlmBenchmarkCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    model,
    selectedPreset,
    inputText,
    isBenchmarking,
    benchmarkResult,
    benchmarkError,
    isModelReady,
    downloadState,
    isDownloading,
    isActiveCallEngine,
    onSelectPreset,
    onChangeInputText,
    onRunBenchmark,
    onApplyCallEngine,
    onCancelDownload,
    onDismissError,
  } = cardState;

  const formattedModelSize = formatFileSize(model.totalSizeBytes);

  return (
    <View className="rounded-md p-4 border border-border bg-card gap-3.5 shadow-sm">
      {/* 1. Model Specs Header */}
      <LlmHeader
        title={model.name}
        subtitle={`${model.quantization?.toUpperCase() ?? 'Q4_K_M'} • ${formattedModelSize} • Context ${model.contextLength ?? 2048}`}
        icon={model.id.includes('1.5b') ? 'sparkles' : 'hardware-chip'}
      />

      {/* 2. Download Progress Bar (When download active) */}
      {isDownloading && (
        <ModelDownloadProgress progressState={downloadState} onCancel={onCancelDownload} />
      )}

      {/* 3. Benchmark Error Banner (specific to this model card) */}
      {benchmarkError ? (
        <DiagnosticsAlertBanner
          type="error"
          title="Benchmark Error"
          message={benchmarkError}
          onDismiss={onDismissError}
        />
      ) : null}

      {/* 4. Prompt Presets & Editable Input */}
      <LlmPromptSection
        selectedPresetId={selectedPreset.id}
        inputText={inputText}
        onSelectPreset={onSelectPreset}
        onChangeText={onChangeInputText}
        isDark={isDark}
        disabled={isBenchmarking}
      />

      {/* 5. Metrics & Generation Output Panel */}
      <LlmMetricsPanel isBenchmarking={isBenchmarking} result={benchmarkResult} />

      {/* 6. Action Buttons: Set as Call Engine & Run Benchmark (Disabled with 'Model Missing' if unavailable) */}
      <LlmActionButtons
        isBenchmarking={isBenchmarking}
        canBenchmark={inputText.trim().length > 0}
        isModelReady={isModelReady}
        isActiveCallEngine={isActiveCallEngine}
        isDownloading={isDownloading}
        onApplyCallEngine={onApplyCallEngine}
        onRunBenchmark={onRunBenchmark}
      />
    </View>
  );
}
