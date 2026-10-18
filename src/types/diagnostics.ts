import type { AudioTestSample } from '@/constants/audioTestSamples';
import type { UseSampleAudioPlayerResult } from '@/hooks/use-sample-audio-player';
import type { BenchmarkRunResult } from '@/services/speech/audioBenchmarkService';

export type DiagnosticsFilterType = 'all' | 'ml' | 'manglish' | 'hi' | 'ta' | 'en';

export interface DiagnosticsFilterTab {
  id: DiagnosticsFilterType;
  label: string;
  count: number;
}

export interface BenchmarkMetrics {
  totalSamples: number;
  testedCount: number;
  averageLatencyMs: number | null;
}

export interface UseDiagnosticsResult {
  activeFilter: DiagnosticsFilterType;
  setActiveFilter: (filter: DiagnosticsFilterType) => void;
  filterTabs: DiagnosticsFilterTab[];
  filteredSamples: AudioTestSample[];
  isTranscribing: boolean;
  transcribingSampleId: string | null;
  liveResults: Record<string, BenchmarkRunResult>;
  benchmarkError: string | null;
  clearBenchmarkError: () => void;
  audioPlayer: UseSampleAudioPlayerResult;
  handleTogglePlay: (sample: AudioTestSample) => Promise<void>;
  handleRunTest: (sample: AudioTestSample) => Promise<void>;
  metrics: BenchmarkMetrics;
}
