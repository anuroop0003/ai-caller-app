import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type ModelCategory,
  type ModelReadinessResult,
  type UnifiedModelPackage,
} from '@/constants/models';
import { modelDownloadService, ModelReadinessService, ModelRegistry } from '@/services/models';

export function useModelReadiness(modelOrCategory: UnifiedModelPackage | ModelCategory | string) {
  const modelKey =
    typeof modelOrCategory === 'object' ? modelOrCategory.id : String(modelOrCategory);

  const [prevModelKey, setPrevModelKey] = useState(modelKey);
  const [readiness, setReadiness] = useState<ModelReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingInitialReadiness, setIsCheckingInitialReadiness] = useState(true);

  // Synchronous render-pass reset when modelKey changes to prevent 1-frame stale flashes
  if (prevModelKey !== modelKey) {
    setPrevModelKey(modelKey);
    setReadiness(null);
    setIsLoading(true);
    setIsCheckingInitialReadiness(true);
  }

  const isMountedRef = useRef(true);
  const activeRequestIdRef = useRef(0);

  const model = useMemo((): UnifiedModelPackage => {
    if (typeof modelOrCategory === 'object') return modelOrCategory;
    if (modelOrCategory === 'stt' || modelOrCategory === 'tts' || modelOrCategory === 'llm') {
      return ModelRegistry.getDefaultModel(modelOrCategory);
    }
    const found = ModelRegistry.getModelById(modelOrCategory);
    if (!found) {
      throw new Error(`[useModelReadiness] Unknown model or category: "${modelOrCategory}"`);
    }
    return found;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelKey]);

  const checkReadiness = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);

    try {
      const result = await ModelReadinessService.checkModelReadiness(model);
      if (isMountedRef.current && requestId === activeRequestIdRef.current) {
        setReadiness(result);
        setIsCheckingInitialReadiness(false);
      }
    } catch (err) {
      if (isMountedRef.current && requestId === activeRequestIdRef.current) {
        console.warn('[useModelReadiness] Check failed:', err);
        setReadiness({
          modelId: model.id,
          category: model.category,
          status: 'failed',
          isReady: false,
          storageLocation: 'none',
          resolvedPath: null,
          files: [],
          missingFiles: [],
          errorMessage: err instanceof Error ? err.message : String(err),
        });
        setIsCheckingInitialReadiness(false);
      }
    } finally {
      if (isMountedRef.current && requestId === activeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [model]);

  useEffect(() => {
    isMountedRef.current = true;
    void checkReadiness();
    return () => {
      isMountedRef.current = false;
    };
  }, [checkReadiness]);

  // Re-check readiness on terminal download transitions (ready, error, cancellation/idle) for this model
  useEffect(() => {
    let lastStatus = modelDownloadService.getCurrentState().status;

    const unsubscribe = modelDownloadService.subscribe((state) => {
      if (!isMountedRef.current) return;

      if (state.modelId === model.id && state.status !== lastStatus) {
        lastStatus = state.status;
        if (state.status === 'ready' || state.status === 'error' || state.status === 'idle') {
          void checkReadiness();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [model.id, checkReadiness]);

  return {
    readiness,
    isLoading,
    isCheckingInitialReadiness,
    isReady: readiness?.isReady ?? false,
    status: readiness?.status ?? 'not_downloaded',
    storageLocation: readiness?.storageLocation ?? 'none',
    missingFiles: readiness?.missingFiles ?? [],
    refreshReadiness: checkReadiness,
  };
}
