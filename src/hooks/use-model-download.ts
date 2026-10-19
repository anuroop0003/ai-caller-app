import { useCallback, useEffect, useState } from 'react';

import type { UnifiedModelPackage } from '@/constants/models';
import { type ModelDownloadProgressState, modelDownloadService } from '@/services/models';

export function useModelDownload(targetModelId?: string) {
  const [downloadState, setDownloadState] = useState<ModelDownloadProgressState>(
    modelDownloadService.getCurrentState()
  );

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = modelDownloadService.subscribe((state) => {
      if (isMounted) {
        setDownloadState(state);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const startDownload = useCallback(async (model: UnifiedModelPackage) => {
    return await modelDownloadService.downloadModel(model);
  }, []);

  const cancelDownload = useCallback(async () => {
    await modelDownloadService.cancelDownload();
  }, []);

  const isTargetModel = targetModelId ? downloadState.modelId === targetModelId : true;

  return {
    downloadState,
    startDownload,
    cancelDownload,
    isDownloading:
      isTargetModel &&
      (downloadState.status === 'downloading' || downloadState.status === 'checking'),
    isVerifying: isTargetModel && downloadState.status === 'verifying',
    isCurrentModelActive:
      isTargetModel &&
      (downloadState.status === 'downloading' ||
        downloadState.status === 'checking' ||
        downloadState.status === 'verifying'),
  };
}
