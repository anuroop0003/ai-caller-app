import type { UnifiedModelPackage } from '@/constants/models';
import { ModelFileService } from './modelFileService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedFs: any = null;
function getFs() {
  if (cachedFs) return cachedFs;
  if (typeof process !== 'undefined' && process.versions?.node) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedFs = require('expo-file-system/legacy');
    return cachedFs;
  } catch {
    return null;
  }
}

export type DownloadStateStatus =
  'idle' | 'checking' | 'downloading' | 'verifying' | 'ready' | 'error';

export interface ModelDownloadProgressState {
  status: DownloadStateStatus;
  modelId: string | null;
  bytesDownloaded: number;
  totalBytes: number;
  progressPercent: number;
  speedBytesPerSec?: number;
  currentFilename?: string;
  currentFileIndex?: number;
  totalFiles?: number;
  error?: string;
}

type ProgressListener = (state: ModelDownloadProgressState) => void;

class ModelDownloadService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private activeDownloadResumable: any = null;
  private activeModelId: string | null = null;
  private cancelRequested = false;
  private listeners = new Set<ProgressListener>();

  private currentState: ModelDownloadProgressState = {
    status: 'idle',
    modelId: null,
    bytesDownloaded: 0,
    totalBytes: 0,
    progressPercent: 0,
  };

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentState(): ModelDownloadProgressState {
    return this.currentState;
  }

  private updateProgress(partial: Partial<ModelDownloadProgressState>): void {
    this.currentState = { ...this.currentState, ...partial };
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentState);
      } catch (e) {
        console.error('[ModelDownloadService] Listener error:', e);
      }
    });
  }

  /**
   * Downloads all required files for a unified model package.
   */
  async downloadModel(model: UnifiedModelPackage): Promise<boolean> {
    if (this.activeModelId && this.activeModelId !== model.id) {
      throw new Error(
        `Another model download is already in progress: ${this.activeModelId}. Please wait or cancel.`
      );
    }

    const fs = getFs();
    if (!fs) {
      this.updateProgress({
        status: 'error',
        modelId: model.id,
        error: 'FileSystem module is not available in current environment.',
      });
      return false;
    }

    this.activeModelId = model.id;
    this.cancelRequested = false;

    this.updateProgress({
      status: 'checking',
      modelId: model.id,
      bytesDownloaded: 0,
      totalBytes: model.totalSizeBytes,
      progressPercent: 0,
      error: undefined,
    });

    try {
      // 1. Check storage space
      const freeSpace = await ModelFileService.getFreeDiskStorageBytes();
      const requiredBuffer = model.totalSizeBytes + 150 * 1024 * 1024; // 150MB margin
      if (freeSpace < requiredBuffer) {
        throw new Error(
          `Insufficient disk storage. Required: ${(requiredBuffer / (1024 * 1024)).toFixed(0)} MB, Available: ${(freeSpace / (1024 * 1024)).toFixed(0)} MB`
        );
      }

      // 2. Ensure target directory exists
      const modelDir = ModelFileService.getModelDir(model);
      const dirInfo = await fs.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await fs.makeDirectoryAsync(modelDir, { intermediates: true });
      }

      let cumulativeDownloaded = 0;
      let lastTimestamp = Date.now();
      let lastBytes = 0;

      // 3. Download each file
      for (let i = 0; i < model.files.length; i++) {
        if (this.cancelRequested) {
          throw new Error('Download cancelled by user.');
        }

        const spec = model.files[i];
        const finalPath = ModelFileService.getFilePath(model, spec.relativePath);
        const tempPath = `${finalPath}.tmp`;

        this.updateProgress({
          status: 'downloading',
          currentFilename: spec.filename,
          currentFileIndex: i + 1,
          totalFiles: model.files.length,
        });

        // Fast path: skip if file already completely downloaded and valid
        const check = await ModelFileService.checkFile(finalPath, spec.fileSizeBytes);
        if (check.exists && check.isValidSize) {
          cumulativeDownloaded += check.sizeBytes;
          continue;
        }

        // Delete any leftover temp file
        try {
          const tempInfo = await fs.getInfoAsync(tempPath);
          if (tempInfo.exists) {
            await fs.deleteAsync(tempPath, { idempotent: true });
          }
        } catch {
          // Ignore
        }

        const resumable = fs.createDownloadResumable(
          spec.remoteUrl,
          tempPath,
          {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (downloadProgress: any) => {
            const fileBytes = downloadProgress.totalBytesWritten ?? 0;
            const currentTotal = cumulativeDownloaded + fileBytes;
            const now = Date.now();
            const timeDiffSec = (now - lastTimestamp) / 1000;

            let speedBytesPerSec = this.currentState.speedBytesPerSec;
            if (timeDiffSec >= 0.5) {
              speedBytesPerSec = Math.round((currentTotal - lastBytes) / timeDiffSec);
              lastTimestamp = now;
              lastBytes = currentTotal;
            }

            const percent = Math.min(
              100,
              Math.round((currentTotal / Math.max(1, model.totalSizeBytes)) * 100)
            );

            this.updateProgress({
              status: 'downloading',
              bytesDownloaded: currentTotal,
              totalBytes: model.totalSizeBytes,
              progressPercent: percent,
              speedBytesPerSec,
            });
          }
        );

        this.activeDownloadResumable = resumable;
        const result = await resumable.downloadAsync();
        this.activeDownloadResumable = null;

        if (!result || !result.uri) {
          throw new Error(`Failed to download ${spec.filename}`);
        }

        // Atomic move from temp to final
        await fs.moveAsync({
          from: tempPath,
          to: finalPath,
        });

        cumulativeDownloaded += spec.fileSizeBytes;

        // Extract if archive (e.g. espeak-ng-data)
        if (spec.isArchive && spec.extractedTargetDir) {
          await this.extractArchiveIfPossible(finalPath, modelDir);
        }
      }

      // 4. Verification state
      this.updateProgress({
        status: 'verifying',
        progressPercent: 100,
      });

      const verification = await ModelFileService.verifyModelFiles(model);
      if (!verification.isComplete) {
        throw new Error(
          `Verification failed: missing files: ${verification.missingFiles.join(', ')}`
        );
      }

      this.updateProgress({
        status: 'ready',
        progressPercent: 100,
      });

      return true;
    } catch (err) {
      const isCancelled = this.cancelRequested;
      this.updateProgress({
        status: isCancelled ? 'idle' : 'error',
        error: isCancelled ? undefined : err instanceof Error ? err.message : String(err),
      });
      return false;
    } finally {
      this.activeDownloadResumable = null;
      this.activeModelId = null;
      this.cancelRequested = false;
    }
  }

  /**
   * Helper to extract tar.bz2 archives using react-native-sherpa-onnx if available.
   */
  private async extractArchiveIfPossible(archivePath: string, targetDir: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sherpa = require('react-native-sherpa-onnx');
      if (typeof sherpa?.extractArchive === 'function') {
        const cleanArchive = archivePath.replace(/^file:\/\//, '');
        const cleanTarget = targetDir.replace(/^file:\/\//, '');
        await sherpa.extractArchive(cleanArchive, cleanTarget, true, 0, 'model_extract');
      }
    } catch (e) {
      console.warn('[ModelDownloadService] Native extraction skipped/fallback:', e);
    }
  }

  /**
   * Cancels active download in flight.
   */
  async cancelDownload(): Promise<void> {
    this.cancelRequested = true;
    if (this.activeDownloadResumable) {
      try {
        await this.activeDownloadResumable.cancelAsync();
      } catch (err) {
        console.warn('[ModelDownloadService] Error cancelling download:', err);
      }
    }
    this.updateProgress({
      status: 'idle',
      error: undefined,
    });
    this.activeModelId = null;
  }
}

export const modelDownloadService = new ModelDownloadService();
