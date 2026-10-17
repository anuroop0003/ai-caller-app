import type { BenchmarkRunResult } from '@/services/speech/audioBenchmarkService';
import type { BenchmarkMetrics } from '@/types/diagnostics';

/**
 * Calculates aggregate performance metrics across recorded benchmark runs.
 * Pure calculation with no React dependency for easy unit testing.
 */
export function getBenchmarkMetrics(
  results: Record<string, BenchmarkRunResult>,
  totalSamples: number
): BenchmarkMetrics {
  const resultsList = Object.values(results);
  const testedCount = resultsList.length;

  const averageLatencyMs =
    testedCount > 0
      ? Math.round(
        resultsList.reduce((acc, curr) => acc + curr.latencyMs, 0) / testedCount
      )
      : null;

  return {
    totalSamples,
    testedCount,
    averageLatencyMs,
  };
}
