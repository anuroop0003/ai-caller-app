import type { ModelFileEntry, UnifiedModelPackage } from '@/constants/models';
import { DownloadSpeedTracker } from './internal/downloadSpeedTracker';
import { type DownloadResumableInstance, FsAdapter } from './internal/fsAdapter';
import { ModelFileService } from './modelFileService';
import { ModelReadinessService } from './modelReadinessService';

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
  private activeDownloadResumable: DownloadResumableInstance | null = null;
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

  getActiveDownloadingModelId(): string | null {
    return this.activeModelId;
  }

  getModelStorageDir(category: 'llm' | 'stt' | 'tts' = 'llm'): string {
    return `${ModelFileService.getBaseStorageDir()}models/${category}/`;
  }

  getModelFilePath(filename: string): string {
    return `${this.getModelStorageDir('llm')}${filename}`;
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
   * Validates available device storage against package size with a 150MB safety buffer.
   */
  private async assertStorageAvailable(totalBytes: number): Promise<void> {
    const freeSpace = await ModelFileService.getFreeDiskStorageBytes();
    const requiredBuffer = totalBytes + 150 * 1024 * 1024; // 150MB margin
    if (freeSpace < requiredBuffer) {
      throw new Error(
        `Insufficient disk storage. Required: ${(requiredBuffer / (1024 * 1024)).toFixed(0)} MB, Available: ${(freeSpace / (1024 * 1024)).toFixed(0)} MB`
      );
    }
  }

  /**
   * Prepares the target storage directory for the model package.
   */
  private async prepareModelDirectory(model: UnifiedModelPackage): Promise<string> {
    const modelDir = ModelFileService.getModelDir(model);
    const dirInfo = await FsAdapter.getInfoAsync(modelDir);
    if (!dirInfo.exists) {
      await FsAdapter.makeDirectoryAsync(modelDir, { intermediates: true });
    }
    return modelDir;
  }

  /**
   * Downloads a single file from the remote URL with staging and progress tracking.
   */
  private async downloadSingleFile(
    spec: ModelFileEntry,
    model: UnifiedModelPackage,
    modelDir: string,
    tracker: DownloadSpeedTracker
  ): Promise<void> {
    const finalPath = ModelFileService.getFilePath(model, spec.relativePath);
    const tempPath = `${finalPath}.tmp`;

    // Fast path: skip if file already completely downloaded and valid on disk
    const check = await ModelFileService.checkFile(finalPath, spec.fileSizeBytes);
    if (check.exists && check.isValidSize) {
      tracker.addCompletedFileBytes(check.sizeBytes);
      return;
    }

    // Delete any leftover temp file
    try {
      const tempInfo = await FsAdapter.getInfoAsync(tempPath);
      if (tempInfo.exists) {
        await FsAdapter.deleteAsync(tempPath, { idempotent: true });
      }
    } catch {
      // Ignore cleanup error
    }

    const resumable = FsAdapter.createDownloadResumable(
      spec.remoteUrl,
      tempPath,
      {},
      (downloadProgress) => {
        const fileBytes = downloadProgress.totalBytesWritten ?? 0;
        const snapshot = tracker.update(fileBytes);

        this.updateProgress({
          status: 'downloading',
          bytesDownloaded: snapshot.bytesDownloaded,
          totalBytes: snapshot.totalBytes,
          progressPercent: snapshot.progressPercent,
          speedBytesPerSec: snapshot.speedBytesPerSec,
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
    await FsAdapter.moveAsync({
      from: tempPath,
      to: finalPath,
    });

    tracker.addCompletedFileBytes(spec.fileSizeBytes);

    // Extract archive if configured (e.g. espeak-ng-data)
    if (spec.isArchive && spec.extractedTargetDir) {
      await ModelFileService.extractArchiveIfPossible(finalPath, modelDir);
    }
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

    if (!FsAdapter.isAvailable()) {
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
      await this.assertStorageAvailable(model.totalSizeBytes);

      // 2. Ensure target directory exists
      const modelDir = await this.prepareModelDirectory(model);

      const tracker = new DownloadSpeedTracker(model.totalSizeBytes);

      // 3. Download each file
      for (let i = 0; i < model.files.length; i++) {
        if (this.cancelRequested) {
          throw new Error('Download cancelled by user.');
        }

        const spec = model.files[i];
        this.updateProgress({
          status: 'downloading',
          currentFilename: spec.filename,
          currentFileIndex: i + 1,
          totalFiles: model.files.length,
        });

        await this.downloadSingleFile(spec, model, modelDir, tracker);
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

      // Evict cached readiness and broadcast completion so all tabs sync
      ModelReadinessService.notifyModelChanged(model.id);

      return true;
    } catch (err) {
      const isCancelled = this.cancelRequested;
      this.updateProgress({
        status: isCancelled ? 'idle' : 'error',
        error: isCancelled ? undefined : err instanceof Error ? err.message : String(err),
      });
      ModelReadinessService.notifyModelChanged(model.id);
      return false;
    } finally {
      this.activeDownloadResumable = null;
      this.activeModelId = null;
      this.cancelRequested = false;
    }
  }

  /**
   * Cancels active download in flight.
   */
  async cancelDownload(): Promise<void> {
    const cancelledModelId = this.activeModelId;
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
    ModelReadinessService.notifyModelChanged(cancelledModelId ?? undefined);
  }
}

export const modelDownloadService = new ModelDownloadService();
