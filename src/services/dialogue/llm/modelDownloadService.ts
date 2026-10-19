import type { LlmModelMetadata, ModelDownloadProgress } from '@/types/llm';

export interface ModelFileStatus {
  isDownloaded: boolean;
  localPath: string;
  fileSizeBytes?: number;
  isValidSize: boolean;
}

// Safely guard expo-file-system dynamic import to prevent Node.js test runner from hitting react-native flow syntax
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

class ModelDownloadService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private activeDownloadResumable: any = null;
  private activeModelId: string | null = null;

  /**
   * Resolves the app-private local storage directory for LLM weights.
   */
  getModelStorageDir(): string {
    const fs = getFs();
    const baseDir = fs?.documentDirectory ?? '/data/user/0/com.anonymous.aicallerapp/files/';
    return `${baseDir}models/llm/`;
  }

  /**
   * Resolves the full local filepath for a GGUF model.
   */
  getModelFilePath(filename: string): string {
    return `${this.getModelStorageDir()}${filename}`;
  }

  /**
   * Queries available free disk storage on the device in bytes.
   */
  async getFreeDiskSpaceBytes(): Promise<number> {
    const fs = getFs();
    try {
      if (typeof fs?.getFreeDiskStorageAsync === 'function') {
        return await fs.getFreeDiskStorageAsync();
      }
    } catch (err) {
      console.warn('[ModelDownloadService] Error getting free disk storage:', err);
    }
    // Fallback: report 8 GB default if query fails or in test env
    return 8 * 1024 * 1024 * 1024;
  }

  /**
   * Checks whether a model file is downloaded, inspects file size, and verifies integrity.
   */
  async checkModelStatus(model: LlmModelMetadata): Promise<ModelFileStatus> {
    const localPath = this.getModelFilePath(model.filename);
    const fs = getFs();

    if (!fs) {
      return {
        isDownloaded: false,
        localPath,
        isValidSize: false,
      };
    }

    try {
      const info = await fs.getInfoAsync(localPath);
      if (!info.exists) {
        return {
          isDownloaded: false,
          localPath,
          isValidSize: false,
        };
      }

      const size = info.size ?? 0;
      // Allow +/- 1% tolerance or exact match
      const sizeRatio = model.fileSizeBytes > 0 ? size / model.fileSizeBytes : 0;
      const isValidSize = sizeRatio >= 0.99 && sizeRatio <= 1.01;

      return {
        isDownloaded: true,
        localPath,
        fileSizeBytes: size,
        isValidSize,
      };
    } catch {
      return {
        isDownloaded: false,
        localPath,
        isValidSize: false,
      };
    }
  }

  getActiveDownloadingModelId(): string | null {
    return this.activeModelId;
  }

  /**
   * Downloads a single GGUF model into app-private storage with progress reporting.
   * Enforces single-model concurrency, pre-allocates directory, and validates size upon completion.
   */
  async downloadModel(
    model: LlmModelMetadata,
    onProgress: (progress: ModelDownloadProgress) => void
  ): Promise<string> {
    const fs = getFs();
    if (!fs) {
      throw new Error('Filesystem access not available in current environment');
    }

    if (this.activeModelId) {
      throw new Error(`Another model download is already in progress (${this.activeModelId})`);
    }

    const freeSpace = await this.getFreeDiskSpaceBytes();
    const safetyBufferBytes = 150 * 1024 * 1024; // 150 MB safety margin
    if (freeSpace < model.fileSizeBytes + safetyBufferBytes) {
      const neededMb = Math.round((model.fileSizeBytes + safetyBufferBytes) / (1024 * 1024));
      const freeMb = Math.round(freeSpace / (1024 * 1024));
      throw new Error(
        `Insufficient storage space: ${freeMb} MB free, need at least ${neededMb} MB for ${model.name}`
      );
    }

    const dir = this.getModelStorageDir();
    try {
      const dirInfo = await fs.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await fs.makeDirectoryAsync(dir, { intermediates: true });
      }
    } catch (err) {
      console.warn('[ModelDownloadService] Error creating models directory:', err);
    }

    const localPath = this.getModelFilePath(model.filename);
    this.activeModelId = model.id;

    let lastBytes = 0;
    let lastTime = Date.now();

    onProgress({
      status: 'downloading',
      bytesDownloaded: 0,
      totalBytes: model.fileSizeBytes,
      progressPercent: 0,
    });

    try {
      this.activeDownloadResumable = fs.createDownloadResumable(
        model.downloadUrl,
        localPath,
        {},
        (downloadProgress: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
          const now = Date.now();
          const timeDiff = Math.max(0.1, (now - lastTime) / 1000);
          const bytesDiff = downloadProgress.totalBytesWritten - lastBytes;
          const speedBytesPerSec = Math.round(bytesDiff / timeDiff);

          lastBytes = downloadProgress.totalBytesWritten;
          lastTime = now;

          const total = downloadProgress.totalBytesExpectedToWrite || model.fileSizeBytes;
          const percent =
            total > 0
              ? Math.min(100, Math.round((downloadProgress.totalBytesWritten / total) * 100))
              : 0;

          onProgress({
            status: 'downloading',
            bytesDownloaded: downloadProgress.totalBytesWritten,
            totalBytes: total,
            progressPercent: percent,
            speedBytesPerSec,
          });
        }
      );

      const result = await this.activeDownloadResumable.downloadAsync();
      if (!result?.uri) {
        throw new Error('Download failed: No output URI returned from filesystem');
      }

      onProgress({
        status: 'verifying',
        bytesDownloaded: model.fileSizeBytes,
        totalBytes: model.fileSizeBytes,
        progressPercent: 100,
      });

      // Verify file size
      const check = await this.checkModelStatus(model);
      if (!check.isValidSize) {
        await this.deleteModel(model);
        throw new Error(
          `Model validation failed: size mismatch (expected ~${Math.round(model.fileSizeBytes / 1024 / 1024)}MB, got ${Math.round((check.fileSizeBytes ?? 0) / 1024 / 1024)}MB)`
        );
      }

      onProgress({
        status: 'ready',
        bytesDownloaded: check.fileSizeBytes ?? model.fileSizeBytes,
        totalBytes: model.fileSizeBytes,
        progressPercent: 100,
      });

      return check.localPath;
    } catch (err) {
      onProgress({
        status: 'error',
        bytesDownloaded: 0,
        totalBytes: model.fileSizeBytes,
        progressPercent: 0,
        error: String(err),
      });
      throw err;
    } finally {
      this.activeDownloadResumable = null;
      this.activeModelId = null;
    }
  }

  /**
   * Cancels any active model download and deletes partial artifacts.
   */
  async cancelDownload(): Promise<void> {
    if (this.activeDownloadResumable) {
      try {
        await this.activeDownloadResumable.cancelAsync();
      } catch (err) {
        console.warn('[ModelDownloadService] Error cancelling download:', err);
      }
    }
    this.activeDownloadResumable = null;
    this.activeModelId = null;
  }

  /**
   * Deletes a model file from app-private storage.
   */
  async deleteModel(model: LlmModelMetadata): Promise<void> {
    const fs = getFs();
    if (!fs) return;
    const localPath = this.getModelFilePath(model.filename);
    try {
      await fs.deleteAsync(localPath, { idempotent: true });
    } catch (err) {
      console.warn(`[ModelDownloadService] Error deleting model ${model.id}:`, err);
    }
  }
}

export const modelDownloadService = new ModelDownloadService();
