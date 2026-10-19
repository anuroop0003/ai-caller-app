import { useCallback, useEffect, useState } from 'react';

import type { UnifiedModelPackage } from '@/constants/models';
import { type ModelDownloadProgressState, modelDownloadService } from '@/services/models';

export function useModelDownload() {
  const [downloadState, setDownloadState] = useState<ModelDownloadProgressState>(
    modelDownloadService.getCurrentState()
  );

  useEffect(() => {
    const unsubscribe = modelDownloadService.subscribe(setDownloadState);
    return unsubscribe;
  }, []);

  const startDownload = useCallback(async (model: UnifiedModelPackage) => {
    return await modelDownloadService.downloadModel(model);
  }, []);

  const cancelDownload = useCallback(async () => {
    await modelDownloadService.cancelDownload();
  }, []);

  return {
    downloadState,
    startDownload,
    cancelDownload,
    isDownloading: downloadState.status === 'downloading' || downloadState.status === 'checking',
    isVerifying: downloadState.status === 'verifying',
  };
}
