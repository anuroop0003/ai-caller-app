import { useMemo, useState } from 'react';

import { AUDIO_TEST_SAMPLES, type AudioTestSample } from '@/constants/audioTestSamples';
import type { DiagnosticsFilterTab, DiagnosticsFilterType } from '@/types/diagnostics';

export interface UseDiagnosticSamplesResult {
  activeFilter: DiagnosticsFilterType;
  setActiveFilter: (filter: DiagnosticsFilterType) => void;
  filterTabs: DiagnosticsFilterTab[];
  filteredSamples: AudioTestSample[];
}

/**
 * Manages language filters, tab counts, and filtered sample lists for audio diagnostics.
 * Completely independent of the STT engine or audio player.
 */
export function useDiagnosticSamples(
  initialFilter: DiagnosticsFilterType = 'all'
): UseDiagnosticSamplesResult {
  const [activeFilter, setActiveFilter] = useState<DiagnosticsFilterType>(initialFilter);

  const filteredSamples = useMemo(() => {
    return AUDIO_TEST_SAMPLES.filter((sample) => {
      if (activeFilter === 'all') return true;
      return sample.languageCode === activeFilter;
    });
  }, [activeFilter]);

  const filterTabs: DiagnosticsFilterTab[] = useMemo(
    () => [
      { id: 'all', label: 'All', count: AUDIO_TEST_SAMPLES.length },
      {
        id: 'ml',
        label: 'Malayalam',
        count: AUDIO_TEST_SAMPLES.filter((s) => s.languageCode === 'ml').length,
      },
      {
        id: 'manglish',
        label: 'Manglish',
        count: AUDIO_TEST_SAMPLES.filter((s) => s.languageCode === 'manglish').length,
      },
      {
        id: 'hi',
        label: 'Hindi',
        count: AUDIO_TEST_SAMPLES.filter((s) => s.languageCode === 'hi').length,
      },
      {
        id: 'ta',
        label: 'Tamil',
        count: AUDIO_TEST_SAMPLES.filter((s) => s.languageCode === 'ta').length,
      },
      {
        id: 'en',
        label: 'English',
        count: AUDIO_TEST_SAMPLES.filter((s) => s.languageCode === 'en').length,
      },
    ],
    []
  );

  return {
    activeFilter,
    setActiveFilter,
    filterTabs,
    filteredSamples,
  };
}
