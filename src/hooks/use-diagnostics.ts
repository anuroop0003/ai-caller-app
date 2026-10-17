import { useCallback, useMemo } from 'react';

import { AUDIO_TEST_SAMPLES, type AudioTestSample } from '@/constants/audioTestSamples';
import { useBenchmarkRunner } from '@/hooks/use-benchmark-runner';
import { useDiagnosticSamples } from '@/hooks/use-diagnostic-samples';
import { useSampleAudioPlayer } from '@/hooks/use-sample-audio-player';
import type {
  BenchmarkMetrics,
  DiagnosticsFilterTab,
  DiagnosticsFilterType,
  UseDiagnosticsResult,
} from '@/types/diagnostics';
import { getBenchmarkMetrics } from '@/utils/benchmarkMetrics';

// Re-export types for backward compatibility across existing components
export type { BenchmarkMetrics, DiagnosticsFilterTab, DiagnosticsFilterType, UseDiagnosticsResult };

/**
 * Facade hook for the speech diagnostics screen.
 * Composes sample filtering, benchmark execution, audio playback, and metrics derivation.
 */
export function useDiagnostics(): UseDiagnosticsResult {
  const samples = useDiagnosticSamples();
  const benchmark = useBenchmarkRunner();
  const audioPlayer = useSampleAudioPlayer();

  const { currentSample, isPlaying, pause, play } = audioPlayer;

  const metrics = useMemo(
    () => getBenchmarkMetrics(benchmark.liveResults, AUDIO_TEST_SAMPLES.length),
    [benchmark.liveResults]
  );

  const handleTogglePlay = useCallback(
    async (sample: AudioTestSample) => {
      if (currentSample?.id === sample.id && isPlaying) {
        pause();
        return;
      }

      await play(sample);
    },
    [currentSample?.id, isPlaying, pause, play]
  );

  return {
    activeFilter: samples.activeFilter,
    setActiveFilter: samples.setActiveFilter,
    filterTabs: samples.filterTabs,
    filteredSamples: samples.filteredSamples,
    isTranscribing: benchmark.isTranscribing,
    transcribingSampleId: benchmark.transcribingSampleId,
    liveResults: benchmark.liveResults,
    benchmarkError: benchmark.benchmarkError,
    clearBenchmarkError: benchmark.clearBenchmarkError,
    handleRunTest: benchmark.handleRunTest,
    audioPlayer,
    handleTogglePlay,
    metrics,
  };
}
