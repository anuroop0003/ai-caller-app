import type { FileVerificationItem, UnifiedModelPackage } from '@/constants/models';
import { FsAdapter } from './internal/fsAdapter';
import { ModelArchiveExtractor } from './internal/modelArchiveExtractor';

export class ModelFileService {
  /**
   * Resolves the app-private base storage directory.
   */
  static getBaseStorageDir(): string {
    return FsAdapter.getDocumentDirectory();
  }

  /**
   * Resolves the app-private directory for a specific model package.
   */
  static getModelDir(model: UnifiedModelPackage): string {
    const base = this.getBaseStorageDir();
    const cleanTarget = model.targetDirectory.replace(/^\/+/, '').replace(/\/+$/, '');
    return `${base}${cleanTarget}/`;
  }

  /**
   * Resolves the full path to a file inside the model directory.
   */
  static getFilePath(model: UnifiedModelPackage, relativePath: string): string {
    return `${this.getModelDir(model)}${relativePath}`;
  }

  /**
   * Queries free disk storage on the device in bytes.
   */
  static async getFreeDiskStorageBytes(): Promise<number> {
    return await FsAdapter.getFreeDiskStorageAsync();
  }

  /**
   * Checks file existence, size, and validity in app-private storage.
   */
  static async checkFile(
    localPath: string,
    expectedSizeBytes: number
  ): Promise<{ exists: boolean; sizeBytes: number; isValidSize: boolean }> {
    const info = await FsAdapter.getInfoAsync(localPath);
    if (!info.exists) {
      return { exists: false, sizeBytes: 0, isValidSize: false };
    }

    const size = info.size;
    // Accept file if within reasonable tolerance (or exact match, or config/json text size)
    const isConfigOrText = expectedSizeBytes < 100000;
    const isValidSize = isConfigOrText
      ? size > 0
      : expectedSizeBytes > 0
        ? size / expectedSizeBytes >= 0.98 && size / expectedSizeBytes <= 1.02
        : size > 0;

    return {
      exists: true,
      sizeBytes: size,
      isValidSize,
    };
  }

  /**
   * Helper to extract tar.bz2 / tar archives using native extraction.
   * Delegated to ModelArchiveExtractor.
   */
  static async extractArchiveIfPossible(archivePath: string, targetDir: string): Promise<boolean> {
    return await ModelArchiveExtractor.extractArchiveIfPossible(archivePath, targetDir);
  }

  /**
   * Verifies all required and optional files for a model package.
   */
  static async verifyModelFiles(model: UnifiedModelPackage): Promise<{
    isComplete: boolean;
    files: FileVerificationItem[];
    missingFiles: string[];
  }> {
    const results: FileVerificationItem[] = [];
    const missing: string[] = [];

    for (const spec of model.files) {
      const filePath = this.getFilePath(model, spec.relativePath);
      const status = await this.checkFile(filePath, spec.fileSizeBytes);

      // Check extracted folder if this entry is an archive (e.g. espeak-ng-data)
      let extractedExists = true;
      if (spec.isArchive && spec.extractedTargetDir) {
        const extractedDir = `${this.getModelDir(model)}${spec.extractedTargetDir}`;
        const dirInfo = await FsAdapter.getInfoAsync(extractedDir);
        extractedExists = dirInfo.exists && dirInfo.isDirectory;

        // If archive file is downloaded and valid on disk, but extracted folder is missing, auto-extract
        if (!extractedExists && status.exists && status.isValidSize) {
          const success = await this.extractArchiveIfPossible(filePath, this.getModelDir(model));
          if (success) {
            const recheck = await FsAdapter.getInfoAsync(extractedDir);
            extractedExists = recheck.exists && recheck.isDirectory;
          }
        }
      }

      const isValid = status.exists && status.isValidSize && (!spec.isArchive || extractedExists);

      results.push({
        filename: spec.filename,
        exists: status.exists,
        sizeBytes: status.sizeBytes,
        expectedSizeBytes: spec.fileSizeBytes,
        isValidSize: status.isValidSize,
        isRequired: spec.isRequired,
        isValid,
        localPath: filePath,
      });

      if (spec.isRequired && !isValid) {
        missing.push(spec.filename);
      }
    }

    return {
      isComplete: missing.length === 0,
      files: results,
      missingFiles: missing,
    };
  }

  /**
   * Safely deletes all files in the model package directory.
   */
  static async deleteModel(model: UnifiedModelPackage): Promise<void> {
    const modelDir = this.getModelDir(model);
    try {
      const info = await FsAdapter.getInfoAsync(modelDir);
      if (info.exists) {
        await FsAdapter.deleteAsync(modelDir, { idempotent: true });
      }
    } catch (err) {
      console.warn(`[ModelFileService] Failed to delete ${model.id}:`, err);
    }
  }
}
