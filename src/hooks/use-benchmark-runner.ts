import { useCallback, useRef, useState } from 'react';

import type { AudioTestSample } from '@/constants/audioTestSamples';
import {
  AudioBenchmarkService,
  type BenchmarkRunResult,
} from '@/services/speech/audioBenchmarkService';

export interface UseBenchmarkRunnerResult {
  isTranscribing: boolean;
  transcribingSampleId: string | null;
  liveResults: Record<string, BenchmarkRunResult>;
  benchmarkError: string | null;
  clearBenchmarkError: () => void;
  runBenchmark: (sample: AudioTestSample) => Promise<BenchmarkRunResult | undefined>;
  handleRunTest: (sample: AudioTestSample) => Promise<void>;
}

/**
 * Manages benchmark execution, transcription loading state, live results, and errors.
 * Includes a synchronous ref guard to prevent concurrent execution races.
 */
export function useBenchmarkRunner(): UseBenchmarkRunnerResult {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribingSampleId, setTranscribingSampleId] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<Record<string, BenchmarkRunResult>>({});
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  // Synchronous guard preventing concurrent benchmark runs before React re-renders
  const isRunningRef = useRef(false);

  const runBenchmark = useCallback(
    async (sample: AudioTestSample): Promise<BenchmarkRunResult | undefined> => {
      if (isRunningRef.current) {
        return;
      }

      isRunningRef.current = true;
      setIsTranscribing(true);
      setTranscribingSampleId(sample.id);
      setBenchmarkError(null);

      try {
        const result = await AudioBenchmarkService.runBenchmark(sample);
        setLiveResults((prev) => ({ ...prev, [sample.id]: result }));
        return result;
      } catch (err) {
        setBenchmarkError(err instanceof Error ? err.message : String(err));
      } finally {
        isRunningRef.current = false;
        setIsTranscribing(false);
        setTranscribingSampleId(null);
      }
    },
    []
  );

  const handleRunTest = useCallback(
    async (sample: AudioTestSample): Promise<void> => {
      await runBenchmark(sample);
    },
    [runBenchmark]
  );

  const clearBenchmarkError = useCallback(() => {
    setBenchmarkError(null);
  }, []);

  return {
    isTranscribing,
    transcribingSampleId,
    liveResults,
    benchmarkError,
    clearBenchmarkError,
    runBenchmark,
    handleRunTest,
  };
}
