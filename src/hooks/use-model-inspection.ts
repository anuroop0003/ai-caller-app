import { useCallback, useEffect, useRef, useState } from 'react';

import { getStatusBadgeConfig, type StatusBadgeConfig } from '@/constants/modelStatus';
import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
import { ModelFileService } from '@/services/speech';
import type {
  ModelInspectionResult,
  ModelInstallationStatus,
  SpeechModelMetadata,
} from '@/types/speech';
import {
  type DisplayedModelFile,
  getDisplayedModelFiles,
  getFolderContentsTitle,
  getStorageSourceLabel,
} from '@/utils/modelInspection.utils';

// Re-export presentation types and helpers for backward compatibility
export { getStatusBadgeConfig };
export type { StatusBadgeConfig, DisplayedModelFile };

export function useModelInspection(
  model: SpeechModelMetadata = DEFAULT_SPEECH_MODEL
) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspection, setInspection] = useState<ModelInspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const runInspection = useCallback(
    async (isRefresh: boolean) => {
      const requestId = ++requestIdRef.current;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await ModelFileService.inspectModelFiles(model);

        // Discard stale responses from previous or overlapping requests
        if (requestId !== requestIdRef.current) {
          return;
        }

        setInspection(result);
        setError(result.error ?? null);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [model]
  );

  useEffect(() => {
    setInspection(null);
    setError(null);
    setLoading(true);
    setRefreshing(false);

    void runInspection(false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [runInspection]);

  const isInitialLoading = loading && !inspection;

  const currentStatus: ModelInstallationStatus = isInitialLoading
    ? 'loading'
    : (inspection?.status ?? 'not_installed');

  const badgeConfig = getStatusBadgeConfig(currentStatus);
  const displayedFiles = getDisplayedModelFiles(model, inspection);
  const storageSourceLabel = getStorageSourceLabel(inspection, isInitialLoading);
  const folderContentsTitle = getFolderContentsTitle(inspection, isInitialLoading);

  const refresh = useCallback(() => {
    return runInspection(true);
  }, [runInspection]);

  return {
    model,
    loading,
    refreshing,
    inspection,
    error,
    currentStatus,
    badgeConfig,
    displayedFiles,
    storageSourceLabel,
    folderContentsTitle,
    refresh,
  };
}
