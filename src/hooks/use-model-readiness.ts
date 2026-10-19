import { useCallback, useEffect, useState } from 'react';

import {
  type ModelCategory,
  type ModelReadinessResult,
  type UnifiedModelPackage,
} from '@/constants/models';
import { ModelReadinessService, ModelRegistry } from '@/services/models';
import { useModelDownload } from './use-model-download';

export function useModelReadiness(modelOrCategory: UnifiedModelPackage | ModelCategory | string) {
  const [readiness, setReadiness] = useState<ModelReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { downloadState } = useModelDownload();

  const resolveModel = useCallback((): UnifiedModelPackage => {
    if (typeof modelOrCategory === 'object') return modelOrCategory;
    if (modelOrCategory === 'stt' || modelOrCategory === 'tts' || modelOrCategory === 'llm') {
      return ModelRegistry.getDefaultModel(modelOrCategory);
    }
    const found = ModelRegistry.getModelById(modelOrCategory);
    return found ?? ModelRegistry.getDefaultModel('stt');
  }, [modelOrCategory]);

  const checkReadiness = useCallback(async () => {
    setIsLoading(true);
    try {
      const model = resolveModel();
      const result = await ModelReadinessService.checkModelReadiness(model);
      setReadiness(result);
    } catch (err) {
      console.warn('[useModelReadiness] Check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [resolveModel]);

  useEffect(() => {
    void checkReadiness();
  }, [checkReadiness]);

  // Re-check readiness when a download for this model finishes or errors
  useEffect(() => {
    const model = resolveModel();
    if (
      downloadState.modelId === model.id &&
      (downloadState.status === 'ready' ||
        downloadState.status === 'error' ||
        downloadState.status === 'idle')
    ) {
      void checkReadiness();
    }
  }, [downloadState.status, downloadState.modelId, resolveModel, checkReadiness]);

  return {
    readiness,
    isLoading,
    isReady: readiness?.isReady ?? false,
    status: readiness?.status ?? 'not_downloaded',
    storageLocation: readiness?.storageLocation ?? 'none',
    missingFiles: readiness?.missingFiles ?? [],
    refreshReadiness: checkReadiness,
  };
}
