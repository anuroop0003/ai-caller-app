import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useDiagnostics, type UseDiagnosticsResult } from '@/hooks/use-diagnostics';

import { DiagnosticsAlertBanner } from './diagnostics-alert-banner';
import { LanguageFilterTabs } from './language-filter-tabs';
import { SampleCard } from './sample-card';

interface DiagnosticsContentProps {
  diagnosticsHook?: UseDiagnosticsResult;
}

export function DiagnosticsContent({
  diagnosticsHook: externalHook,
}: DiagnosticsContentProps = {}) {
  const internalHook = useDiagnostics();
  const hook = externalHook ?? internalHook;

  const {
    activeFilter,
    setActiveFilter,
    filterTabs,
    filteredSamples,
    isTranscribing,
    transcribingSampleId,
    liveResults,
    benchmarkError,
    clearBenchmarkError,
    audioPlayer,
    handleTogglePlay,
    handleRunTest,
    metrics,
  } = hook;

  return (
    <View className="gap-3">
      {/* Language Filter Tabs */}
      <LanguageFilterTabs
        filterTabs={filterTabs}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Benchmark Error Banner */}
      {benchmarkError ? (
        <DiagnosticsAlertBanner
          type="error"
          title="Benchmark Error"
          message={benchmarkError}
          onDismiss={clearBenchmarkError}
        />
      ) : null}

      {/* Audio Playback notice if native audio is pending rebuild */}
      {audioPlayer.error ? (
        <DiagnosticsAlertBanner
          type="warning"
          title="Audio Playback Warning"
          message={audioPlayer.error}
        />
      ) : null}

      {/* Benchmark Summary Metrics (Displayed when at least one sample is tested) */}
      {metrics.testedCount > 0 ? (
        <View className="p-3 rounded-md bg-secondary/50 border border-border flex-row items-center justify-between">
          <ThemedText type="small" className="text-muted-foreground">
            Tested <ThemedText type="smallBold" className="text-foreground">{metrics.testedCount}</ThemedText> of {metrics.totalSamples} samples
          </ThemedText>
          {metrics.averageLatencyMs != null ? (
            <ThemedText type="code" className="text-emerald-600 dark:text-emerald-400">
              Avg Latency: {metrics.averageLatencyMs} ms
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {/* Voice Sample Cards List */}
      <View className="gap-3">
        {filteredSamples.map((sample) => (
          <SampleCard
            key={sample.id}
            sample={sample}
            isPlaying={
              audioPlayer.currentSample?.id === sample.id && audioPlayer.isPlaying
            }
            isTranscribing={isTranscribing && transcribingSampleId === sample.id}
            isPlaybackSupported={audioPlayer.isPlaybackSupported}
            liveTranscript={liveResults[sample.id]?.transcription.text}
            liveLatencyMs={liveResults[sample.id]?.latencyMs}
            liveTokensCount={liveResults[sample.id]?.transcription.tokens.length}
            onTogglePlay={handleTogglePlay}
            onRunTest={handleRunTest}
          />
        ))}
      </View>
    </View>
  );
}
